/**
 * CENTRALIZED UPLOAD UTILITY
 * 
 * This is the SINGLE SOURCE OF TRUTH for all file uploads.
 * All other upload utilities should be deprecated.
 */

import { notifications } from '@mantine/notifications';

// Centralized types
export interface UploadOptions {
  folder?: string;
  tags?: string[];
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  showNotifications?: boolean;
  progressCallback?: (progress: number) => void;
  maxSize?: number; // in MB
}

export interface UploadResult {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
}

// Centralized validation
const FILE_VALIDATIONS = {
  maxSize: 10 * 1024 * 1024, // 10MB default
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
} as const;

/**
 * Centralized file validation
 */
export function validateFile(file: File, options: UploadOptions = {}): void {
  if (!file) {
    throw new Error('No file provided');
  }

  // Size validation
  const maxSize = options.maxSize ? options.maxSize * 1024 * 1024 : FILE_VALIDATIONS.maxSize;
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    throw new Error(`File size exceeds limit (${maxSizeMB}MB)`);
  }

  // Type validation
  const { resourceType = 'auto' } = options;
  if (resourceType === 'image' && !FILE_VALIDATIONS.allowedImageTypes.includes(file.type as typeof FILE_VALIDATIONS.allowedImageTypes[number])) {
    throw new Error('Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed.');
  }
  
  if (resourceType === 'video' && !FILE_VALIDATIONS.allowedVideoTypes.includes(file.type as typeof FILE_VALIDATIONS.allowedVideoTypes[number])) {
    throw new Error('Invalid video type. Only MP4, WebM, OGG, AVI, and MOV are allowed.');
  }
}

/**
 * MASTER UPLOAD FUNCTION - Use this for ALL uploads
 */
export async function uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
  const { showNotifications = true, progressCallback } = options;

  try {
    // Centralized validation
    validateFile(file, options);

    const formData = new FormData();
    formData.append('file', file);

    let response: Response;

    if (progressCallback) {
      // Upload with progress tracking
      response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            progressCallback(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, { status: xhr.status }));
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));
        
        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
    } else {
      // Simple fetch upload
      response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();

    if (showNotifications) {
      notifications.show({
        title: 'Success',
        message: 'File uploaded successfully',
        color: 'green',
      });
    }

    return {
      url: result.secure_url || result.url,
      publicId: result.public_id || result.objectName,
      bytes: result.bytes || file.size,
      format: result.format || file.type.split('/')[1],
    };

  } catch (error) {
    console.error('Error uploading file:', error);
    
    if (showNotifications) {
      notifications.show({
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Failed to upload file',
        color: 'red',
      });
    }
    
    throw error;
  }
}

/**
 * Specialized upload functions
 */
export async function uploadImage(file: File, options: Omit<UploadOptions, 'resourceType'> = {}): Promise<UploadResult> {
  return uploadFile(file, { ...options, resourceType: 'image' });
}

export async function uploadVideo(file: File, options: Omit<UploadOptions, 'resourceType'> = {}): Promise<UploadResult> {
  return uploadFile(file, { ...options, resourceType: 'video' });
}

/**
 * Editor-specific upload (no notifications)
 */
export async function uploadForEditor(file: File): Promise<string> {
  const result = await uploadImage(file, {
    folder: 'editor',
    tags: ['editor', 'content'],
    showNotifications: false,
  });
  return result.url;
}

/**
 * Utility functions (keep for compatibility)
 */
export function getTransformedUrl(
  url: string,
  _width?: number,
  _height?: number,
  _options: { crop?: string; quality?: number } = {}
): string {
  if (!url || typeof url !== 'string') {
    console.warn('Invalid URL passed to getTransformedUrl:', url);
    return '/placeholder.svg';
  }
  return url; // MinIO doesn't support transformations yet
}

export function getPublicIdFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts.length > 2 ? pathParts.slice(2).join('/') : null;
  } catch (error) {
    console.error('Error extracting object name from URL:', error);
    return null;
  }
}

export function getVideoThumbnail(videoUrl: string, _options: { second?: number; format?: string } = {}): string {
  return videoUrl; // Placeholder - implement video thumbnail generation later
}

/**
 * Delete file from storage
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    const response = await fetch('/api/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Delete failed');
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Legacy compatibility exports
export const uploadToMinio = uploadFile;
export const uploadToCloudinary = uploadFile;
export const handleImageUpload = uploadImage;
export const handleVideoUpload = uploadVideo;
