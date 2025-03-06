/**
 * Uploads a file to Cloudinary
 * 
 * @param file - The file to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with upload result
 */
export async function uploadToCloudinary(file: File, folder: string = 'uploads'): Promise<any> {
  // Create a FormData instance
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    // Call your backend API to handle the Cloudinary upload securely
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * Get a Cloudinary URL with transformation parameters
 * 
 * @param url Original Cloudinary URL
 * @param width Desired width
 * @param height Desired height
 * @param options Additional options (crop, quality, etc)
 * @returns Transformed Cloudinary URL
 */
export function getTransformedUrl(
  url: string,
  width?: number,
  height?: number,
  options: { crop?: string; quality?: number } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { crop = 'fill', quality = 80 } = options;

  // Find the upload part of the URL
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  // Construct the transformation string
  let transformation = 'c_' + crop;

  if (width) transformation += ',w_' + width;
  if (height) transformation += ',h_' + height;

  transformation += ',q_' + quality;

  // Insert transformation into URL
  return url.slice(0, uploadIndex + 8) + transformation + '/' + url.slice(uploadIndex + 8);
}

/**
 * Extract the public ID from a Cloudinary URL
 * 
 * @param url Cloudinary URL
 * @returns The public ID of the resource
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }

  const regex = /\/v\d+\/(.+?)(?:\.\w+)?$/;
  const match = url.match(regex);

  return match ? match[1] : null;
}

/**
 * Generate a Cloudinary video thumbnail URL
 * 
 * @param videoUrl Cloudinary video URL
 * @param options Optional settings like time position, format
 * @returns URL for the video thumbnail
 */
export function getVideoThumbnail(
  videoUrl: string,
  options: { second?: number; format?: string } = {}
): string {
  const { second = 0, format = 'jpg' } = options;

  if (!videoUrl || !videoUrl.includes('cloudinary.com')) {
    return videoUrl;
  }

  const publicId = getPublicIdFromUrl(videoUrl);
  if (!publicId) return videoUrl;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return videoUrl;

  return `https://res.cloudinary.com/${cloudName}/video/upload/so_${second},f_${format}/${publicId}.${format}`;
}


