# surfshop-whatsapp-ai

Minimal Node.js + Express backend for a WhatsApp Meta webhook MVP.

## What is included

- `GET /health` returns `ok`
- `GET /webhook` handles Meta webhook verification
- `POST /webhook` receives WhatsApp events
- incoming messages are logged in a readable format
- text messages get a simple automatic reply through WhatsApp Cloud API

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your local env file:

```bash
copy .env.example .env
```

3. Fill `.env` with your values:

```env
PORT=3000
WHATSAPP_VERIFY_TOKEN=your_verify_token_here
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
```

## Run locally

Start the server:

```bash
npm start
```

Run in watch mode:

```bash
npm run dev
```

## WhatsApp Meta flow used in this project

This project was validated with WhatsApp Cloud API using:

- a Meta app with the WhatsApp product enabled
- a test phone number from Meta
- a recipient phone number added to the allowed test list
- a webhook callback exposed publicly with `ngrok`

### Webhook values used in Meta

Use these values in the Meta webhook setup:

- `Callback URL`: `https://YOUR_NGROK_URL/webhook`
- `Verify token`: the same value as `WHATSAPP_VERIFY_TOKEN`
- Webhook object: `WhatsApp Business Account`
- Required field subscription: `messages`

Example verification request:

```text
GET /webhook?hub.mode=subscribe&hub.verify_token=your_verify_token_here&hub.challenge=12345
```

If the token matches, the server responds with the `hub.challenge` value.

## Test flow

1. Start the server with `npm start`
2. Expose port `3000` publicly with `ngrok http 3000`
3. Configure the Meta webhook with your public `ngrok` URL
4. Subscribe to the `messages` field
5. Add your real WhatsApp number as an allowed test recipient in Meta
6. Send a message to the Meta test number
7. Check the server logs for the incoming webhook and automatic reply

## Notes

- temporary Meta access tokens expire, so update `.env` when you generate a new one
- if a reply fails with `Recipient phone number not in allowed list`, re-check the allowed test recipient number in Meta
- keep tokens and `ngrok` authtokens private and rotate them if they were exposed
