'use client';
import { useState } from 'react';
import { Button, TextInput, Textarea, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { MediaUpload } from '@/components/MediaUpload';

// Define types for form data and props
interface AwardFormData {
  title: string;
  year: string;
  description: string;
  imageUrl: string;
  organization: string;
  [key: string]: string; // Allow for any string-keyed additional properties
}

interface AwardFormProps {
  initialData?: Partial<AwardFormData>;
  onSubmit: (data: AwardFormData) => Promise<void>;
  onCancel: () => void;
}

export function AwardForm({ initialData, onSubmit, onCancel }: AwardFormProps) {
  const [formData, setFormData] = useState<AwardFormData>({
    title: initialData?.title || '',
    year: initialData?.year || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    organization: initialData?.organization || '',
  });

  const [loading, setLoading] = useState(false);

  // Fixed the TypeScript error by adding type to prev parameter
  const handleChange = (field: string, value: any) => {
    setFormData((prev: AwardFormData) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
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
          label="Award Title"
          required
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />

        <TextInput
          label="Year"
          required
          value={formData.year}
          onChange={(e) => handleChange('year', e.target.value)}
        />

        <TextInput
          label="Organization"
          required
          value={formData.organization}
          onChange={(e) => handleChange('organization', e.target.value)}
        />

        <MediaUpload
          label="Award Image"
          value={formData.imageUrl}
          onChange={(url) => handleChange('imageUrl', url)}
          folder="awards"
        />

        <Textarea
          label="Description"
          required
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          minRows={3}
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
