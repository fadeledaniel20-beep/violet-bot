const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// I have inserted your tokens here as requested 💜
const PAGE_ACCESS_TOKEN = "EAAfbbSbPCAABQYYg9fYjbZA7U5as0qTssvCZAjmmNrOQgpNPHJyFybGIdfnE1iZBhStk1py11Umg7c0NguuFhg8k2Ta4xEgCptAbqdFiQ4BxudTbxTCFWcdBZASNOQhiMVpdx3XwW43Qs3NZCcqJxDSH2ceFgu6AeY2xqPuEnaGXDPACNiJ4NEEB8981C1qUcwbbP26DUmwZDZD";
const GROQ_API_KEY = "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";
const VERIFY_TOKEN = "violet_verify_token";

/* ===== HOME ===== */
app.get("/", (req, res) => {
  res.send("Violet is awake and smart 💜");
});

/* ===== WEBHOOK VERIFY ===== */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/* ===== RECEIVE MESSAGES ===== */
app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (body.object !== "page") {
    return res.sendStatus(404);
  }

  for (const entry of body.entry) {
    for (const event of entry.messaging) {
      if (!event.message || !event.message.text) continue;

      const senderId = event.sender.id;
      const userText = event.message.text;

      // Violet starts thinking here
      const reply = await getGroqReply(userText);
      await sendMessage(senderId, reply);
    }
  }

  res.status(200).send("EVENT_RECEIVED");
});

/* ===== VIOLET'S AI BRAIN (GROQ) ===== */
async function getGroqReply(userText) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "You are Violet, a smart and friendly AI assistant created by Daniel. You are helpful, polite, and use purple heart emojis (💜) in your responses." 
          },
          { role: "user", content: userText }
        ]
      })
    });

    const data = await response.json();
    
    // Check if the API returned a valid message
    if (data.choices && data.choices[0]) {
        return data.choices[0].message.content;
    } else {
        return "I'm connected, but I couldn't process that thought. Try again? 💜";
    }
    
  } catch (error) {
    console.error("Groq Error:", error);
    return "My brain is a bit fuzzy right now, Daniel's bot is still learning! 💜";
  }
}

/* ===== SEND MESSAGE TO MESSENGER ===== */
async function sendMessage(senderId, text) {
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: senderId },
        message: { text }
      })
    });
    const result = await res.json();
    if (result.error) console.error("Messenger API Error:", result.error);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

/* ===== START THE ENGINE ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Violet is running on port " + PORT + " 💜"));
