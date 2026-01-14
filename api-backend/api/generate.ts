import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// =============================================================================
// SECURITY CONFIG
// =============================================================================

const SECURITY_CONFIG = {
  maxImages: 3,
  maxImageSizeBytes: 5 * 1024 * 1024, // 5MB per image
  maxItemNameLength: 200,
  maxDetailsLength: 1000,
  maxPriceValue: 1000000,
  allowedConditions: ['New', 'Like New', 'Good', 'Fair', 'Parts'],
  allowedCategories: ['Furniture', 'Electronics', 'Clothing', 'Auto', 'Home', 'Sports', 'Other'],
  freeTierLimit: 5, // Per month
  rateLimitRequests: 10, // Per window
  rateLimitWindow: '1 h' as const, // 10 requests per hour per IP
};

// =============================================================================
// TYPES
// =============================================================================

interface ListingInput {
  images: string[];
  itemName: string;
  price: number;
  condition: string;
  category: string;
  additionalDetails?: string;
}

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

interface MarketResearch {
  typicalPriceRange: { low: number; high: number };
  priceAssessment: 'below_market' | 'competitive' | 'above_market';
  keySellingPoints: string[];
  commonBuyerConcerns: string[];
  suggestedKeywords: string[];
  seasonalRelevance: string | null;
}

interface GeneratedListing {
  title: string;
  description: string;
  suggestedTags: string[];
}

interface GenerationResult {
  casual: GeneratedListing;
  professional: GeneratedListing;
  punchy: GeneratedListing;
  metadata: {
    analysisUsed: boolean;
    researchUsed: boolean;
    processingTimeMs: number;
  };
}

interface UserProfile {
  id: string;
  tier: 'free' | 'pro' | 'pro_plus';
}

// =============================================================================
// SERVICE INITIALIZATION
// =============================================================================

let ratelimit: Ratelimit | null = null;
let supabase: SupabaseClient | null = null;

function getRateLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set');
    return null;
  }

  ratelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(SECURITY_CONFIG.rateLimitRequests, SECURITY_CONFIG.rateLimitWindow),
    analytics: true,
    prefix: 'listingwriter',
  });

  return ratelimit;
}

function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Auth disabled: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    return null;
  }

  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  return supabase;
}

// =============================================================================
// SECURITY HELPERS
// =============================================================================

function getClientIP(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return req.headers['x-real-ip'] as string || 'unknown';
}

async function checkRateLimit(req: VercelRequest): Promise<{ success: boolean; remaining?: number }> {
  const limiter = getRateLimiter();
  if (!limiter) {
    // Rate limiting not configured - allow but log warning
    return { success: true };
  }

  const ip = getClientIP(req);
  const result = await limiter.limit(ip);

  return {
    success: result.success,
    remaining: result.remaining,
  };
}

async function authenticateUser(req: VercelRequest): Promise<{ user: UserProfile | null; error?: string }> {
  const sb = getSupabase();
  if (!sb) {
    // Auth not configured - allow anonymous with free tier
    return { user: null };
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Missing authorization header' };
  }

  const token = authHeader.substring(7);

  try {
    // Verify the JWT and get user
    const { data: { user }, error } = await sb.auth.getUser(token);

    if (error || !user) {
      return { user: null, error: 'Invalid or expired token' };
    }

    // Get user profile with tier
    const { data: profile } = await sb.from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single();

    return {
      user: {
        id: user.id,
        tier: profile?.tier || 'free',
      }
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { user: null, error: 'Authentication failed' };
  }
}

async function checkUsageLimit(userId: string | null): Promise<{ allowed: boolean; remaining: number; tier: string }> {
  const sb = getSupabase();

  // No Supabase = no server-side tracking, fall back to allowing (client tracks)
  if (!sb || !userId) {
    return { allowed: true, remaining: SECURITY_CONFIG.freeTierLimit, tier: 'free' };
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  try {
    // Get user tier
    const { data: profile } = await sb.from('profiles')
      .select('tier')
      .eq('id', userId)
      .single();

    const tier = profile?.tier || 'free';

    // Pro users have unlimited
    if (tier === 'pro' || tier === 'pro_plus') {
      return { allowed: true, remaining: Infinity, tier };
    }

    // Get current month usage
    const { data: usage } = await sb.from('usage')
      .select('count')
      .eq('user_id', userId)
      .gte('period_start', monthStart)
      .single();

    const currentCount = usage?.count || 0;
    const remaining = Math.max(0, SECURITY_CONFIG.freeTierLimit - currentCount);

    return {
      allowed: currentCount < SECURITY_CONFIG.freeTierLimit,
      remaining,
      tier,
    };
  } catch (error) {
    console.error('Usage check error:', error);
    // On error, allow but log
    return { allowed: true, remaining: 0, tier: 'free' };
  }
}

async function incrementUsage(userId: string | null): Promise<void> {
  const sb = getSupabase();
  if (!sb || !userId) return;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  try {
    // Upsert usage record
    const { data: existing } = await sb.from('usage')
      .select('id, count')
      .eq('user_id', userId)
      .gte('period_start', monthStart)
      .single();

    if (existing) {
      await sb.from('usage')
        .update({ count: existing.count + 1, updated_at: now.toISOString() })
        .eq('id', existing.id);
    } else {
      await sb.from('usage').insert({
        user_id: userId,
        count: 1,
        period_start: monthStart,
      });
    }
  } catch (error) {
    console.error('Usage increment error:', error);
  }
}

function sanitizeString(input: string, maxLength: number): string {
  if (typeof input !== 'string') return '';

  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim and limit length
  sanitized = sanitized.trim().slice(0, maxLength);

  // Basic XSS prevention - encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized;
}

function validateBase64Image(base64: string): { valid: boolean; error?: string } {
  if (typeof base64 !== 'string') {
    return { valid: false, error: 'Image must be a string' };
  }

  // Check for data URL prefix and extract base64
  let pureBase64 = base64;
  if (base64.startsWith('data:')) {
    const matches = base64.match(/^data:image\/(jpeg|png|webp|gif);base64,(.+)$/);
    if (!matches) {
      return { valid: false, error: 'Invalid image data URL format' };
    }
    pureBase64 = matches[2];
  }

  // Validate base64 characters
  if (!/^[A-Za-z0-9+/=]+$/.test(pureBase64)) {
    return { valid: false, error: 'Invalid base64 characters' };
  }

  // Check decoded size (base64 is ~4/3 the size of original)
  const estimatedSize = Math.floor(pureBase64.length * 0.75);
  if (estimatedSize > SECURITY_CONFIG.maxImageSizeBytes) {
    return { valid: false, error: `Image exceeds ${SECURITY_CONFIG.maxImageSizeBytes / (1024 * 1024)}MB limit` };
  }

  return { valid: true };
}

function validateInput(input: unknown): { valid: boolean; error?: string; sanitized?: ListingInput } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const data = input as Record<string, unknown>;

  // Validate images
  if (!Array.isArray(data.images) || data.images.length === 0) {
    return { valid: false, error: 'At least one image is required' };
  }
  if (data.images.length > SECURITY_CONFIG.maxImages) {
    return { valid: false, error: `Maximum ${SECURITY_CONFIG.maxImages} images allowed` };
  }

  const validatedImages: string[] = [];
  for (let i = 0; i < data.images.length; i++) {
    const validation = validateBase64Image(data.images[i] as string);
    if (!validation.valid) {
      return { valid: false, error: `Image ${i + 1}: ${validation.error}` };
    }
    // Remove data URL prefix for API call
    let img = data.images[i] as string;
    if (img.startsWith('data:')) {
      img = img.split(',')[1];
    }
    validatedImages.push(img);
  }

  // Validate itemName
  if (typeof data.itemName !== 'string' || data.itemName.trim().length === 0) {
    return { valid: false, error: 'Item name is required' };
  }

  // Validate price
  const price = Number(data.price);
  if (isNaN(price) || price < 0 || price > SECURITY_CONFIG.maxPriceValue) {
    return { valid: false, error: `Price must be between 0 and ${SECURITY_CONFIG.maxPriceValue}` };
  }

  // Validate condition
  if (!SECURITY_CONFIG.allowedConditions.includes(data.condition as string)) {
    return { valid: false, error: 'Invalid condition value' };
  }

  // Validate category
  if (!SECURITY_CONFIG.allowedCategories.includes(data.category as string)) {
    return { valid: false, error: 'Invalid category value' };
  }

  // Sanitize and return
  const sanitized: ListingInput = {
    images: validatedImages,
    itemName: sanitizeString(data.itemName as string, SECURITY_CONFIG.maxItemNameLength),
    price: Math.round(price * 100) / 100, // Round to 2 decimal places
    condition: data.condition as string,
    category: data.category as string,
    additionalDetails: data.additionalDetails
      ? sanitizeString(data.additionalDetails as string, SECURITY_CONFIG.maxDetailsLength)
      : undefined,
  };

  return { valid: true, sanitized };
}

function setSecurityHeaders(res: VercelResponse): void {
  // CORS headers - restrict in production!
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Prevent caching of sensitive responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

// =============================================================================
// AGENT 1: IMAGE ANALYZER
// =============================================================================

const IMAGE_ANALYSIS_PROMPT = `You are an expert at analyzing product photos for marketplace listings.

Examine the image(s) carefully and extract detailed information.

Return a JSON object with this exact structure:
{
  "brand": "identified brand name or null if not visible",
  "model": "model number/name or null if not visible",
  "color": "primary color(s)",
  "material": "what it appears to be made of",
  "estimatedDimensions": "rough size estimate (e.g., '24 inches wide')",
  "visibleFeatures": ["list", "of", "notable", "features"],
  "conditionObservations": ["any wear", "damage", "or quality notes"],
  "identifiedAccessories": ["any extras", "included items"]
}

Be objective and only describe what you can actually see. Don't make assumptions.
Return ONLY the JSON, no other text.`;

async function analyzeImages(
  client: Anthropic,
  images: string[]
): Promise<ImageAnalysis | null> {
  try {
    const imageContent: Anthropic.ImageBlockParam[] = images.map((base64) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: base64,
      },
    }));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            { type: 'text', text: IMAGE_ANALYSIS_PROMPT },
          ],
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') return null;

    let jsonStr = textContent.text;
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    return JSON.parse(jsonStr) as ImageAnalysis;
  } catch (error) {
    console.error('Image analysis failed:', error);
    return null;
  }
}

// =============================================================================
// AGENT 2: MARKET RESEARCHER
// =============================================================================

const MARKET_RESEARCH_PROMPT = `You are a marketplace pricing and marketing expert.

Given this item information, provide market insights to help write a compelling listing.

ITEM: {itemName}
CATEGORY: {category}
CONDITION: {condition}
ASKING PRICE: ${'{price}'}
IMAGE ANALYSIS: {analysis}

Return a JSON object with this exact structure:
{
  "typicalPriceRange": { "low": number, "high": number },
  "priceAssessment": "below_market" | "competitive" | "above_market",
  "keySellingPoints": ["what makes this item desirable"],
  "commonBuyerConcerns": ["what buyers typically worry about"],
  "suggestedKeywords": ["search terms buyers use"],
  "seasonalRelevance": "any timing factors or null"
}

Base your analysis on typical marketplace dynamics for this type of item.
Return ONLY the JSON, no other text.`;

async function researchMarket(
  client: Anthropic,
  input: ListingInput,
  analysis: ImageAnalysis | null
): Promise<MarketResearch | null> {
  try {
    const prompt = MARKET_RESEARCH_PROMPT
      .replace('{itemName}', input.itemName)
      .replace('{category}', input.category)
      .replace('{condition}', input.condition)
      .replace('{price}', input.price.toString())
      .replace('{analysis}', analysis ? JSON.stringify(analysis) : 'Not available');

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') return null;

    let jsonStr = textContent.text;
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    return JSON.parse(jsonStr) as MarketResearch;
  } catch (error) {
    console.error('Market research failed:', error);
    return null;
  }
}

// =============================================================================
// AGENT 3: COPYWRITER
// =============================================================================

const COPYWRITING_PROMPT = `You are an expert marketplace copywriter who writes listings that SELL.

Write 3 compelling listing descriptions for this item:

ITEM: {itemName}
PRICE: ${'{price}'}
CONDITION: {condition}
CATEGORY: {category}
SELLER NOTES: {additionalDetails}

IMAGE ANALYSIS:
{analysis}

MARKET INSIGHTS:
{research}

RULES:
1. Use the image analysis to describe specific features (brand, color, size, etc.)
2. Address the common buyer concerns preemptively
3. Incorporate high-performing keywords naturally
4. Be honest but positive about condition
5. NO emojis
6. NO ALL CAPS except brand names
7. Each description: 50-150 words
8. Make each tone DISTINCTLY different

Return JSON only:
{
  "casual": {
    "title": "friendly, conversational title",
    "description": "like texting a friend - warm, relatable",
    "suggestedTags": ["relevant", "hashtags"]
  },
  "professional": {
    "title": "polished, detailed title",
    "description": "thorough, trustworthy, addresses concerns",
    "suggestedTags": ["relevant", "hashtags"]
  },
  "punchy": {
    "title": "short, attention-grabbing title",
    "description": "brief, urgent, no fluff - just facts and CTA",
    "suggestedTags": ["relevant", "hashtags"]
  }
}`;

async function writeCopy(
  client: Anthropic,
  input: ListingInput,
  images: string[],
  analysis: ImageAnalysis | null,
  research: MarketResearch | null
): Promise<GenerationResult> {
  const prompt = COPYWRITING_PROMPT
    .replace('{itemName}', input.itemName)
    .replace('{price}', input.price.toString())
    .replace('{condition}', input.condition)
    .replace('{category}', input.category)
    .replace('{additionalDetails}', input.additionalDetails || 'None provided')
    .replace('{analysis}', analysis ? JSON.stringify(analysis, null, 2) : 'Not available - describe what you see in the photos')
    .replace('{research}', research ? JSON.stringify(research, null, 2) : 'Not available - use your expertise');

  const imageContent: Anthropic.ImageBlockParam[] = images.map((base64) => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: 'image/jpeg',
      data: base64,
    },
  }));

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          ...imageContent,
          { type: 'text', text: prompt },
        ],
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from copywriter');
  }

  let jsonStr = textContent.text;
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];

  const result = JSON.parse(jsonStr);

  // Ensure suggestedTags exists for each listing
  ['casual', 'professional', 'punchy'].forEach((tone) => {
    if (!result[tone].suggestedTags) {
      result[tone].suggestedTags = [];
    }
  });

  return result;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set security headers for all responses
  setSecurityHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const startTime = Date.now();

  try {
    // ==========================================================================
    // SECURITY LAYER 1: Rate Limiting (by IP)
    // ==========================================================================
    const rateLimitResult = await checkRateLimit(req);
    if (!rateLimitResult.success) {
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: 3600, // 1 hour
      });
      return;
    }

    // ==========================================================================
    // SECURITY LAYER 2: Authentication (optional but recommended)
    // ==========================================================================
    const { user, error: authError } = await authenticateUser(req);

    // If auth is configured but failed, reject
    if (authError && getSupabase()) {
      res.status(401).json({ success: false, error: authError });
      return;
    }

    // ==========================================================================
    // SECURITY LAYER 3: Usage Limits (server-side enforcement)
    // ==========================================================================
    const usageCheck = await checkUsageLimit(user?.id || null);
    if (!usageCheck.allowed) {
      res.status(403).json({
        success: false,
        error: 'Monthly limit reached. Upgrade to Pro for unlimited listings.',
        remaining: 0,
        tier: usageCheck.tier,
      });
      return;
    }

    // ==========================================================================
    // SECURITY LAYER 4: Input Validation & Sanitization
    // ==========================================================================
    const validation = validateInput(req.body);
    if (!validation.valid || !validation.sanitized) {
      res.status(400).json({ success: false, error: validation.error || 'Invalid input' });
      return;
    }

    const input = validation.sanitized;

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      res.status(500).json({ success: false, error: 'Service temporarily unavailable' });
      return;
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    console.log(`Starting generation for user: ${user?.id || 'anonymous'}`);

    // AGENT 1: Analyze images
    console.log('Agent 1: Analyzing images...');
    const analysis = await analyzeImages(client, input.images);
    console.log('Analysis result:', analysis ? 'Success' : 'Skipped');

    // AGENT 2: Research market
    console.log('Agent 2: Researching market...');
    const research = await researchMarket(client, input, analysis);
    console.log('Research result:', research ? 'Success' : 'Skipped');

    // AGENT 3: Write copy
    console.log('Agent 3: Writing copy...');
    const listings = await writeCopy(client, input, input.images, analysis, research);

    const processingTimeMs = Date.now() - startTime;
    console.log(`Generation complete in ${processingTimeMs}ms`);

    // ==========================================================================
    // SECURITY LAYER 5: Increment Usage (server-side tracking)
    // ==========================================================================
    await incrementUsage(user?.id || null);

    // Add metadata
    const result: GenerationResult = {
      ...listings,
      metadata: {
        analysisUsed: analysis !== null,
        researchUsed: research !== null,
        processingTimeMs,
      },
    };

    res.status(200).json({
      success: true,
      listings: result,
      remaining: usageCheck.remaining - 1,
      tier: usageCheck.tier,
    });
  } catch (error) {
    console.error('Generation error:', error);

    // Don't expose internal error details to client
    res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again.',
    });
  }
}
