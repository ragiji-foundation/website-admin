'use client';
import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import {
  Stack,
  TextInput,
  Switch,
  NumberInput,
  Button,
  Group,
  Box,
  Text,
  Tabs,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import TiptapEditor from '@/components/TiptapEditor';
import { MediaUpload } from '@/components/MediaUpload';

type Json = Record<string, any>;

interface SuccessStoryFormData {
  slug: string;
  title: string;
  titleHi?: string;
  content: string;
  contentHi?: string;
  personName: string;
  personNameHi?: string;
  location: string;
  locationHi?: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
}

interface SuccessStoryFormProps {
  initialData?: Partial<SuccessStoryFormData>;
  onSubmit: (data: SuccessStoryFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function SuccessStoryForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: SuccessStoryFormProps) {
  const [contentEn, setContentEn] = useState(initialData?.content || '');
  const [contentHi, setContentHi] = useState(initialData?.contentHi || '');

  const form = useForm<SuccessStoryFormData>({
    initialValues: {
      slug: initialData?.slug || '',
      title: initialData?.title || '',
      titleHi: initialData?.titleHi || '',
      content: initialData?.content || '',
      contentHi: initialData?.contentHi || '',
      personName: initialData?.personName || '',
      personNameHi: initialData?.personNameHi || '',
      location: initialData?.location || '',
      locationHi: initialData?.locationHi || '',
      imageUrl: initialData?.imageUrl || '',
      featured: initialData?.featured || false,
      order: initialData?.order || 0,
    },
    validate: {
      title: (value) => !value.trim() && 'Title is required',
      slug: (value) => !value.trim() && 'Slug is required',
      personName: (value) => !value.trim() && 'Person name is required',
      location: (value) => !value.trim() && 'Location is required',
    },
  });

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Auto-generate slug when title changes
  useEffect(() => {
    if (form.values.title && !initialData?.slug) {
      const slug = generateSlug(form.values.title);
      form.setFieldValue('slug', slug);
    }
  }, [form.values.title]);

  // Update form when content changes - fix infinite loop
  useEffect(() => {
    form.setFieldValue('content', contentEn);
  }, [contentEn]);

  useEffect(() => {
    form.setFieldValue('contentHi', contentHi);
  }, [contentHi]);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      form.setFieldValue('imageUrl', data.url);

      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red',
      });
    }
  };

  const handleSubmit = async (values: SuccessStoryFormData) => {
    try {
      await onSubmit({
        ...values,
        content: contentEn,
        contentHi: contentHi,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save',
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Title (English)"
          placeholder="Success story title"
          required
          {...form.getInputProps('title')}
        />

        <TextInput
          label="Title (Hindi)"
          placeholder="सफलता की कहानी का शीर्षक"
          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
          {...form.getInputProps('titleHi')}
        />

        <TextInput
          label="Slug"
          placeholder="url-friendly-slug"
          required
          {...form.getInputProps('slug')}
        />

        <TextInput
          label="Person Name (English)"
          placeholder="Name of the person"
          required
          {...form.getInputProps('personName')}
        />

        <TextInput
          label="Person Name (Hindi)"
          placeholder="व्यक्ति का नाम"
          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
          {...form.getInputProps('personNameHi')}
        />

        <TextInput
          label="Location (English)"
          placeholder="City, State"
          required
          {...form.getInputProps('location')}
        />

        <TextInput
          label="Location (Hindi)"
          placeholder="शहर, राज्य"
          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
          {...form.getInputProps('locationHi')}
        />

        <MediaUpload
          label="Story Image"
          value={form.values.imageUrl || ''}
          onChange={(url) => form.setFieldValue('imageUrl', url)}
          folder="success-stories"
        />

        <Box>
          <Text fw={500} mb="xs">Story Content</Text>
          <Tabs defaultValue="english">
            <Tabs.List>
              <Tabs.Tab value="english">English</Tabs.Tab>
              <Tabs.Tab value="hindi">Hindi</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="english" pt="md">
              <TiptapEditor
                content={contentEn}
                onChange={(content: string) => setContentEn(content)}
                minHeight={400}
                placeholder="Write the success story in English..."
              />
            </Tabs.Panel>

            <Tabs.Panel value="hindi" pt="md">
              <TiptapEditor
                content={contentHi}
                onChange={(content: string) => setContentHi(content)}
                minHeight={400}
                placeholder="सफलता की कहानी हिंदी में लिखें..."
              />
            </Tabs.Panel>
          </Tabs>
        </Box>

        <Group>
          <Switch
            label="Featured Story"
            {...form.getInputProps('featured', { type: 'checkbox' })}
          />
          <NumberInput
            label="Display Order"
            min={0}
            {...form.getInputProps('order')}
          />
        </Group>

        <Group justify="right" mt="md">
          <Button variant="light" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {initialData ? 'Update Story' : 'Create Story'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}