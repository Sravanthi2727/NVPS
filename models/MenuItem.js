const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['cold', 'hot', 'manual-brew', 'shakes-tea', 'food'],
    index: true
  },
  subCategory: {
    type: String,
    required: true,
    enum: [
      // Coffee categories
      'robusta-cold-non-milk',
      'robusta-cold-milk',
      'robusta-hot-non-milk',
      'robusta-hot-milk',
      'blend-cold-non-milk',
      'blend-cold-milk',
      'blend-hot-non-milk',
      'blend-hot-milk',
      // Manual brew
      'cold-brew',
      'pour-over',
      // Shakes & Tea
      'shakes',
      'cold-tea',
      // Food
      'snacks-sides',
      'bagels-croissants'
    ],
    index: true
  },
  image: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  reviews: [{
    customer: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
menuItemSchema.index({ category: 1, subCategory: 1, displayOrder: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);

