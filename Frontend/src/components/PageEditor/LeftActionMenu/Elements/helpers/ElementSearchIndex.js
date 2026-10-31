/**
 * ElementSearchIndex.js
 * Inverted Index & Prefix Token Search Data Structure for FlipiBook Elements
 *
 * Provides:
 * - O(1) item lookup by ID via Hash Map
 * - O(1) category partition retrieval via Category Buckets
 * - O(K) prefix/token search via Inverted Index
 * - Memoized query caching with bounded eviction
 */

export class ElementSearchIndex {
  constructor(items = [], categories = []) {
    this.itemMap = new Map(); // id -> ElementItem (O(1) lookup)
    this.categoryBuckets = new Map(); // categoryId -> ElementItem[] (O(1) retrieval)
    this.invertedIndex = new Map(); // tokenPrefix -> Set<elementId>
    this.queryCache = new Map(); // "cat:query" -> ElementItem[] (Memoization)
    this.maxCacheSize = 100;

    this.buildIndex(items, categories);
  }

  /**
   * Tokenizes text into lowercase normalized alphanumeric tokens
   */
  tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s-]+/)
      .filter((t) => t.length > 0);
  }

  /**
   * Generates all prefix substrings of a token for fast prefix-matching
   */
  generatePrefixes(token, minLen = 1) {
    const prefixes = [];
    for (let i = minLen; i <= token.length; i++) {
      prefixes.push(token.slice(0, i));
    }
    return prefixes;
  }

  /**
   * Builds the inverted index and hash maps in O(N * tokens)
   */
  buildIndex(items, categories) {
    this.itemMap.clear();
    this.categoryBuckets.clear();
    this.invertedIndex.clear();
    this.queryCache.clear();

    // Initialize category buckets
    this.categoryBuckets.set('all', []);
    if (Array.isArray(categories)) {
      categories.forEach((cat) => {
        if (!this.categoryBuckets.has(cat.id)) {
          this.categoryBuckets.set(cat.id, []);
        }
      });
    }

    // Populate maps and inverted index
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || !item.id) continue;

      this.itemMap.set(item.id, item);
      this.categoryBuckets.get('all').push(item);

      // Category assignment
      const cat = item.category || 'other';
      if (!this.categoryBuckets.has(cat)) {
        this.categoryBuckets.set(cat, []);
      }
      this.categoryBuckets.get(cat).push(item);

      // Handle masking alias (masking / image-framing / image)
      if (cat === 'masking' || cat === 'image-framing' || cat === 'image') {
        if (!this.categoryBuckets.has('masking')) {
          this.categoryBuckets.set('masking', []);
        }
        if (cat !== 'masking') {
          this.categoryBuckets.get('masking').push(item);
        }
      }

      // Extract searchable tokens from name, type, and category
      const tokenSources = [item.name, item.category, item.subtopic, item.type, item.tag, item.id].filter(Boolean);
      const uniqueTokens = new Set();

      tokenSources.forEach((src) => {
        this.tokenize(src).forEach((t) => uniqueTokens.add(t));
      });

      // Index prefixes
      uniqueTokens.forEach((token) => {
        const prefixes = this.generatePrefixes(token, 1);
        prefixes.forEach((pref) => {
          if (!this.invertedIndex.has(pref)) {
            this.invertedIndex.set(pref, new Set());
          }
          this.invertedIndex.get(pref).add(item.id);
        });
      });
    }
  }

  /**
   * O(1) Lookup by ID
   */
  getById(id) {
    return this.itemMap.get(id);
  }

  /**
   * O(1) Category Retrieval
   */
  getByCategory(categoryId = 'all') {
    return this.categoryBuckets.get(categoryId) || [];
  }

  /**
   * Multi-token search with set intersection and category filtering
   * Memoizes results in an LRU-style cache
   */
  search(query = '', categoryId = 'all') {
    const trimmed = query.trim().toLowerCase();
    const cacheKey = `${categoryId}::${trimmed}`;

    // Return memoized result if available
    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }

    let results = [];

    // Case 1: No query -> Return category bucket directly (O(1))
    if (!trimmed) {
      results = this.getByCategory(categoryId);
    } else {
      // Case 2: Multi-token search
      const queryTokens = this.tokenize(trimmed);
      if (queryTokens.length === 0) {
        results = this.getByCategory(categoryId);
      } else {
        // Find matching ID sets for each query token
        const matchSets = [];
        for (let i = 0; i < queryTokens.length; i++) {
          const t = queryTokens[i];
          const matchedIds = this.invertedIndex.get(t);
          if (!matchedIds || matchedIds.size === 0) {
            matchSets.push(new Set());
            break; // Token not found anywhere -> empty intersection
          }
          matchSets.push(matchedIds);
        }

        if (matchSets.some((s) => s.size === 0)) {
          results = [];
        } else {
          // Sort by smallest set first for minimal intersection iterations
          matchSets.sort((a, b) => a.size - b.size);
          const [smallest, ...others] = matchSets;

          const intersectedIds = [];
          smallest.forEach((id) => {
            if (others.every((s) => s.has(id))) {
              intersectedIds.push(id);
            }
          });

          // Filter by category and map to element objects
          const categoryItems = categoryId === 'all'
            ? null
            : new Set((this.getByCategory(categoryId) || []).map((it) => it.id));

          results = intersectedIds
            .filter((id) => (categoryItems ? categoryItems.has(id) : true))
            .map((id) => this.itemMap.get(id))
            .filter(Boolean);
        }
      }
    }

    // Cache with bounded eviction
    if (this.queryCache.size >= this.maxCacheSize) {
      const oldestKey = this.queryCache.keys().next().value;
      this.queryCache.delete(oldestKey);
    }
    this.queryCache.set(cacheKey, results);

    return results;
  }
}

export default ElementSearchIndex;
