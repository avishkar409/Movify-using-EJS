const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genre: { type: String, required: true },
  rating: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  cloudinaryId: { type: String },

  release_year: { type: Number, required: true }
});

const MovieModel = mongoose.model('Movie', movieSchema);

module.exports = MovieModel;
