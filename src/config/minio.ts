// MinIO Configuration
import { Client } from 'minio';

// Extract hostname from MINIO_ENDPOINT if it includes protocol
function extractHostname(endpoint: string): string {
  if (!endpoint) return 'localhost';
  
  // If endpoint includes protocol, extract hostname
  if (endpoint.includes('://')) {
    try {
      const url = new URL(endpoint);
      return url.hostname;
    } catch (error) {
      console.error('Error parsing MinIO endpoint URL:', error);
      // Fallback: remove protocol manually
      return endpoint.replace(/^https?:\/\//, '').split(':')[0];
    }
  }
  
  // If no protocol, return as is (just hostname)
  return endpoint.split(':')[0];
}

// MinIO Client Configuration
export const minioClient = new Client({
  endPoint: extractHostname(process.env.MINIO_ENDPOINT || 'localhost'),
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

// Default bucket name
export const DEFAULT_BUCKET = process.env.MINIO_BUCKET || 'ragiji-uploads';

// Initialize MinIO bucket if it doesn't exist
export async function initializeBucket(bucketName: string = DEFAULT_BUCKET) {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket ${bucketName} created successfully`);
      
      // Set bucket policy to allow public read access for images
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`Bucket policy set for ${bucketName}`);
    }
    return true;
  } catch (error) {
    console.error('Error initializing bucket:', error);
    return false;
  }
}

// Generate public URL for MinIO objects
export function getMinioPublicUrl(bucketName: string, objectName: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  
  // In production, check for different URL strategies
  if (isProduction) {
    // Strategy 1: Use custom public URL (for CDN/proxy setup)
    if (process.env.MINIO_PUBLIC_URL) {
      return `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${objectName}`;
    }
    
    // Strategy 2: Use image proxy to avoid mixed content issues
    if (process.env.USE_IMAGE_PROXY === 'true') {
      return `/api/image-proxy/${bucketName}/${objectName}`;
    }
    
    // Strategy 3: Force HTTPS (requires MinIO to support HTTPS)
    if (process.env.MINIO_USE_SSL === 'true') {
      return `https://${endpoint}/${bucketName}/${objectName}`;
    }
    
    // Fallback: Use image proxy by default in production to avoid mixed content
    return `/api/image-proxy/${bucketName}/${objectName}`;
  }
  
  // Development: use SSL setting or default to HTTP
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const includePort = endpoint === 'localhost' || endpoint.includes('localhost');
  
  return includePort 
    ? `${protocol}://${endpoint}:${port}/${bucketName}/${objectName}`
    : `${protocol}://${endpoint}/${bucketName}/${objectName}`;
}

// Generate presigned URL for temporary access
export async function getPresignedUrl(
  bucketName: string, 
  objectName: string, 
  expiry: number = 7 * 24 * 60 * 60 // 7 days
): Promise<string> {
  try {
    return await minioClient.presignedGetObject(bucketName, objectName, expiry);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}
