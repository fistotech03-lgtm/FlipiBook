/**
 * LRUCache.js
 * Generic Least-Recently-Used (LRU) Cache Data Structure
 *
 * Provides:
 * - O(1) retrieval (`get`)
 * - O(1) insertion (`put`) with automatic eviction of the least recently used key
 * - Predictable memory bounds for recent color palettes, fonts, and assets
 * - Easy conversion to arrays for UI rendering
 */

export class LRUCache {
  constructor(capacity = 12) {
    this.capacity = Math.max(1, capacity);
    this.cache = new Map(); // Preserves insertion order in JavaScript
  }

  /**
   * Retrieves an item and marks it as most recently used in O(1)
   */
  get(key) {
    if (!this.cache.has(key)) return undefined;

    const value = this.cache.get(key);
    // Refresh position: delete and re-insert at end of insertion order
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Inserts or updates an item and evicts the least recently used item if full in O(1)
   */
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest item (first entry in Map iterator)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  /**
   * Checks if key exists in O(1)
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Removes a specific key in O(1)
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clears the cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Current number of cached items
   */
  get size() {
    return this.cache.size;
  }

  /**
   * Returns items in order from most-recently-used to least-recently-used
   */
  valuesMRU() {
    return Array.from(this.cache.values()).reverse();
  }

  /**
   * Returns keys in order from most-recently-used to least-recently-used
   */
  keysMRU() {
    return Array.from(this.cache.keys()).reverse();
  }
}

export default LRUCache;
