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

const minioClient = new Client({
  endPoint: extractHostname(process.env.MINIO_ENDPOINT || 'localhost'),
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
  // Add this to handle SSL issues in development
  ...(process.env.NODE_ENV === 'development' && {
    // Disable SSL verification for development
    transportAgent: process.env.MINIO_USE_SSL === 'true' ? 
      require('https').Agent({ rejectUnauthorized: false }) : undefined
  })
});

export default minioClient;
export { minioClient };

// Bucket names
export const BUCKETS = {
  IMAGES: 'ragiji-images',
  VIDEOS: 'ragiji-videos',
  DOCUMENTS: 'ragiji-documents',
} as const;

// Initialize buckets
export async function initializeBuckets() {
  for (const bucketName of Object.values(BUCKETS)) {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket ${bucketName} created successfully`);
    }
  }
}

// Upload file to MinIO
export async function uploadFile(
  file: Buffer,
  fileName: string,
  bucketName: string,
  contentType: string
): Promise<string> {
  const objectName = `${Date.now()}-${fileName}`;
  
  await minioClient.putObject(bucketName, objectName, file, file.length, {
    'Content-Type': contentType,
  });

  return getFileUrl(bucketName, objectName);
}

// Delete file from MinIO
export async function deleteFile(bucketName: string, objectName: string) {
  await minioClient.removeObject(bucketName, objectName);
}

// List objects in a MinIO bucket
export async function listFiles(bucketName: string, prefix: string = ''): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const objects: any[] = [];
    const stream = minioClient.listObjects(bucketName, prefix, true);
    
    stream.on('data', (obj) => objects.push(obj));
    stream.on('error', reject);
    stream.on('end', () => resolve(objects));
  });
}

// List all objects in all buckets
export async function listAllFiles(): Promise<Record<string, any[]>> {
  const result: Record<string, any[]> = {};
  
  for (const bucketName of Object.values(BUCKETS)) {
    try {
      const exists = await minioClient.bucketExists(bucketName);
      if (exists) {
        result[bucketName] = await listFiles(bucketName);
      } else {
        result[bucketName] = [];
      }
    } catch (error) {
      console.error(`Error listing files in bucket ${bucketName}:`, error);
      result[bucketName] = [];
    }
  }
  
  return result;
}

// Get file URL
export function getFileUrl(bucketName: string, objectName: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  
  // Check if we should use image proxy in any environment
  if (process.env.USE_IMAGE_PROXY === 'true') {
    return `/api/image-proxy/${bucketName}/${objectName}`;
  }
  
  // In production, check for different URL strategies
  if (isProduction) {
    // Strategy 1: Use custom public URL (for CDN/proxy setup)
    if (process.env.MINIO_PUBLIC_URL) {
      return `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${objectName}`;
    }
    
    // Strategy 2: Force HTTPS (requires MinIO to support HTTPS)
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

// Helper function to get bucket name based on file type
export function getBucketForFileType(fileType: string): string {
  if (fileType.startsWith('image/')) {
    return BUCKETS.IMAGES;
  } else if (fileType.startsWith('video/')) {
    return BUCKETS.VIDEOS;
  } else {
    return BUCKETS.DOCUMENTS;
  }
}

// Upload file from File object (for client-side use)
export async function uploadFileFromInput(
  file: File,
  _options: {
    folder?: string;
    tags?: string[];
  } = {}
): Promise<{ url: string; objectName: string }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const bucketName = getBucketForFileType(file.type);
  const fileName = file.name;
  
  const url = await uploadFile(buffer, fileName, bucketName, file.type);
  const objectName = url.split('/').pop() || fileName;
  
  return { url, objectName };
}

// Initialize MinIO on module load
initializeBuckets().catch(console.error);
