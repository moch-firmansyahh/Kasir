import type {
  CategoryDTO,
  MenuItemDTO,
  OrderDTO,
  OrderSummaryDTO,
  SettingsDTO,
} from "@/types/api";

const POS_CACHE_KEY = "cemal-cemul-pos-cache-v1";

export type PosCacheData = {
  categories: CategoryDTO[];
  items: MenuItemDTO[];
  taxPercent: number;
  updatedAt: string;
};

export type MenuAdminCacheData = {
  categories: CategoryDTO[];
  items: MenuItemDTO[];
};

export type HistoryCacheData = {
  orders: OrderDTO[];
  summary: OrderSummaryDTO;
  hasMore: boolean;
};

let menuAdminMemoryCache: MenuAdminCacheData | null = null;
let settingsMemoryCache: SettingsDTO | null = null;
const historyMemoryCache = new Map<string, HistoryCacheData>();

/**
 * Persists the latest active catalog and tax setting in localStorage for instant offline/weak-signal load.
 */
export function savePosCache(data: Omit<PosCacheData, "updatedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: PosCacheData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(POS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota / privacy mode failures
  }
}

/**
 * Loads previously cached POS catalog & tax setting if valid.
 */
export function loadPosCache(): PosCacheData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(POS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PosCacheData>;
    if (
      !Array.isArray(parsed.categories) ||
      !Array.isArray(parsed.items) ||
      typeof parsed.taxPercent !== "number"
    ) {
      return null;
    }
    return {
      categories: parsed.categories,
      items: parsed.items,
      taxPercent: parsed.taxPercent,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveMenuAdminCache(data: MenuAdminCacheData): void {
  menuAdminMemoryCache = data;
}

export function loadMenuAdminCache(): MenuAdminCacheData | null {
  return menuAdminMemoryCache;
}

export function saveHistoryCache(key: string, data: HistoryCacheData): void {
  if (historyMemoryCache.size > 15) {
    const oldest = historyMemoryCache.keys().next().value;
    if (oldest !== undefined) historyMemoryCache.delete(oldest);
  }
  historyMemoryCache.set(key, data);
}

export function loadHistoryCache(key: string): HistoryCacheData | null {
  return historyMemoryCache.get(key) ?? null;
}

export function saveSettingsCache(data: SettingsDTO): void {
  settingsMemoryCache = data;
}

export function loadSettingsCache(): SettingsDTO | null {
  return settingsMemoryCache;
}
