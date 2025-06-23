'use client';
import { useState } from 'react';
import { Button, TextInput, Textarea, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { MediaUpload } from '@/components/MediaUpload';

// Define types for form data and props
interface AwardFormData {
  title: string;
  titleHi?: string;
  year: string;
  description: string;
  descriptionHi?: string;
  imageUrl: string;
  organization: string;
  organizationHi?: string;
  [key: string]: string | undefined; // Allow for any string-keyed additional properties
}

interface AwardFormProps {
  initialData?: Partial<AwardFormData>;
  onSubmit: (data: AwardFormData) => Promise<void>;
  onCancel: () => void;
}

export function AwardForm({ initialData, onSubmit, onCancel }: AwardFormProps) {
  const [formData, setFormData] = useState<AwardFormData>({
    title: initialData?.title || '',
    titleHi: initialData?.titleHi || '',
    year: initialData?.year || '',
    description: initialData?.description || '',
    descriptionHi: initialData?.descriptionHi || '',
    imageUrl: initialData?.imageUrl || '',
    organization: initialData?.organization || '',
    organizationHi: initialData?.organizationHi || '',
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
          label="Award Title (English)"
          required
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter award title in English"
        />

        <TextInput
          label="Award Title (Hindi)"
          value={formData.titleHi || ''}
          onChange={(e) => handleChange('titleHi', e.target.value)}
          placeholder="पुरस्कार का शीर्षक हिंदी में दर्ज करें"
          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
        />

        <TextInput
          label="Year"
          required
          value={formData.year}
          onChange={(e) => handleChange('year', e.target.value)}
          placeholder="e.g., 2024"
        />

        <TextInput
          label="Organization (English)"
          required
          value={formData.organization}
          onChange={(e) => handleChange('organization', e.target.value)}
          placeholder="Awarding organization name in English"
        />

        <TextInput
          label="Organization (Hindi)"
          value={formData.organizationHi || ''}
          onChange={(e) => handleChange('organizationHi', e.target.value)}
          placeholder="पुरस्कार देने वाली संस्था का नाम हिंदी में"
          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
        />

        <MediaUpload
          label="Award Image"
          value={formData.imageUrl}
          onChange={(url) => handleChange('imageUrl', url)}
          folder="awards"
        />

        <Textarea
          label="Description (English)"
          required
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          minRows={3}
          placeholder="Award description in English"
        />

        <Textarea
          label="Description (Hindi)"
          value={formData.descriptionHi || ''}
          onChange={(e) => handleChange('descriptionHi', e.target.value)}
          minRows={3}
          placeholder="पुरस्कार का विवरण हिंदी में"
          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
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