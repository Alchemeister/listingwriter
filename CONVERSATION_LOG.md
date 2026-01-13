# Conversation Log - ListingWriter Project

**Date:** January 11, 2026

---

## What We Decided

### The Idea
**ListingWriter** - AI tool that turns photos into marketplace listings for Craigslist, Facebook Marketplace, OfferUp, etc.

User uploads 1-3 photos → fills short form → gets 3 listing descriptions → copies and posts.

### Why This Idea Won

You had 35+ ideas. I ranked them all. This one scored highest because:

1. **AI is the core product** - not a feature bolted onto something else
2. **Easy distribution** - viral TikTok potential ("I sold my couch in 2 hours")
3. **No incumbent owns this** - FB Marketplace won't build this, Craigslist definitely won't
4. **Fast MVP** - can build in a weekend
5. **Clear monetization** - free tier (3 listings) → paid ($2.99 for 10 more)

### Original Pivot
Started as "Real Estate Copywriter for Agents" but pivoted to general marketplace because:
- Easier to reach users (viral content vs cold calling agents)
- Lower stakes (selling a couch vs $500k house)
- Faster validation
- Can always niche UP to real estate later if it works

---

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind + shadcn/ui
- Claude API (vision + text)
- localStorage for usage tracking
- Vercel for deployment

---

## Files Created

```
C:\Users\jmroc\Workspace\listingwriter\
├── CLAUDE.md           # Full project spec + instructions
├── .env.example        # API key template
├── .gitignore          # Standard ignores
└── CONVERSATION_LOG.md # This file
```

---

## Tomorrow's Setup Commands

Run these in order:

```bash
cd C:\Users\jmroc\Workspace\listingwriter

# 1. Create Next.js app (say Yes to overwrite existing files)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Initialize shadcn
npx shadcn@latest init

# 3. Add components
npx shadcn@latest add button card input textarea select toast

# 4. Install Anthropic SDK
npm install @anthropic-ai/sdk

# 5. Create env file and add your API key
copy .env.example .env.local
# Then edit .env.local and add: ANTHROPIC_API_KEY=sk-ant-your-key
```

---

## Then Tell Claude

> "Let's build ListingWriter. Read CLAUDE.md and start with the API route."

---

## Key Features for MVP

1. **Image upload** - drag-drop, max 3, max 5MB each
2. **Simple form** - item name, price, condition, category, optional details
3. **3 listing styles** - casual, professional, punchy
4. **Copy button** - one click copy with toast confirmation
5. **Usage tracking** - 3 free, then paywall message

---

## Monetization (Post-MVP)

- Free: 3 listings
- $2.99 one-time: 10 listings
- $4.99/month: Unlimited

---

## Marketing Angle

TikTok/Instagram Reels showing before/after:
- Terrible listing: "Couch. $50. Works."
- AI listing: Compelling, detailed, sells in hours
- Hook: "I sold my couch in 2 hours using AI"

---

## Notes

- CLAUDE.md has full instructions for building
- Use agents (Explore, Plan) for accuracy before coding
- Build incrementally - test each piece before moving on
- Don't over-engineer - this is an MVP

---

**Status:** Ready to build tomorrow. Run setup commands, then start coding.
