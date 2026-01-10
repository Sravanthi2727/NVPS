const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true // Add index for faster lookups
  },
  displayName: String,
  email: { 
    type: String, 
    index: true // Add index for email lookups
  },
  photo: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Add index for sorting by creation date
  }
});

// Compound index for common queries
userSchema.index({ email: 1, googleId: 1 });

module.exports = mongoose.model('User', userSchema);

