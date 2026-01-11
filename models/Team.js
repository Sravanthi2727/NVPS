const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: '' // Initials like "RK" for Rajesh Kumar
  },
  social: {
    linkedin: String,
    twitter: String,
    instagram: String,
    github: String
  },
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
teamSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('Team', teamSchema);
