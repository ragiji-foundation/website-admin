import IORedis from 'ioredis';

class RedisConnection {
  private static instance: IORedis;

  static getInstance(): IORedis {
    if (!RedisConnection.instance) {
      const redisUrl = process.env.REDIS_URL;

      const config = {
        ...(redisUrl ? { url: redisUrl } : {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        }),
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      };

      RedisConnection.instance = new IORedis(config);

      RedisConnection.instance.on('error', (error) => {
        console.error('Redis connection error:', error);
      });

      RedisConnection.instance.on('connect', () => {
        console.log('Successfully connected to Redis');
      });
    }

    return RedisConnection.instance;
  }
}

export const redis = RedisConnection.getInstance();
