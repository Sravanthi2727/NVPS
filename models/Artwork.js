const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['painting', 'photography', 'sculpture', 'digital'],
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  medium: {
    type: String,
    trim: true
  },
  dimensions: {
    type: String,
    trim: true
  },
  availability: {
    type: String,
    enum: ['In Stock', 'Limited Edition', 'One of a kind', 'Open Edition', 'Sold Out'],
    default: 'In Stock'
  },
  shipping: {
    type: String,
    trim: true
  },
  editionInfo: {
    type: String,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
artworkSchema.index({ category: 1, displayOrder: 1 });

module.exports = mongoose.model('Artwork', artworkSchema);

