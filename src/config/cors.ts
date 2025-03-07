export const corsConfig = {
  allowedOrigins: [
    'https://admin.ragijifoundation.com',
    'https://www.ragijifoundation.com',
    'https://ragijifoundation.com',
    'http://localhost:3000'
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Cache-Control',
    'X-Auth-Token',
    'Origin',
    'Pragma',
    'Referer',
    'User-Agent'
  ],
  maxAge: 86400, // 24 hours
  credentials: true // Allow credentials
};

export const MAIN_WEBSITE = 'https://www.ragijifoundation.com';
