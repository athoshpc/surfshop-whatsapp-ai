require("dotenv").config();

const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

app.use(express.json());

function getMessageText(message) {
  if (!message) {
    return null;
  }

  if (message.text?.body) {
    return message.text.body;
  }

  if (message.button?.text) {
    return message.button.text;
  }

  if (message.interactive?.button_reply?.title) {
    return message.interactive.button_reply.title;
  }

  if (message.interactive?.list_reply?.title) {
    return message.interactive.list_reply.title;
  }

  return null;
}

function logWhatsAppMessages(body) {
  const entries = body?.entry || [];

  for (const entry of entries) {
    const changes = entry?.changes || [];

    for (const change of changes) {
      const value = change?.value;
      const contacts = value?.contacts || [];
      const messages = value?.messages || [];

      for (const message of messages) {
        const contact = contacts.find((item) => item.wa_id === message.from);
        const senderName = contact?.profile?.name || null;
        const senderNumber = message.from || null;
        const messageType = message.type || "unknown";
        const messageText = getMessageText(message);

        console.log("WhatsApp message received:", {
          from: senderNumber,
          name: senderName,
          type: messageType,
          text: messageText
        });
      }
    }
  }
}

function getIncomingMessages(body) {
  const incomingMessages = [];
  const entries = body?.entry || [];

  for (const entry of entries) {
    const changes = entry?.changes || [];

    for (const change of changes) {
      const value = change?.value;
      const contacts = value?.contacts || [];
      const messages = value?.messages || [];

      for (const message of messages) {
        const contact = contacts.find((item) => item.wa_id === message.from);

        incomingMessages.push({
          id: message.id,
          from: message.from || null,
          name: contact?.profile?.name || null,
          type: message.type || "unknown",
          text: getMessageText(message)
        });
      }
    }
  }

  return incomingMessages;
}

async function sendWhatsAppTextMessage(to, body) {
  if (!accessToken || !phoneNumberId) {
    console.log("WhatsApp reply skipped: missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
    return;
  }

  const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      text: { body }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WhatsApp send failed: ${response.status} ${errorBody}`);
  }
}

app.get("/health", (_req, res) => {
  res.send("ok");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", (req, res) => {
  console.log("Received WhatsApp webhook event:", req.body);
  logWhatsAppMessages(req.body);
  res.sendStatus(200);

  const messages = getIncomingMessages(req.body);

  for (const message of messages) {
    if (message.type !== "text" || !message.from) {
      continue;
    }

    const replyText = `Recebi sua mensagem${message.name ? `, ${message.name}` : ""}: "${message.text || ""}"`;

    sendWhatsAppTextMessage(message.from, replyText)
      .then(() => {
        console.log("WhatsApp reply sent:", {
          to: message.from,
          text: replyText
        });
      })
      .catch((error) => {
        console.error("WhatsApp reply error:", error.message);
      });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
