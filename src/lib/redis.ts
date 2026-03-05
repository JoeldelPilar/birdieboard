import Redis from 'ioredis';

const redisUrl = process.env.VALKEY_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Valkey connection error:', err);
});
