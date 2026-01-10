const NodeCache = require('node-cache');

// Create cache instance with 5 minute default TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

// Cache middleware for GET requests
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log('Cache hit for:', key);
      return res.json(cachedResponse);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, data, duration);
      console.log('Cache set for:', key);
      return originalJson.call(this, data);
    };

    next();
  };
};

// Cache middleware for EJS views
const viewCacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests to specific routes
    if (req.method !== 'GET') {
      return next();
    }

    const key = `view:${req.originalUrl}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log('View cache hit for:', key);
      return res.send(cachedResponse);
    }

    // Override res.send to cache the rendered view
    const originalSend = res.send;
    res.send = function(data) {
      cache.set(key, data, duration);
      console.log('View cache set for:', key);
      return originalSend.call(this, data);
    };

    next();
  };
};

// Clear cache helper
const clearCache = (pattern = null) => {
  if (pattern) {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    cache.del(matchingKeys);
    console.log('Cleared cache for pattern:', pattern, 'Keys:', matchingKeys.length);
  } else {
    cache.flushAll();
    console.log('Cleared all cache');
  }
};

// Get cache stats
const getCacheStats = () => {
  return cache.getStats();
};

module.exports = {
  cacheMiddleware,
  viewCacheMiddleware,
  clearCache,
  getCacheStats,
  cache
};
