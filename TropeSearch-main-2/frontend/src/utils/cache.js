const CACHE_VERSION = "v1"; // Increment this to invalidate all caches

/**
 * Set item in cache with expiration time
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttlMinutes - Time to live in minutes (default: 60)
 */
export function setCacheItem(key, data, ttlMinutes = 60) {
  try {
    const item = {
      version: CACHE_VERSION,
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000, // Convert to milliseconds
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.warn("Failed to cache item:", error);
    // If localStorage is full, clear old items
    if (error.name === "QuotaExceededError") {
      clearExpiredCache();
    }
  }
}

/**
 * Get item from cache if not expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
export function getCacheItem(key) {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);

    // Check version
    if (item.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    // Check if expired
    const now = Date.now();
    const age = now - item.timestamp;

    if (age > item.ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data;
  } catch (error) {
    console.warn("Failed to read cache item:", error);
    return null;
  }
}

/**
 * Remove specific cache item
 * @param {string} key - Cache key
 */
export function removeCacheItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to remove cache item:", error);
  }
}

/**
 * Clear all expired cache items
 */
export function clearExpiredCache() {
  try {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        const itemStr = localStorage.getItem(key);
        const item = JSON.parse(itemStr);

        // Check if it's our cache format and if expired
        if (item.timestamp && item.ttl) {
          const age = now - item.timestamp;
          if (age > item.ttl || item.version !== CACHE_VERSION) {
            keysToRemove.push(key);
          }
        }
      } catch {
        // Skip non-JSON items
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} expired cache items`);
  } catch (error) {
    console.warn("Failed to clear expired cache:", error);
  }
}

/**
 * Clear all cache items
 */
export function clearAllCache() {
  try {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Only remove our cache items (with version property)
      try {
        const itemStr = localStorage.getItem(key);
        const item = JSON.parse(itemStr);
        if (item.version === CACHE_VERSION) {
          keysToRemove.push(key);
        }
      } catch {
        // Skip non-JSON items
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keysToRemove.length} cache items`);
  } catch (error) {
    console.warn("Failed to clear cache:", error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  try {
    let totalSize = 0;
    let itemCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        const itemStr = localStorage.getItem(key);
        const item = JSON.parse(itemStr);
        if (item.version === CACHE_VERSION) {
          totalSize += itemStr.length;
          itemCount++;
        }
      } catch {
        // Skip non-JSON items
      }
    }

    return {
      itemCount,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
    };
  } catch (error) {
    console.warn("Failed to get cache stats:", error);
    return null;
  }
}

// Clear expired items on module load
clearExpiredCache();
