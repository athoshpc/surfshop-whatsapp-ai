# surfshop-whatsapp-ai

Minimal Node.js + Express backend for a WhatsApp Meta webhook MVP.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local env file from the example:

```bash
copy .env.example .env
```

3. Set your values in `.env`:

```env
PORT=3000
WHATSAPP_VERIFY_TOKEN=your_verify_token_here
```

## Run

Start the server:

```bash
npm start
```

Run with Node watch mode:

```bash
npm run dev
```

## Endpoints

- `GET /health` returns `ok`
- `GET /webhook` handles Meta webhook verification
- `POST /webhook` receives WhatsApp events and logs the request body

## Meta Verification

Configure your Meta webhook verify token to match `WHATSAPP_VERIFY_TOKEN`.

Example verification request:

```text
GET /webhook?hub.mode=subscribe&hub.verify_token=your_verify_token_here&hub.challenge=12345
```

If the token matches, the server responds with the `hub.challenge` value.
