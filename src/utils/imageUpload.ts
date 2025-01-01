import { notifications } from '@mantine/notifications';

export async function handleImageUpload(file: File | null) {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data.url;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload image';
    notifications.show({
      title: 'Error',
      message,
      color: 'red'
    });
    return null;
  }
} 