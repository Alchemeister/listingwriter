-- =============================================================================
-- ListingWriter Supabase Schema
-- =============================================================================
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New Query

-- =============================================================================
-- PROFILES TABLE
-- Stores user tier (free, pro, pro_plus)
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'pro_plus')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, tier)
  VALUES (NEW.id, NEW.email, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- USAGE TABLE
-- Tracks monthly usage per user (server-side enforcement)
-- =============================================================================

CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One record per user per month
  UNIQUE(user_id, period_start)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage(user_id, period_start);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Profiles: Users can update their own profile (except tier)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Usage: Users can view their own usage
CREATE POLICY "Users can view own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);

-- Service role bypasses RLS for server-side operations
-- (The API uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS)

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get current month's usage for a user
CREATE OR REPLACE FUNCTION get_monthly_usage(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COALESCE(count, 0) INTO v_count
  FROM usage
  WHERE user_id = p_user_id
    AND period_start >= date_trunc('month', NOW());

  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user can generate (respects tier)
CREATE OR REPLACE FUNCTION can_user_generate(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_count INTEGER;
  v_limit INTEGER := 5; -- Free tier limit
BEGIN
  -- Get user tier
  SELECT tier INTO v_tier FROM profiles WHERE id = p_user_id;

  -- Pro users have unlimited
  IF v_tier IN ('pro', 'pro_plus') THEN
    RETURN TRUE;
  END IF;

  -- Check free tier limit
  v_count := get_monthly_usage(p_user_id);
  RETURN v_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- OPTIONAL: Upgrade user to Pro (for admin use)
-- =============================================================================

CREATE OR REPLACE FUNCTION upgrade_to_pro(p_user_id UUID, p_tier TEXT DEFAULT 'pro')
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET tier = p_tier, updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: SELECT upgrade_to_pro('user-uuid-here', 'pro');
