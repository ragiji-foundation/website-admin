/**
 * Utility function for uploading images to Cloudinary
 */
export async function uploadToCloudinary(
  file: File,
  options?: {
    folder?: string;
    tags?: string[];
    transformation?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
  }
): Promise<{ url: string; publicId: string }> {
  if (!file) {
    throw new Error('No file provided');
  }

  // Use the correct upload preset name
  const uploadPreset = 'ragiji'; // Changed from 'ragiji-foundation'

  const {
    folder = process.env.CLOUDINARY_FOLDER || 'ragiji-foundation',
    tags = ['editor'],
    transformation = '',
    resourceType = 'image'
  } = options || {};

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  if (tags.length) {
    formData.append('tags', tags.join(','));
  }

  if (transformation) {
    formData.append('transformation', transformation);
  }

  const cloudName = 'dhyetvc2r'; // Hardcoding to ensure it's correct
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  console.log('Uploading to Cloudinary with preset:', uploadPreset);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const responseText = await response.text();
    console.log('Cloudinary response:', responseText);

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      } catch (e) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    }

    const result = JSON.parse(responseText);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
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
  if (!url || typeof url !== 'string') {
    console.warn('Invalid URL passed to getTransformedUrl:', url);
    return '/placeholder.svg';
  }

  if (!url.includes('cloudinary.com')) {
    return url;
  }

  const { crop = 'fill', quality = 80 } = options;

  try {
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
  } catch (error) {
    console.error('Error transforming URL:', error);
    return url;
  }
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


