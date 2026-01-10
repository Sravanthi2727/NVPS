const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
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
  workshopName: String,
  date: String,
  status: {
    type: String,
    enum: ['registered', 'cancelled'],
    default: 'registered'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Workshop', workshopSchema);
