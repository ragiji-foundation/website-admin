// MinIO Configuration
import { Client } from 'minio';

// MinIO Client Configuration
export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
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
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const port = process.env.MINIO_PORT ? `:${process.env.MINIO_PORT}` : '';
  return `${protocol}://${process.env.MINIO_ENDPOINT}${port}/${bucketName}/${objectName}`;
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
