const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    index: true // Add index for faster lookups
  },
  name: {
    type: String,
    required: true,
    index: true // Add index for name lookups
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    index: true // Add index for email lookups
  },
  password: String,
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  registered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Add index for sorting by creation date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for common queries
userSchema.index({ email: 1, googleId: 1 });

module.exports = mongoose.model('User', userSchema);

