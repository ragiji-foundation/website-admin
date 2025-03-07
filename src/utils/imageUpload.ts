import { uploadToCloudinary } from './cloudinary';

/**
 * Upload an image to Cloudinary
 */
export async function handleImageUpload(
  file: File | null,
  folder: string = 'images'
): Promise<string> {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size exceeds limit (${(maxSize / (1024 * 1024)).toFixed(2)}MB)`);
    }

    // Use the uploadToCloudinary utility
    const result = await uploadToCloudinary(file, {
      folder,
      tags: ['gallery', folder],
      resourceType: 'image'
    });

    return result.url;
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
}

/**
 * Upload a video to Cloudinary
 */
export async function handleVideoUpload(
  file: File | null,
  folder: string = 'videos'
): Promise<string> {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    // Use the uploadToCloudinary utility for videos
    const result = await uploadToCloudinary(file, {
      folder,
      tags: ['gallery', 'video', folder],
      resourceType: 'video'
    });

    return result.url;
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
}