/**
 * Centralized Upload Service
 * 
 * This is the ONLY upload utility that should be used throughout the application.
 * All other upload utilities are deprecated and will be removed.
 */

import { notifications } from '@mantine/notifications';

// Types
export interface UploadOptions {
  folder?: string;
  tags?: string[];
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  showNotifications?: boolean;
  progressCallback?: (progress: number) => void;
}

export interface UploadResponse {
  success: boolean;
  url: string;
  secure_url: string; // For backward compatibility
  public_id: string;
  original_filename: string;
  bytes: number;
  format: string;
  resource_type: string;
}

export interface UploadResult {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
}

/**
 * Main upload function - Use this for ALL file uploads
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    showNotifications = true,
    progressCallback
  } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    const error = `File size exceeds limit (${(maxSize / (1024 * 1024)).toFixed(2)}MB)`;
    if (showNotifications) {
      notifications.show({
        title: 'Error',
        message: error,
        color: 'red',
      });
    }
    throw new Error(error);
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    let response: Response;

    if (progressCallback) {
      // Use XMLHttpRequest for progress tracking
      response = await uploadWithProgress(formData, progressCallback);
    } else {
      // Use fetch for simple uploads
      response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result: UploadResponse = await response.json();

    if (showNotifications) {
      notifications.show({
        title: 'Success',
        message: 'File uploaded successfully',
        color: 'green',
      });
    }

    return {
      url: result.secure_url || result.url,
      publicId: result.public_id,
      bytes: result.bytes,
      format: result.format,
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
 * Upload with progress tracking using XMLHttpRequest
 */
function uploadWithProgress(
  formData: FormData,
  progressCallback: (progress: number) => void
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        progressCallback(progress);
      }
    };

    xhr.onload = () => {
      progressCallback(0); // Reset progress
      
      if (xhr.status >= 200 && xhr.status < 300) {
        // Create a Response-like object
        const response = {
          ok: true,
          status: xhr.status,
          json: () => Promise.resolve(JSON.parse(xhr.responseText)),
        } as Response;
        resolve(response);
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      progressCallback(0); // Reset progress
      reject(new Error('Network error during upload'));
    };

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

/**
 * Specialized image upload function
 */
export async function uploadImage(
  file: File,
  options: Omit<UploadOptions, 'resourceType'> = {}
): Promise<UploadResult> {
  // Validate image file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    const error = 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.';
    if (options.showNotifications !== false) {
      notifications.show({
        title: 'Error',
        message: error,
        color: 'red',
      });
    }
    throw new Error(error);
  }

  return uploadFile(file, { ...options, resourceType: 'image' });
}

/**
 * Specialized video upload function
 */
export async function uploadVideo(
  file: File,
  options: Omit<UploadOptions, 'resourceType'> = {}
): Promise<UploadResult> {
  // Validate video file type
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
  if (!allowedTypes.includes(file.type)) {
    const error = 'Invalid file type. Only MP4, WebM, OGG, AVI, and MOV videos are allowed.';
    if (options.showNotifications !== false) {
      notifications.show({
        title: 'Error',
        message: error,
        color: 'red',
      });
    }
    throw new Error(error);
  }

  return uploadFile(file, { ...options, resourceType: 'video' });
}

/**
 * Editor-specific upload function for TipTap/Rich Text editors
 */
export async function uploadForEditor(file: File): Promise<string> {
  const result = await uploadImage(file, {
    folder: 'editor',
    tags: ['editor', 'content'],
    showNotifications: false, // Let editor handle notifications
  });
  
  return result.url;
}

// Legacy compatibility functions - DEPRECATED, use uploadFile instead
export const uploadToMinio = uploadFile;
export const uploadToCloudinary = uploadFile;
export const handleImageUpload = uploadImage;
export const handleVideoUpload = uploadVideo;

/**
 * Get a transformed URL (placeholder for Cloudinary compatibility)
 * Since MinIO doesn't have built-in transformations, we return the original URL
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
  return url;
}

/**
 * Extract the object name from a MinIO URL
 */
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

/**
 * Delete a file from MinIO storage
 */
export async function deleteFile(
  url: string,
  options: { showNotifications?: boolean } = {}
): Promise<boolean> {
  const { showNotifications = true } = options;

  try {
    if (!url) {
      throw new Error('No URL provided');
    }

    // Extract object name from URL
    let objectName = getPublicIdFromUrl(url);
    let bucketName = 'ragiji-images'; // Default bucket
    
    if (!objectName) {
      // Try alternative extraction for image proxy URLs like /api/image-proxy/ragiji-images/filename.jpg
      if (url.includes('/api/image-proxy/')) {
        const parts = url.split('/api/image-proxy/')[1];
        if (parts) {
          const pathParts = parts.split('/');
          if (pathParts.length >= 2) {
            bucketName = pathParts[0];
            objectName = pathParts.slice(1).join('/');
          }
        }
      }
      
      if (!objectName) {
        throw new Error('Could not extract object name from URL');
      }
    } else {
      // Check if objectName contains bucket prefix (e.g., "ragiji-images/filename.jpg")
      if (objectName.includes('/')) {
        const parts = objectName.split('/');
        if (parts.length >= 2 && parts[0].includes('ragiji')) {
          bucketName = parts[0];
          objectName = parts.slice(1).join('/');
        }
      }
    }

    console.log('Deleting file:', { url, bucketName, objectName }); // Debug log

    const response = await fetch(`/api/upload?objectName=${encodeURIComponent(objectName)}&bucket=${encodeURIComponent(bucketName)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete file');
    }

    if (showNotifications) {
      notifications.show({
        title: 'Success',
        message: 'File deleted successfully',
        color: 'green',
      });
    }

    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete file';
    
    console.error('Error deleting file:', error);
    
    if (showNotifications) {
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Generate a video thumbnail URL (placeholder)
 */
export function getVideoThumbnail(
  videoUrl: string,
  _options: { second?: number; format?: string } = {}
): string {
  return videoUrl;
}
