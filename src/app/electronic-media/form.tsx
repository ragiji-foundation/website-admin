'use client';
import { useState, useEffect } from 'react';
import { Button, TextInput, Textarea, Group, Stack, NumberInput } from '@mantine/core';
import { MediaUpload } from '@/components/MediaUpload';
import { notifications } from '@mantine/notifications';

// Define proper types for the form data and props
interface ElectronicMediaFormData {
  id?: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  order: number;
  [key: string]: any; // Allow for any additional properties
}

interface ElectronicMediaFormProps {
  initialData?: Partial<ElectronicMediaFormData>;
  onSubmit: (data: ElectronicMediaFormData) => Promise<void>;
  onCancel: () => void;
}

export function ElectronicMediaForm({ initialData, onSubmit, onCancel }: ElectronicMediaFormProps) {
  // Initialize with proper type
  const [formData, setFormData] = useState<ElectronicMediaFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    videoUrl: initialData?.videoUrl || '',
    thumbnail: initialData?.thumbnail || '',
    order: initialData?.order || 0,
    ...initialData,
  });

  const [loading, setLoading] = useState(false);

  // Fix: Explicitly type the prev parameter
  const handleChange = (field: string, value: any) => {
    setFormData((prev: ElectronicMediaFormData) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      notifications.show({
        title: 'Success',
        message: initialData ? 'Electronic media updated successfully' : 'Electronic media created successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Form submission error:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Something went wrong',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Title"
          required
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
        />

        <MediaUpload
          label="Video"
          mediaType="video"
          folder="electronic-media/videos"
          value={formData.videoUrl}
          onChange={(url) => handleChange('videoUrl', url)}
          accept="video/mp4,video/webm,video/ogg"
          buttonLabel="Upload Video"
        />

        <MediaUpload
          label="Thumbnail"
          mediaType="image"
          folder="electronic-media/thumbnails"
          value={formData.thumbnail}
          onChange={(url) => handleChange('thumbnail', url)}
        />

        <NumberInput
          label="Display Order"
          value={formData.order}
          onChange={(value) => handleChange('order', value !== null ? value : 0)}
          min={0}
        />

        <Group justify="right" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update' : 'Create'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
