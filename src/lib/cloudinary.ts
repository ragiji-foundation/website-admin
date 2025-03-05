/**
 * Client-side utility for uploading to Cloudinary via our API endpoint
 * This avoids direct use of the Cloudinary SDK in the browser
 */

interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  width?: number;
  height?: number;
  bytes?: number;
  [key: string]: any;
}

/**
 * Upload a file to Cloudinary via our API endpoint
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<CloudinaryResponse> {
  const formData = new FormData();
  formData.append('file', file);

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.resourceType) {
    formData.append('resourceType', options.resourceType);
  }

  try {
    const response = await fetch('/api/cloudinary', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}
