require("dotenv").config();

const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

const boardTypeMap = {
  "1": "longboard",
  "2": "pranchinha",
  "3": "fish",
  "4": "fun"
};

const boardCatalog = {
  longboard: [
    "Longboard 9'0",
    "Longboard 9'2",
    "Longboard 9'4"
  ],
  pranchinha: [
    "Pranchinha 5'10",
    "Pranchinha 6'0",
    "Pranchinha 6'1"
  ],
  fish: [
    "Fish 5'6",
    "Fish 5'8",
    "Fish 5'10"
  ],
  fun: [
    "Fun 6'8",
    "Fun 7'0",
    "Fun 7'2"
  ]
};

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

function normalizeText(text) {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatBoardType(type) {
  const formattedTypes = {
    longboard: "Longboard",
    pranchinha: "Pranchinha",
    fish: "Fish",
    fun: "Fun"
  };

  return formattedTypes[type] || type || null;
}

function extractBoardType(text) {
  const normalizedText = normalizeText(text);

  if (boardTypeMap[normalizedText]) {
    return boardTypeMap[normalizedText];
  }

  if (normalizedText.includes("longboard")) {
    return "longboard";
  }

  if (normalizedText.includes("pranchinha")) {
    return "pranchinha";
  }

  if (normalizedText.includes("fish")) {
    return "fish";
  }

  if (normalizedText.includes("fun")) {
    return "fun";
  }

  return null;
}

function buildBoardsMenu(name) {
  return [
    `Aloha${name ? `, ${name}` : ""}! Aqui e da Tikehau Surf Shop.`,
    "Estamos desde 2003 no mercado, com qualidade, bom preco e grande acervo de pranchas novas e usadas.",
    "Escolha o tipo de prancha para ver as opcoes:",
    "1 - Longboard",
    "2 - Pranchinha",
    "3 - Fish",
    "4 - Fun"
  ].join("\n");
}

function buildBoardsByTypeReply(boardType) {
  const boards = boardCatalog[boardType] || [];

  if (boards.length === 0) {
    return "No momento nao encontrei pranchas desse tipo no catalogo.";
  }

  return [
    `${formatBoardType(boardType)}s disponiveis:`,
    ...boards.map((board, index) => `${index + 1} - ${board}`),
    "Se quiser, depois eu posso detalhar medidas, fotos e preco de cada uma."
  ].join("\n");
}

function buildReplyText(message) {
  const text = normalizeText(message.text);

  if (!text) {
    return buildBoardsMenu(message.name);
  }

  const wantsMenu = ["oi", "ola", "olá", "menu", "prancha", "pranchas", "aloha", "tikehau"].some((term) =>
    text.includes(normalizeText(term))
  );

  if (wantsMenu) {
    return buildBoardsMenu(message.name);
  }

  const boardType = extractBoardType(text);

  if (boardType) {
    return buildBoardsByTypeReply(boardType);
  }

  return [
    "Hoje consigo te mostrar as opcoes por tipo de prancha:",
    "1 - Longboard",
    "2 - Pranchinha",
    "3 - Fish",
    "4 - Fun",
    "Me responda com o numero ou com o nome do tipo."
  ].join("\n");
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

    const replyText = buildReplyText(message);

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
