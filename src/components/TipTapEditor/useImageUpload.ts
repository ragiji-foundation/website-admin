import { useState } from 'react';
import { notifications } from '@mantine/notifications';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);

      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file provided');
      }

      // Check file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(`File size exceeds limit (${(maxSize / (1024 * 1024)).toFixed(2)}MB)`);
      }

      // Use our centralized API endpoint instead of direct Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'ragiji-foundation/editor');
      formData.append('tags', 'editor,content');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error('Invalid response from upload server');
      }

      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green',
      });

      return data.url;
    } catch (error) {
      console.error('Image upload error:', error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to upload image';

      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });

      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};
