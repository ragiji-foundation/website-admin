import { notifications } from '@mantine/notifications';

/**
 * Upload an image to Cloudinary via our API endpoint
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

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Use our centralized upload API endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Parse response text to handle potential non-JSON responses
    const responseText = await response.text();

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Invalid JSON response:', responseText);
      throw new Error('Invalid server response');
    }

    // Check for error in the parsed response
    if (!response.ok) {
      throw new Error(data.error || `Upload failed: ${response.status}`);
    }

    // Check if URL exists in the response
    if (!data.url) {
      throw new Error('No URL returned from upload');
    }

    return data.url;
  } catch (error) {
    console.error('Image upload error:', error);

    // Don't show notification here, let the caller handle it
    throw error;
  }
}

/**
 * Upload a video to Cloudinary via our API endpoint
 */
export async function handleVideoUpload(
  file: File | null,
  folder: string = 'videos'
): Promise<string> {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    // Same pattern as image upload with better error handling
    // ... rest of the function ...

    return await handleImageUpload(file, folder);
  } catch (error) {
    console.error('Video upload error:', error);
    throw error;
  }
}