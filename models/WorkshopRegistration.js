const mongoose = require('mongoose');

const workshopRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workshopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    required: true
  },
  workshopName: {
    type: String,
    required: true
  },
  workshopDate: {
    type: Date,
    required: true
  },
  participantName: {
    type: String,
    required: true
  },
  participantEmail: {
    type: String,
    required: true
  },
  participantPhone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['registered', 'confirmed', 'cancelled', 'completed'],
    default: 'registered'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
workshopRegistrationSchema.index({ userId: 1, workshopId: 1 });
workshopRegistrationSchema.index({ status: 1, workshopDate: 1 });

module.exports = mongoose.model('WorkshopRegistration', workshopRegistrationSchema);