const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "violet_verify_token";

/* ===== HOME ===== */
app.get("/", (req, res) => {
  res.send("Violet is awake 💜");
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
      const userText = event.message.text.toLowerCase();

      const reply = generateReply(userText);
      await sendMessage(senderId, reply);
    }
  }

  res.status(200).send("EVENT_RECEIVED");
});

/* ===== AI-STYLE LOGIC ===== */
function generateReply(text) {
  if (["hi", "hello", "hey", "yo"].some(w => text.includes(w))) {
    return "Hey 💜 I’m Violet. How can I help you today?";
  }

  if (text.includes("help")) {
    return (
      "Here’s what I can do 💜\n" +
      "• Say hi 👋\n" +
      "• Tell you about Violet\n" +
      "• Answer basic questions\n" +
      "Try typing *about*"
    );
  }

  if (text.includes("about")) {
    return (
      "💜 Violet Bot\n" +
      "A smart Messenger assistant built by Daniel.\n" +
      "I’m still learning, but I’m always awake ✨"
    );
  }

  if (text.includes("who made you") || text.includes("creator")) {
    return "I was created by Daniel 🚀💜";
  }

  // Smart fallback
  return (
    "I’m listening 💜\n" +
    "Try typing *help* to see what I can do."
  );
}

/* ===== SEND MESSAGE ===== */
async function sendMessage(senderId, text) {
  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: { text }
    })
  });
}

/* ===== START ===== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Violet is running 💜"));
