import IORedis from 'ioredis';

const getRedisConfig = () => {
  // For Vercel deployments
  if (process.env.VERCEL) {
    return {
      url: process.env.REDIS_URL,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      maxmemory: '200mb',
      maxmemoryPolicy: 'noeviction',
      retryStrategy: (times: number) => Math.min(times * 50, 2000)
    };
  }

  // For local development
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    maxmemory: '200mb',
    maxmemoryPolicy: 'noeviction',
    retryStrategy: (times: number) => Math.min(times * 50, 2000)
  };
};

const redis = new IORedis(getRedisConfig());

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

export { redis };