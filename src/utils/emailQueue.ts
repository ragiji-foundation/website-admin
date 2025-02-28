import { Queue, Worker } from 'bullmq';
import { sendEmail } from './email';
import { redis } from '../lib/redis';

interface EmailJob {
  to: string;
  subject: string;
  text: string;
}

export const emailQueue = new Queue<EmailJob>('emailQueue', {
  connection: {
    ...redis.options,
    maxRetriesPerRequest: null
  }
});

export const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    try {
      await sendEmail(job.data);
      console.log(`Email sent to ${job.data.to}`);
    } catch (error) {
      console.error(`Email failed to ${job.data.to}:`, error);
      throw error;
    }
  },
  {
    connection: {
      ...redis.options,
      maxRetriesPerRequest: null
    },
    limiter: {
      max: 50,
      duration: 1000
    }
  }
);

emailWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

export async function enqueueEmail(to: string, subject: string, text: string) {
  return emailQueue.add('send-email', {
    to,
    subject,
    text,
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  });
}
