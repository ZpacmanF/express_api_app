const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

const cacheUsers = async (req, res, next) => {
  const key = `users:all`;

  try {
    const cached = await redis.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    res.originalJson = res.json;
    res.json = (data) => {
      redis
        .setex(key, process.env.CACHE_EXPIRATION || 3600, JSON.stringify(data))
        .then(() => console.log('Cache atualizado com sucesso'))
        .catch((err) => console.error('Erro ao atualizar cache:', err));

      res.originalJson(data);
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de cache:', error);
    next();
  }
};

module.exports = { redis, cacheUsers };