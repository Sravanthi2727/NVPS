const mongoose = require('mongoose');

const franchiseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional because non-logged users can also apply
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  investmentRange: {
    type: String,
    required: true,
    enum: ['$50K - $75K', '$75K - $100K', '$100K - $150K', '$150K - $200K', '$200K+']
  },
  expectedTimeline: {
    type: String,
    required: true,
    enum: ['3-6 months', '6-12 months', '1-2 years', '2+ years']
  },
  businessExperience: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under-review'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
franchiseSchema.index({ email: 1 });
franchiseSchema.index({ userId: 1 });
franchiseSchema.index({ status: 1 });
franchiseSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Franchise', franchiseSchema);