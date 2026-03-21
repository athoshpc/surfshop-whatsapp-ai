require("dotenv").config();

const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

app.use(express.json());

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
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
