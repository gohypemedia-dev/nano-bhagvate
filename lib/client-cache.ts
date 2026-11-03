/**
 * Client-side in-memory cache and in-flight request deduplication.
 * Prevents redundant API calls across page navigations (e.g. Home -> About -> Home).
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();
const inflightPromises = new Map<string, Promise<unknown>>();

export interface CacheOptions {
  /** Time in ms before the cached data is considered stale. Default: 3 minutes (180,000ms) */
  ttlMs?: number;
  /** If true, bypasses the cache and forces a fresh network fetch */
  forceRefresh?: boolean;
}

const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Fetch with in-memory caching and in-flight request deduplication.
 * - Deduplicates concurrent calls to the exact same URL.
 * - Serves instant cached response if within TTL.
 * - Stale-while-revalidate: if expired, returns stale data immediately while updating in background.
 */
export async function cachedFetch<T>(
  url: string,
  options: CacheOptions = {}
): Promise<T> {
  const { ttlMs = DEFAULT_TTL_MS, forceRefresh = false } = options;
  const now = Date.now();
  const cached = memoryCache.get(url) as CacheEntry<T> | undefined;

  // 1. If fresh and not forcing refresh, return immediately (0ms)
  if (!forceRefresh && cached && now - cached.timestamp < ttlMs) {
    return cached.data;
  }

  // 2. If stale data exists, return stale data immediately and revalidate in background
  if (!forceRefresh && cached) {
    // Background revalidation (fire and forget)
    if (!inflightPromises.has(url)) {
      const bgPromise = fetch(url)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
        .then((data: T) => {
          memoryCache.set(url, { data, timestamp: Date.now() });
          return data;
        })
        .catch(() => {
          // If background fetch fails, keep existing cache
        })
        .finally(() => {
          inflightPromises.delete(url);
        });
      inflightPromises.set(url, bgPromise);
    }
    return cached.data;
  }

  // 3. Deduplicate in-flight requests (if 2 components call same URL simultaneously)
  const existingPromise = inflightPromises.get(url) as Promise<T> | undefined;
  if (existingPromise) {
    return existingPromise;
  }

  // 4. Perform actual network fetch
  const fetchPromise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${url} (status: ${res.status})`);
      }
      const data = (await res.json()) as T;
      memoryCache.set(url, { data, timestamp: Date.now() });
      return data;
    } finally {
      inflightPromises.delete(url);
    }
  })();

  inflightPromises.set(url, fetchPromise);
  return fetchPromise;
}

/**
 * Invalidate a specific cached URL or all cached URLs starting with prefix.
 */
export function invalidateClientCache(urlPrefix?: string): void {
  if (!urlPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.startsWith(urlPrefix)) {
      memoryCache.delete(key);
    }
  }
}

