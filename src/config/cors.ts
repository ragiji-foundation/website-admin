export const corsConfig = {
  allowedOrigins: [
    'https://www.ragijifoundation.com',
    'https://admin.ragijifoundation.com',
    'https://ragijifoundation.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
