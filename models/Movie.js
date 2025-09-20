const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [0, 'Rating cannot be less than 0'],
    max: [10, 'Rating cannot be more than 10'],
    set: v => Math.round(v * 10) / 10
  },
  release_year: { type: Number, required: true },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for thumbnail URL
movieSchema.virtual('thumbnailUrl').get(function() {
  if (!this.imageUrl) return '';
  return this.imageUrl.replace('/upload/', '/upload/w_300,h_450,c_fill/');
});

module.exports = mongoose.model('Movie', movieSchema);