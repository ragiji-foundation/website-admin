import { minioClient, DEFAULT_BUCKET, initializeBucket, getMinioPublicUrl } from '@/config/minio';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadOptions {
  folder?: string;
  bucket?: string;
  generateThumbnail?: boolean;
  watermark?: boolean;
}

export interface UploadResult {
  url: string;
  publicId: string;
  originalFilename: string;
  size: number;
  format: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

export interface MinioFileInfo {
  name: string;
  size: number;
  lastModified: Date;
  etag: string;
  url: string;
}

export interface MinioStatResult {
  size: number;
  etag: string;
  lastModified: Date;
  metaData: Record<string, string>;
}

// Upload file to MinIO
export async function uploadToMinio(
  file: File | Buffer,
  filename: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    const {
      folder = 'uploads',
      bucket = DEFAULT_BUCKET,
    } = options;

    // Ensure bucket exists
    await initializeBucket(bucket);

    // Generate unique filename
    const fileExtension = path.extname(filename);
    const baseName = path.basename(filename, fileExtension);
    const uniqueId = uuidv4();
    const objectName = `${folder}/${uniqueId}-${baseName}${fileExtension}`;

    let buffer: Buffer;
    let size: number;

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      size = file.size;
    } else {
      buffer = file;
      size = buffer.length;
    }

    // Upload file to MinIO
    await minioClient.putObject(bucket, objectName, buffer, size);

    // Get file info
    const stat = await minioClient.statObject(bucket, objectName);
    
    const result: UploadResult = {
      url: getMinioPublicUrl(bucket, objectName),
      publicId: objectName,
      originalFilename: filename,
      size: stat.size,
      format: fileExtension.slice(1),
    };

    return result;
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    throw new Error('Failed to upload file to MinIO');
  }
}

// Delete file from MinIO
export async function deleteFromMinio(
  publicId: string,
  bucket: string = DEFAULT_BUCKET
): Promise<boolean> {
  try {
    await minioClient.removeObject(bucket, publicId);
    return true;
  } catch (error) {
    console.error('Error deleting from MinIO:', error);
    return false;
  }
}

// Get file info from MinIO
export async function getFileInfo(
  publicId: string,
  bucket: string = DEFAULT_BUCKET
): Promise<MinioStatResult> {
  try {
    return await minioClient.statObject(bucket, publicId);
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
}

// List files in a folder
export async function listFiles(
  folder: string = '',
  bucket: string = DEFAULT_BUCKET
): Promise<MinioFileInfo[]> {
  try {
    const objectsStream = minioClient.listObjects(bucket, folder, true);
    const objects: MinioFileInfo[] = [];

    return new Promise((resolve, reject) => {
      objectsStream.on('data', (obj) => {
        if (obj.name) {
          objects.push({
            name: obj.name,
            size: obj.size || 0,
            lastModified: obj.lastModified || new Date(),
            etag: obj.etag || '',
            url: getMinioPublicUrl(bucket, obj.name),
          });
        }
      });

      objectsStream.on('error', (err) => {
        reject(err);
      });

      objectsStream.on('end', () => {
        resolve(objects);
      });
    });
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

// Copy file within MinIO
export async function copyFile(
  sourcePublicId: string,
  targetFolder: string,
  newFilename?: string,
  bucket: string = DEFAULT_BUCKET
): Promise<string> {
  try {
    const targetName = newFilename 
      ? `${targetFolder}/${newFilename}`
      : `${targetFolder}/${path.basename(sourcePublicId)}`;

    await minioClient.copyObject(bucket, targetName, `/${bucket}/${sourcePublicId}`);
    return targetName;
  } catch (error) {
    console.error('Error copying file:', error);
    throw error;
  }
}

// Generate thumbnail (basic implementation - can be enhanced with image processing)
export async function generateThumbnail(
  sourcePublicId: string,
  bucket: string = DEFAULT_BUCKET
): Promise<string> {
  try {
    // For now, just return the original URL
    // In a production setup, you'd integrate with an image processing service
    // or implement server-side image resizing
    return getMinioPublicUrl(bucket, sourcePublicId);
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
}

// Bulk upload files
export async function bulkUploadToMinio(
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  try {
    const uploadPromises = files.map(file => 
      uploadToMinio(file, file.name, options)
    );
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error in bulk upload:', error);
    throw error;
  }
}
