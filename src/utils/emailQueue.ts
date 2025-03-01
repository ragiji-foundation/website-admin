import { Queue, Worker, QueueEvents } from 'bullmq';
import { sendEmail } from './email';
import { redis } from '../lib/redis';

interface EmailJob {
  to: string;
  subject: string;
  text: string;
}

const queueOptions = {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
    timeout: 30000, // 30 seconds
  }
};

export const emailQueue = new Queue<EmailJob>('emailQueue', queueOptions);

const queueEvents = new QueueEvents('emailQueue', { connection: redis });

export const emailWorker = new Worker<EmailJob>(
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
    connection: redis,
    concurrency: 5,
    limiter: {
      max: 50,
      duration: 1000
    }
  }
);

// Monitor stalled jobs
queueEvents.on('stalled', ({ jobId }) => {
  console.warn(`Job ${jobId} has stalled`);
});

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
  });
}
