const mongoose = require('mongoose');

const backgroundImageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  imagePath: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  page: {
    type: String,
    required: true,
    enum: ['menu', 'home', 'about', 'gallery', 'philosophy', 'workshops', 'franchise']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one active background per page
backgroundImageSchema.pre('save', async function(next) {
  if (this.isActive) {
    // Deactivate all other backgrounds for this page
    await this.constructor.updateMany(
      { page: this.page, _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('BackgroundImage', backgroundImageSchema);