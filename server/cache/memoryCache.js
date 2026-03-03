/**
 * Memory Cache Implementation
 * Simple in-memory cache with TTL support
 */

class MemoryCache {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Set a value in cache with TTL
     * @param {string} key
     * @param {*} value
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, value, ttl) {
        const expiryTime = Date.now() + ttl;
        this.cache.set(key, {
            value,
            expiryTime,
            createdAt: Date.now()
        });
    }

    /**
     * Get a value from cache
     * @param {string} key
     * @param {boolean} ignoreExpiry - If true, returns even expired entries
     * @returns {*} Cached value or null
     */
    get(key, ignoreExpiry = false) {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (!ignoreExpiry && Date.now() > entry.expiryTime) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    /**
     * Check if key exists and is valid
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        if (Date.now() > entry.expiryTime) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }

    /**
     * Delete a key
     * @param {string} key
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        let validEntries = 0;
        let expiredEntries = 0;

        this.cache.forEach((entry, key) => {
            if (Date.now() > entry.expiryTime) {
                expiredEntries++;
            } else {
                validEntries++;
            }
        });

        return {
            validEntries,
            expiredEntries,
            totalEntries: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        for (const [key, entry] of this.cache.entries()) {
            if (Date.now() > entry.expiryTime) {
                this.cache.delete(key);
            }
        }
    }
}

module.exports = new MemoryCache();
