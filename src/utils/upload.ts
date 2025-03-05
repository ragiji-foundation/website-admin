/**
 * Utility for uploading files through the Cloudinary API endpoint
 */
export async function uploadFile(
  file: File,
  options?: {
    folder?: string;
    tags?: string[];
  }
): Promise<{ url: string; publicId: string }> {
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    // Add folder if specified
    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    // Add tags if specified
    if (options?.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    // Upload through our API endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage;

      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || `HTTP error: ${response.status}`;
      } catch (e) {
        errorMessage = `HTTP error: ${response.status}`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    return {
      url: data.url,
      publicId: data.publicId
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

/**
 * Upload an image with appropriate configurations
 */
export async function uploadImage(
  file: File,
  folder: string = 'images'
): Promise<string> {
  const result = await uploadFile(file, {
    folder,
    tags: ['image']
  });

  return result.url;
}

/**
 * Upload a video with appropriate configurations
 */
export async function uploadVideo(
  file: File,
  folder: string = 'videos'
): Promise<string> {
  const result = await uploadFile(file, {
    folder,
    tags: ['video']
  });

  return result.url;
}
