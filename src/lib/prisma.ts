import { PrismaClient } from '@prisma/client';

// Add prisma to the global namespace for development only
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a singleton PrismaClient instance
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

// Check database connection
prisma.$connect()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });

// Store the PrismaClient in global for development only
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;