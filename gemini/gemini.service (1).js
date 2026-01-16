const { GoogleGenAI } = require("@google/genai");
const MenuItem = require("../models/MenuItem");
const Workshop = require("../models/Workshop");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// 🖤 Rabuste brand persona (unchanged)
const RABUSTE_PERSONA = `
You are "Rabuste AI", the official AI barista and concierge for Rabuste Coffee,
a premium Robusta-only café blending coffee, art, and technology.

Rules:
- ONLY answer questions related to Rabuste Coffee.
- Recommend ONLY items present in the menu context.
- Talk about workshops ONLY from the workshop context.
- Never invent menu items, prices, or events.
- If a user asks something unrelated, reply politely:
  "I'm here to help you with Rabuste Coffee ☕."

Tone:
- Warm
- Premium
- Knowledgeable barista
- Friendly Indian café vibe
`;

async function buildMenuContext() {
  const items = await MenuItem.find({ isAvailable: true })
    .sort({ displayOrder: 1 })
    .limit(40)
    .lean();

  if (!items.length) return "(No menu items available.)";

  return items
    .map(item => {
      const price = typeof item.price === "number" ? `₹${item.price}` : "price on menu";
      return `- ${item.name} (${item.category}, ${item.subCategory}) – ${price}: ${item.description || ""}`;
    })
    .join("\n");
}

async function buildWorkshopContext() {
  const workshops = await Workshop.find({ isActive: true })
    .sort({ date: 1 })
    .limit(15)
    .lean();

  if (!workshops.length) return "(No active workshops.)";

  return workshops
    .map(w => {
      const when = w.date ? new Date(w.date).toLocaleDateString("en-IN") : "TBA";
      return `- ${w.title} (${w.type}) on ${when}: ${w.description || ""}`;
    })
    .join("\n");
}

async function askGemini(userMessage) {
  try {
    const [menuContext, workshopContext] = await Promise.all([
      buildMenuContext(),
      buildWorkshopContext()
    ]);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "system",
          parts: [{ text: RABUSTE_PERSONA }]
        },
        {
          role: "system",
          parts: [{ text: `Rabuste Menu:\n${menuContext}` }]
        },
        {
          role: "system",
          parts: [{ text: `Rabuste Workshops:\n${workshopContext}` }]
        },
        {
          role: "user",
          parts: [{ text: userMessage }]
        }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("Gemini error:", error);
    throw new Error("Gemini failed");
  }
}

module.exports = { askGemini };


