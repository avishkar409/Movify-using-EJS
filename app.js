const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();

// ========== Cloudinary Config ==========
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ========== Mongoose Setup ==========
mongoose.connect('mongodb://localhost:27017/movieDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ========== Mongoose Schema ==========
const movieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  cloudinaryId: { type: String },
  release_year: { type: Number }
});

const MovieModel = mongoose.model('Movie', movieSchema);

// ========== Multer Setup ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ========== Express Config ==========
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== Routes ==========

// Home Redirect
app.get('/', (req, res) => res.redirect('/movies'));

// Show Add Form
app.get('/add', (req, res) => {
  res.render('add');
});

// Add Movie
app.post('/add', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const movie = new MovieModel({
      name: req.body.name,
      genre: req.body.genre,
      rating: req.body.rating,
      description: req.body.description,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      release_year: req.body.release_year
    });
    await movie.save();
    fs.unlinkSync(req.file.path);
    res.redirect('/movies');
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).send('Failed to upload movie.');
  }
});

// Gemini AI Search Page
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.get('/gemini', async (req, res) => {
  const query = req.query.q || '';
  if (!query) return res.render('gemini_ai', { movies: [], prompt: '' });

  try {
    const allMovies = await MovieModel.find({});
    const movieList = allMovies.map(m => 
      `Title: ${m.name}, Genre: ${m.genre}, Rating: ${m.rating}, Year: ${m.release_year}, Description: ${m.description}`
    ).join('\n');

    const prompt = `
You are a helpful AI movie assistant.

User query: "${query}"

Here is a list of all available movies:
${movieList}

If relevant movies match the user query, list up to 5 of them with short reasons.

If nothing matches directly, provide interesting recommendations, trivia, or suggestions based on the user query.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const movieLines = text.split('\n').filter(line => line.trim() !== '');

    res.render('gemini_ai', { movies: movieLines, prompt: query });
  } catch (err) {
    console.error('❌ Gemini AI error:', err);
    res.status(500).send('Failed to search with Gemini AI');
  }
});


// List + Search + Filter
app.get('/movies', async (req, res) => {
  const searchTerm = req.query.search || '';
  const selectedGenre = req.query.genre || '';
  const query = {};

  if (searchTerm) query.name = { $regex: searchTerm, $options: 'i' };
  if (selectedGenre) query.genre = selectedGenre;

  try {
    const movies = await MovieModel.find(query).sort({ rating: -1 });
    res.render('index', { movies, searchTerm, selectedGenre });
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).send('Failed to fetch movies.');
  }
});

// Movie Details Page
app.get('/movies/:id', async (req, res) => {
  try {
    const movie = await MovieModel.findById(req.params.id);
    if (!movie) return res.status(404).send('Movie not found');
    res.render('movieDetail', { movie });
  } catch (err) {
    console.error('❌ Movie details error:', err);
    res.status(500).send('Error loading movie');
  }
});

// Show Edit Form
app.get('/movies/:id/edit', async (req, res) => {
  try {
    const movie = await MovieModel.findById(req.params.id);
    if (!movie) return res.status(404).send('Movie not found');
    res.render('editMovie', { movie });
  } catch (err) {
    console.error('❌ Edit fetch error:', err);
    res.status(500).send('Error fetching movie to edit');
  }
});

// Edit Movie Handler
app.post('/movies/:id/edit', upload.single('image'), async (req, res) => {
  try {
    const movie = await MovieModel.findById(req.params.id);
    if (!movie) return res.status(404).send('Movie not found');

    if (req.file) {
      if (movie.cloudinaryId) {
        await cloudinary.uploader.destroy(movie.cloudinaryId);
      }

      const result = await cloudinary.uploader.upload(req.file.path);
      movie.imageUrl = result.secure_url;
      movie.cloudinaryId = result.public_id;
      fs.unlinkSync(req.file.path);
    }

    movie.name = req.body.name;
    movie.genre = req.body.genre;
    movie.rating = req.body.rating;
    movie.description = req.body.description;
    movie.release_year = req.body.release_year;

    await movie.save();
    res.redirect('/movies/' + movie._id);
  } catch (err) {
    console.error('❌ Edit error:', err);
    res.status(500).send('Error updating movie');
  }
});

// Delete Movie
app.post('/movies/:id/delete', async (req, res) => {
  try {
    const movie = await MovieModel.findById(req.params.id);
    if (!movie) return res.status(404).send('Movie not found');

    if (movie.cloudinaryId) {
      await cloudinary.uploader.destroy(movie.cloudinaryId);
    }

    await MovieModel.findByIdAndDelete(req.params.id);
    res.redirect('/movies');
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).send('Failed to delete movie');
  }
});

// ========== Start Server ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
