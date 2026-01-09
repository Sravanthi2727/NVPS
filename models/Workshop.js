const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    required: true,
    enum: ['upcoming', 'past'],
    index: true
  },
  category: {
    type: String,
    trim: true
  },
  meta: {
    tags: [String],
    duration: String,
    level: String
  },
  galleryImages: [String],
  isActive: {
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
workshopSchema.index({ type: 1, date: 1, displayOrder: 1 });

module.exports = mongoose.model('Workshop', workshopSchema);

