import AsyncStorage from "@react-native-async-storage/async-storage";

// =============================================================================
// TYPES
// =============================================================================

export interface GeneratedListing {
  title: string;
  description: string;
  suggestedTags?: string[];
}

export interface GenerationResult {
  casual: GeneratedListing;
  professional: GeneratedListing;
  punchy: GeneratedListing;
  metadata?: {
    analysisUsed: boolean;
    researchUsed: boolean;
    processingTimeMs: number;
  };
}

export interface SavedListing {
  id: string;
  createdAt: string;
  itemName: string;
  price: number;
  condition: string;
  category: string;
  results: GenerationResult;
  thumbnailUri?: string;
}

export interface UsageData {
  count: number;
  resetDate: string;
  tier: "free" | "pro";
}

// =============================================================================
// KEYS
// =============================================================================

const STORAGE_KEYS = {
  HISTORY: "listingwriter_history",
  USAGE: "listingwriter_usage",
} as const;

// =============================================================================
// HISTORY
// =============================================================================

export async function getHistory(): Promise<SavedListing[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!data) return [];
    return JSON.parse(data) as SavedListing[];
  } catch (error) {
    console.error("Failed to get history:", error);
    return [];
  }
}

export async function saveToHistory(listing: Omit<SavedListing, "id" | "createdAt">): Promise<SavedListing> {
  const newListing: SavedListing = {
    ...listing,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  try {
    const history = await getHistory();
    // Keep most recent 50 listings
    const updatedHistory = [newListing, ...history].slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
    return newListing;
  } catch (error) {
    console.error("Failed to save to history:", error);
    throw error;
  }
}

export async function deleteFromHistory(id: string): Promise<void> {
  try {
    const history = await getHistory();
    const updatedHistory = history.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Failed to delete from history:", error);
    throw error;
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error("Failed to clear history:", error);
    throw error;
  }
}

// =============================================================================
// USAGE TRACKING
// =============================================================================

const FREE_TIER_LIMIT = 5;

export async function getUsage(): Promise<UsageData> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USAGE);

    if (!data) {
      // Initialize usage
      const initialUsage: UsageData = {
        count: 0,
        resetDate: getNextResetDate(),
        tier: "free",
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(initialUsage));
      return initialUsage;
    }

    const usage = JSON.parse(data) as UsageData;

    // Check if we need to reset
    if (new Date(usage.resetDate) <= new Date()) {
      const resetUsage: UsageData = {
        ...usage,
        count: 0,
        resetDate: getNextResetDate(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(resetUsage));
      return resetUsage;
    }

    return usage;
  } catch (error) {
    console.error("Failed to get usage:", error);
    return { count: 0, resetDate: getNextResetDate(), tier: "free" };
  }
}

export async function incrementUsage(): Promise<UsageData> {
  try {
    const usage = await getUsage();
    const updatedUsage: UsageData = {
      ...usage,
      count: usage.count + 1,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(updatedUsage));
    return updatedUsage;
  } catch (error) {
    console.error("Failed to increment usage:", error);
    throw error;
  }
}

export function canGenerate(usage: UsageData): boolean {
  if (usage.tier === "pro") return true;
  return usage.count < FREE_TIER_LIMIT;
}

export function getRemainingGenerations(usage: UsageData): number {
  if (usage.tier === "pro") return Infinity;
  return Math.max(0, FREE_TIER_LIMIT - usage.count);
}

// =============================================================================
// HELPERS
// =============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getNextResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}
