# surfshop-whatsapp-ai

Minimal Node.js + Express backend for a WhatsApp Meta webhook MVP.

## What is included

- `GET /health` returns `ok`
- `GET /webhook` handles Meta webhook verification
- `POST /webhook` receives WhatsApp events
- incoming messages are logged in a readable format
- WhatsApp replies support interactive navigation for board types and board selection
- board catalog is separated into [data/boards.js](C:\dev\apps\surfshop-whatsapp-ai\data\boards.js)
- photo flow is prepared for Supabase Storage

## Catalog structure

Each board can now store:

- type
- title
- liters
- price
- condition
- `finSystem` (`FCS`, `FCS2` or `Futures`)
- `photos` with:
  - `localFile`
  - `storagePath`
- description

## Supabase photo flow

This project is ready to upload board photos to Supabase Storage.

### Environment variables

Add these to your local `.env`:

```env
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_STORAGE_BUCKET=board-photos
```

### Local photo folders

Save your images in:

- [assets/boards/used-pranchinha-sharpeye-red](C:\dev\apps\surfshop-whatsapp-ai\assets\boards\used-pranchinha-sharpeye-red)
- [assets/boards/used-pranchinha-lost-white](C:\dev\apps\surfshop-whatsapp-ai\assets\boards\used-pranchinha-lost-white)

Current expected filenames:

- `deck.jpg`
- `bottom.jpg`

### Upload command

After saving the images locally, run:

```bash
npm run upload:board-photos
```

This uploads the files to Supabase Storage using the `storagePath` defined in [data/boards.js](C:\dev\apps\surfshop-whatsapp-ai\data\boards.js).

### WhatsApp image sending

When a board has valid Storage paths and the bucket is public, the `Ver fotos` action sends the board images through WhatsApp using the public URLs generated from Supabase.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your local env file:

```bash
copy .env.example .env
```

3. Fill `.env` with your values.

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

## Notes

- temporary Meta access tokens expire, so update `.env` when you generate a new one
- if a reply fails with `Recipient phone number not in allowed list`, re-check the allowed test recipient number in Meta
- keep tokens and `ngrok` authtokens private and rotate them if they were exposed
- Supabase bucket must be public for direct WhatsApp image sending by URL
