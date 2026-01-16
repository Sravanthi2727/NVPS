const { askGemini } = require("./gemini.service");
const ChatMessage = require("../models/ChatMessage");

const geminiChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const reply = await askGemini(message);

    // Log this chat exchange to MongoDB (do not block response on errors)
    try {
      await ChatMessage.create({
        userId: req.user ? req.user._id : null,
        sessionId: req.sessionID,
        userMessage: message,
        aiReply: reply
      });
    } catch (logErr) {
      console.error("Failed to log Gemini chat:", logErr);
    }

    return res.json({ reply });
  } catch (err) {
    console.error("Gemini chat error:", err);
    return res.status(500).json({
      error: err?.message || "Gemini failed"
    });
  }
};

module.exports = { geminiChat };
