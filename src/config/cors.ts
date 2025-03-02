export const corsConfig = {
  allowedOrigins: [
    'https://www.ragijifoundation.com',
    'https://ragijifoundation.com',
    'http://localhost:3000'
  ],
  allowedMethods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
  credentials: false // Set to false for public API endpoints
};

export const MAIN_WEBSITE = 'https://www.ragijifoundation.com';
