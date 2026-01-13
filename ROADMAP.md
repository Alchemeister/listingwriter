# ListingWriter - Roadmap & Resources

## API Keys & Services

### AI Providers
- **Claude (Anthropic):** https://console.anthropic.com
  - Best for image analysis and nuanced writing
  - Pricing: ~$3/1M input tokens (Sonnet)

- **DeepSeek:** https://platform.deepseek.com
  - Budget-friendly alternative
  - Pricing: ~$0.14/1M tokens
  - Use as fallback when Claude is down

### Email Services
- **Resend:** https://resend.com - Simple, dev-friendly, good free tier
- **Postmark:** https://postmarkapp.com - Great deliverability

### Database
- **Supabase:** https://supabase.com (Recommended)
  - Free tier: 500MB database, 50k monthly active users
  - Built-in auth, Postgres, row-level security

- Alternatives:
  - Firebase: https://firebase.google.com (NoSQL)
  - PlanetScale: https://planetscale.com (MySQL)

### Payments
- **Stripe:** https://stripe.com
- **LemonSqueezy:** https://lemonsqueezy.com (handles taxes)

---

## Launch Platforms

### Product Hunt
- **URL:** https://producthunt.com
- **Best days:** Tuesday - Thursday
- **Tips:**
  - Prepare assets (logo, screenshots, video) in advance
  - Have friends ready to upvote and comment
  - Respond to every comment
  - Post around 12:01 AM PST for max visibility

### Subreddits (Target Audiences)
- **Sellers/Flippers:**
  - r/Flipping (304k members) - YOUR TARGET MARKET
  - r/FacebookMarketplace
  - r/Craigslist
  - r/poshmark
  - r/Mercari
  - r/eBay
  - r/OfferUp

- **Startups/Builders:**
  - r/SideProject
  - r/startups
  - r/EntrepreneurRideAlong
  - r/indiehackers
  - r/SaaS

- **Tech:**
  - r/webdev
  - r/reactnative
  - r/ExpoProjects

### Other Launch Sites
- **Hacker News:** https://news.ycombinator.com (Show HN)
- **BetaList:** https://betalist.com
- **Indie Hackers:** https://indiehackers.com
- **Twitter/X:** Build in public, share progress

---

## Pricing Strategy

### Free Tier
- 5 listings/month
- All 3 tones
- Copy to clipboard
- Basic history

### Pro ($9/month)
- Unlimited listings
- Priority AI processing
- Market price insights
- Platform-specific formatting (FB, Craigslist, OfferUp, Mercari)
- Custom tones

### Pro+ ($19/month)
- Everything in Pro
- Inventory management
- Sales analytics (what sold, for how much, how fast)
- Copy intelligence (which tone sells best)
- Monthly revenue reports
- Export data

---

## Feature Roadmap

### Phase 1: Core (Current)
- [x] Photo upload (3 images)
- [x] Item details form
- [x] AI-generated listings (3 tones)
- [x] Copy/share functionality
- [x] History (local storage)
- [x] Usage tracking
- [x] Dark theme UI
- [x] Landing page

### Phase 2: Polish
- [ ] Dark/light mode toggle
- [ ] Landing page as default (web)
- [ ] Mobile/tablet responsive fixes
- [ ] "Regenerate" button per tone
- [ ] Image quality tips before upload
- [ ] Loading animations

### Phase 3: Auth & Payments
- [ ] Supabase auth (email, Google, Apple)
- [ ] User profiles
- [ ] Stripe integration
- [ ] Pro tier features
- [ ] Cloud sync for history

### Phase 4: Pro Features
- [ ] Platform-specific formatting
- [ ] Price suggestion from market research
- [ ] Custom tone options
- [ ] Bulk generation (multiple items)

### Phase 5: Pro+ Features
- [ ] Inventory management
- [ ] Mark items as sold
- [ ] Sales analytics dashboard
- [ ] Copy performance tracking
- [ ] Revenue charts
- [ ] Data export

### Phase 6: Browser Extension
- [ ] Chrome extension
- [ ] Firefox extension
- [ ] Auto-detect marketplace pages
- [ ] One-click paste listing
- [ ] Context menu integration
- [ ] Sync with main app

---

## Browser Extension Spec

### Supported Marketplaces
- Facebook Marketplace
- Craigslist
- OfferUp
- Mercari
- Poshmark
- eBay

### Features
1. **Auto-detect** when user is on a "create listing" page
2. **Popup** with recent listings from the app
3. **One-click fill** - auto-populate title and description fields
4. **Context menu** - right-click to paste listing
5. **Quick generate** - upload photos directly in extension
6. **Sync** - connect to ListingWriter account

### Tech Stack
- Manifest V3
- React (shared components with main app)
- Chrome Storage API for sync
- Content scripts for page injection

---

## Improvements List

### Quick Wins
- [ ] Regenerate individual tones
- [ ] Image quality detector (warn if blurry)
- [ ] Character count for each listing
- [ ] Preview mode (see how it looks on FB/Craigslist)

### Medium Effort
- [ ] Price suggestion based on market research
- [ ] Suggested photos (show what angle works best)
- [ ] Hashtag suggestions
- [ ] SEO keywords highlighted

### Larger Features
- [ ] Batch upload (multiple items at once)
- [ ] Templates (save common item types)
- [ ] A/B testing (track which tone gets more views)
- [ ] Integration with marketplace APIs (if available)

---

## Name Alternatives

If you want to rebrand:
- SellCopy
- ListingAI
- FlipWriter
- SnapList
- QuickList.ai
- ListGenius
- FlipCopy
- MarketWriter

---

## Competitor Research

- **Jasper:** General AI writing (not marketplace-specific)
- **Copy.ai:** General copywriting
- **Sellesta:** Amazon listing optimization
- **None** specifically for local marketplace listings = opportunity!

---

## Metrics to Track

- Daily active users
- Listings generated per day
- Copy button clicks (conversion)
- Free to Pro conversion rate
- Churn rate
- Average listings per user
- Most popular categories
- Average generation time
- Error rates by agent
