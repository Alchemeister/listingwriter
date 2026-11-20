# ListingWriter

Turn a photo and a few facts into a ready-to-publish marketplace listing.

Point the app at an item, snap a couple of photos, and ListingWriter analyses the
images, writes the title and description, and returns a structured listing you can
paste straight into your marketplace of choice.

**Stack:** Expo (React Native) · TypeScript · Vercel serverless functions · Anthropic
Claude · Supabase · Upstash Redis

---

## How it works

1. **Capture** — pick up to 3 images from the camera roll or take new ones
   (`expo-image-picker`, `expo-image-manipulator`).
2. **Describe** — set the item name, category, condition and price.
3. **Generate** — the `api-backend/api/generate.ts` serverless function sends the
   images to Claude, which returns a title, description and category in one pass.
4. **Review and share** — edit the result, save it to history, and share out through
   the system share sheet.

## Architecture

```
app/                      Expo Router screens
  create.tsx              capture + form
  results.tsx             generated listing
  history.tsx             saved listings
  landing.tsx             intro

api-backend/api/
  generate.ts             Vercel serverless: Claude vision + listing generation
  supabase-schema.sql     listings table + row level security

.env.example              all config, every value a placeholder
```

The Expo app and the API backend are deployed separately — the app talks to the
backend over `EXPO_PUBLIC_API_URL`, so the same client build works against a local
dev server or a deployed API.

## Security

The API handler treats all input as untrusted:

- **Image limits** — max 3 images, 5 MB each
- **Field limits** — item name 200 chars, details 1000 chars, price capped at 1,000,000
- **Enumerated values** — condition and category are checked against allow-lists
- **Rate limiting** — 30 requests/minute per IP, plus a 5-item monthly free-tier cap
- **Keys stay server-side** — the Anthropic key, Supabase service-role key and
  Redis credentials are only read inside the serverless function

## Getting started

```bash
npm install
cp .env.example .env.local     # then fill in your own keys
npm start                       # Expo dev server
```

The API backend is a standard Vercel project:

```bash
cd api-backend
npm install
vercel dev
```

### Configuration

Every variable is documented in `.env.example` with a placeholder value. Nothing
real is committed to the repository.

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Base URL of the deployed API |
| `ANTHROPIC_API_KEY` | Claude API access (server-side only) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Listing storage |
| `UPSTASH_REDIS_URL` / `UPSTASH_REDIS_TOKEN` | Rate limiting |

## Status

Actively developed. `ROADMAP.md` tracks planned work, `SECURITY_AUDIT.md` documents
the input-validation and rate-limiting posture, and `CONVERSATION_LOG.md` records
the design decisions behind the current implementation.

## License

MIT — see [LICENSE](LICENSE).
