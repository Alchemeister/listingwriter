# ListingWriter - AI Marketplace Listing Generator

## What This Is

AI-powered tool that turns photos + basic details into compelling marketplace listings. Uses a multi-agent approach to analyze images, research market context, and generate optimized copy that sells.

**User flow:** Upload photos → Add details → AI analyzes & researches → Get 3 ready-to-copy descriptions → Copy → Sell

## Tech Stack

### Mobile App + Web App (Expo)
- **Framework:** Expo SDK 54 with Expo Router
- **Language:** TypeScript
- **Styling:** React Native StyleSheet + expo-linear-gradient
- **Platforms:** iOS, Android, Web (same codebase)
- **Storage:** AsyncStorage (history, usage tracking)

### API Backend (Vercel Serverless)
- **Runtime:** Vercel Serverless Functions
- **AI Providers:**
  - Primary: Anthropic Claude (claude-sonnet-4-20250514 with vision)
  - Fallback: DeepSeek, Google Gemini
- **Architecture:** Multi-agent pipeline

### Landing Page
- **Built:** Integrated in Expo app at `/landing`
- **Theme:** Dark SaaS aesthetic
- **Purpose:** Marketing, SEO, conversion

---

## Project Structure

```
/app                          # Expo Router pages
  _layout.tsx                 # Root layout with navigation
  index.tsx                   # Main form (create listing)
  results.tsx                 # Generated listings display
  history.tsx                 # Past listings
  landing.tsx                 # Landing/marketing page (web only)

/lib                          # Utilities
  storage.ts                  # AsyncStorage helpers (history, usage)

/api-backend                  # Vercel serverless API
  /api
    generate.ts               # Main generation endpoint (multi-agent)
  vercel.json
  package.json
```

---

## Multi-Agent Backend Architecture

The generation process uses multiple specialized AI agents working in sequence:

### Agent 1: Image Analyzer
**Purpose:** Extract detailed information from photos
**Input:** Base64 images
**Output:** Structured analysis

```typescript
interface ImageAnalysis {
  brand: string | null;
  model: string | null;
  color: string;
  material: string;
  estimatedDimensions: string;
  visibleFeatures: string[];
  conditionObservations: string[];
  identifiedAccessories: string[];
}
```

### Agent 2: Market Researcher
**Purpose:** Provide market context for better copy
**Input:** Item details + image analysis
**Output:** Market insights

```typescript
interface MarketResearch {
  typicalPriceRange: { low: number; high: number };
  priceAssessment: 'below_market' | 'competitive' | 'above_market';
  keySellingPoints: string[];
  commonBuyerConcerns: string[];
  suggestedKeywords: string[];
  seasonalRelevance: string | null;
}
```

### Agent 3: Copywriter
**Purpose:** Generate optimized listing copy
**Input:** All previous analysis + user details
**Output:** Three listing variations (casual, professional, punchy)

### API Flow

```
POST /api/generate
  │
  ├─→ Agent 1: Analyze Images
  │   └─→ Returns: ImageAnalysis
  │
  ├─→ Agent 2: Research Market (uses analysis)
  │   └─→ Returns: MarketResearch
  │
  └─→ Agent 3: Write Copy (uses all context)
      └─→ Returns: GenerationResult
```

---

## Features

### Core (Implemented)
- [x] Photo upload (up to 3 images)
- [x] Item details form
- [x] AI-generated listings (3 tones: casual, professional, punchy)
- [x] Copy to clipboard
- [x] Share functionality
- [x] Dark theme UI (desktop + mobile responsive)
- [x] Multi-agent backend (analyze → research → write)
- [x] History (save past listings locally)
- [x] Usage tracking (5 free listings/month)
- [x] Landing page (dark SaaS aesthetic)
- [x] Security hardening (input validation, sanitization, headers)

### Pro Tier (Planned - $9/month)
- [ ] Unlimited listings
- [ ] Priority AI processing
- [ ] Market price insights shown in results
- [ ] Platform-specific formatting (FB, Craigslist, OfferUp, Mercari)
- [ ] Custom tone options

### Pro+ Tier (Planned - $19/month)
All Pro features plus:

#### Inventory Management
- [ ] Save items as "inventory" (not just history)
- [ ] Mark items as: Active, Sold, Archived
- [ ] Add sold price and sold date
- [ ] Track where it was listed

#### Sales Analytics
- [ ] Total revenue from sold items
- [ ] Average sell time (listed → sold)
- [ ] Best performing categories
- [ ] Price accuracy (listed vs sold)
- [ ] Monthly/weekly revenue charts

#### Copy Intelligence
- [ ] Track which tone variation was used when sold
- [ ] A/B test insights: "Professional tone sells 20% faster"
- [ ] Learn from wins: "Keywords that led to quick sales"
- [ ] Personalized copy recommendations based on history

#### Data Schema for Pro+
```typescript
interface InventoryItem extends SavedListing {
  status: 'active' | 'sold' | 'archived';
  soldAt?: string;           // ISO date
  soldPrice?: number;
  soldPlatform?: string;     // "facebook", "craigslist", etc.
  toneUsed?: 'casual' | 'professional' | 'punchy';
  daysToSell?: number;       // Calculated: soldAt - createdAt
  notes?: string;
}

interface SalesAnalytics {
  totalRevenue: number;
  totalSold: number;
  averageDaysToSell: number;
  averageProfit: number;     // soldPrice - estimated cost
  categoryBreakdown: Record<string, {
    sold: number;
    revenue: number;
    avgDaysToSell: number;
  }>;
  tonePerformance: Record<string, {
    used: number;
    avgDaysToSell: number;
    successRate: number;     // sold / total used
  }>;
  monthlyRevenue: { month: string; revenue: number }[];
}
```

---

## Security

### Backend Security (Implemented)
- Input validation for all fields
- String sanitization (XSS prevention)
- Base64 image validation
- Size limits (5MB per image, 3 images max)
- Length limits (200 char item name, 1000 char details)
- Allowed values whitelist (conditions, categories)
- Security headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.)
- No internal error details exposed to client

### Security Config
```typescript
const SECURITY_CONFIG = {
  maxImages: 3,
  maxImageSizeBytes: 5 * 1024 * 1024,
  maxItemNameLength: 200,
  maxDetailsLength: 1000,
  maxPriceValue: 1000000,
  allowedConditions: ['New', 'Like New', 'Good', 'Fair', 'Parts'],
  allowedCategories: ['Furniture', 'Electronics', 'Clothing', 'Auto', 'Home', 'Sports', 'Other'],
};
```

---

## Commands

```bash
# Mobile App (Expo)
npm install                   # Install deps
npm run start                 # Start Expo dev server
npm run web                   # Start web version (port 8082)
npm run ios                   # Start iOS simulator
npm run android               # Start Android emulator

# API Backend
cd api-backend
npm install
npm run dev                   # Local dev with Vercel CLI
npm run deploy                # Deploy to Vercel
```

---

## Environment Variables

### Mobile App (.env.local)
```bash
EXPO_PUBLIC_API_URL=https://your-api.vercel.app
```

### API Backend (api-backend/.env.local)
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Styling Guide (Dark Theme)

**Colors:**
- Background: `#0a0a0f` (near black)
- Surface: `#18181b` (dark gray)
- Surface elevated: `#27272a` (lighter gray)
- Primary: `#8b5cf6` (purple)
- Primary light: `#a78bfa`
- Success: `#22c55e` (green)
- Warning: `#f59e0b` (amber)
- Error: `#ef4444` (red)
- Text primary: `#ffffff`
- Text secondary: `rgba(255,255,255,0.6)`
- Text muted: `rgba(255,255,255,0.4)`
- Border: `rgba(255,255,255,0.1)`

**Gradients:**
- Primary button: `['#8b5cf6', '#6366f1']`
- Success: `['#22c55e', '#16a34a']`
- Warning: `['#f59e0b', '#d97706']`

**Shadows:**
- Primary glow: `shadowColor: '#8b5cf6', shadowOpacity: 0.4`
- Subtle: `shadowColor: '#000', shadowOpacity: 0.1`

**Border radius:**
- Small: 8-10px
- Medium: 12-16px
- Large: 20-24px

---

## Desktop Responsiveness

All pages detect desktop via:
```typescript
const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isDesktop = isWeb && width > 768;
```

Desktop layouts:
- Landing: Full width sections, side-by-side hero
- Index: Photos sidebar + form (1000px max)
- Results: 3 cards in a row (1200px max)
- History: 2-column grid (1000px max)

---

## Error Handling

| Error | User Message |
|-------|-------------|
| No images | "Add at least one photo to continue" |
| Missing fields | "Fill in the required fields" |
| Image too large | "Image exceeds 5MB limit" |
| Invalid input | "Invalid [field] value" |
| API error | "Something went wrong. Please try again." |
| Rate limited | "You've hit your limit. Upgrade to Pro for unlimited." |

---

## Development Guidelines

**Do:**
- Use the dark theme consistently
- Test on both web and mobile
- Test desktop and mobile widths on web
- Keep security validation in sync with frontend
- Handle loading and error states

**Don't:**
- Don't add auth until Pro tier is needed
- Don't add payments until there's user demand
- Don't expose internal error details to users
- Don't skip input validation

---

## Deployment

**Mobile App:**
- Development: Expo Go app
- Production: EAS Build → App Store / Play Store

**API Backend:**
- `cd api-backend && vercel --prod`
- Ensure ANTHROPIC_API_KEY is set in Vercel dashboard

**Web App:**
- `npm run build:web` → Deploy to Vercel/Netlify
- Or use Expo's web export
