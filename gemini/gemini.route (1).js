const express = require("express");
const router = express.Router();
const { geminiChat } = require("./gemini.controller");

router.post("/chat", geminiChat);

module.exports = router;
