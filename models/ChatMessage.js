const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userMessage: {
      type: String,
      required: true,
      trim: true,
    },
    aiReply: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: 'gemini',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
