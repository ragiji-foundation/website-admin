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
