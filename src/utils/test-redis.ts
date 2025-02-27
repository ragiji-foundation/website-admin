import { Queue } from 'bullmq';

async function testRedisConnection() {
  try {
    const queue = new Queue('test-queue', {
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      }
    });

    await queue.add('test-job', { test: 'data' });
    console.log('Successfully connected to Redis!');
    await queue.close();
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
}

testRedisConnection();
