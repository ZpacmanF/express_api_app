const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

const cachePatentSearch = async (req, res, next) => {
  const key = `patent:search:${req.query.query || ''}:${req.query.category || ''}`;
  try {
    const cached = await redis.get(key);
    if (cached) {
      console.log(`Cache hit for key: ${key}`);
      return res.json(JSON.parse(cached));
    }
    res.originalJson = res.json;
    res.json = (data) => {
      redis.setex(key, process.env.CACHE_EXPIRATION || 3600, JSON.stringify(data))
        .then(() => console.log(`Cache set for key: ${key}`))
        .catch((err) => console.error(`Error setting cache for key: ${key}`, err));
      res.originalJson(data);
    };
    next();
  } catch (error) {
    console.error(`Error accessing cache for key: ${key}`, error);
    next();
  }
};

const closeConnection = async () => {
  await redis.quit();
};

module.exports = { redis, cachePatentSearch, closeConnection };