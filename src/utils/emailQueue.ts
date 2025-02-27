import { Queue, Worker } from 'bullmq';
import { sendEmail } from './email';

const connection = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD, // Add if using password
};

// Alternative: use Redis URL if available
const redisUrl = process.env.REDIS_URL;
const connectionConfig = redisUrl ? { url: redisUrl } : connection;

interface EmailJob {
  to: string;
  subject: string;
  text: string;
}

// Create email queue with connection config
export const emailQueue = new Queue<EmailJob>('emailQueue', {
  connection: connectionConfig,
});

// Create worker to process emails
export const emailWorker = new Worker(
  'emailQueue',
  async (job) => {
    try {
      await sendEmail(job.data);
      console.log(`Email sent to ${job.data.to}`);
    } catch (error) {
      console.error(`Email failed to ${job.data.to}:`, error);
      throw error; // Retry the job
    }
  },
  { connection }
);

// Helper function to enqueue emails
export async function enqueueEmail(to: string, subject: string, text: string) {
  return emailQueue.add('send-email', {
    to,
    subject,
    text,
  }, {
    attempts: 3, // Retry up to 3 times
    backoff: {
      type: 'exponential',
      delay: 1000, // Start with 1 second delay
    },
  });
}
