import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
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

// Get file URL
export function getFileUrl(bucketName: string, objectName: string): string {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  return `${protocol}://${endpoint}:${port}/${bucketName}/${objectName}`;
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
