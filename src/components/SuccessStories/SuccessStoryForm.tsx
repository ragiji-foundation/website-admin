"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@mantine/form';
import TiptapEditor from '@/components/TiptapEditor';
import { RichTextContent } from '@/components/RichTextContent';
import { slugify } from '@/utils/strings';
import { uploadToCloudinary } from '@/utils/cloudinary';
import Image from 'next/image';
import {
  Button,
  TextInput,
  Checkbox,
  Group,
  Text,
  Grid,
  Stack,
  Box,
  FileInput,
  NumberInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload, IconLoader } from '@tabler/icons-react';

interface SuccessStoryFormProps {
  initialData?: SuccessStory | null;
  isEditing?: boolean;
}

interface SuccessStory {
  id?: string;
  title: string;
  slug: string;
  content: any; // Rich text content object
  featured: boolean;
  imageUrl: string;
  personName: string; // Changed from clientName
  location: string; // Changed from clientCompany
  order: number; // New field
  createdAt?: string;
  updatedAt?: string;
}

export function SuccessStoryForm({ initialData, isEditing = false }: SuccessStoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [imageUploading, setImageUploading] = useState(false);
  const [content, setContent] = useState<any>(initialData?.content || '');

  // Using Mantine form
  const form = useForm({
    initialValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      featured: initialData?.featured || false,
      imageUrl: initialData?.imageUrl || '',
      personName: initialData?.personName || '',
      location: initialData?.location || '',
      order: initialData?.order || 1,
    },
    validate: {
      title: (value) => value.trim().length === 0 ? 'Title is required' : null,
      slug: (value) => value.trim().length === 0 ? 'Slug is required' : null,
      personName: (value) => value.trim().length === 0 ? 'Person name is required' : null,
      location: (value) => value.trim().length === 0 ? 'Location is required' : null,
      order: (value) => value < 1 ? 'Order must be at least 1' : null,
    }
  });

  // Watch for title changes to auto-generate slug
  useEffect(() => {
    const title = form.values.title;
    if (title && !isEditing) {
      form.setFieldValue('slug', slugify(title));
    }
  }, [form.values.title, isEditing, form]);

  // Update form when content changes
  useEffect(() => {
    form.setFieldValue('content', content);
  }, [content, form]);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    try {
      setImageUploading(true);
      const result = await uploadToCloudinary(file, {
        folder: 'success-stories',
        tags: ['success-story', 'cover-image'],
        resourceType: 'image'
      });

      setImageUrl(result.url);
      form.setFieldValue('imageUrl', result.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      notifications.show({
        title: "Upload Failed",
        message: "There was a problem uploading your image.",
        color: "red",
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Handle image upload for the TiptapEditor
  const handleEditorImageUpload = async (file: File): Promise<string> => {
    if (!file) return '';

    try {
      const result = await uploadToCloudinary(file, {
        folder: 'success-stories/content',
        tags: ['success-story', 'content-image'],
        resourceType: 'image'
      });

      return result.url;
    } catch (error) {
      console.error('Error uploading image to editor:', error);
      notifications.show({
        title: "Upload Failed",
        message: "There was a problem uploading your image to the editor.",
        color: "red",
      });
      return '';
    }
  };

  const onSubmit = async (values: SuccessStory) => {
    try {
      setIsSubmitting(true);

      // Add timestamps
      const submissionData = {
        ...values,
        updatedAt: new Date().toISOString(),
        createdAt: initialData?.createdAt || new Date().toISOString()
      };

      const url = isEditing && initialData?.id
        ? `/api/success-stories/${initialData.id}`
        : '/api/success-stories';

      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to save success story');
      }

      notifications.show({
        title: isEditing ? "Story Updated" : "Story Created",
        message: isEditing
          ? "Your success story has been updated successfully."
          : "Your success story has been created successfully.",
        color: "green",
      });

      router.push('/success-stories');
      router.refresh();
    } catch (error) {
      console.error('Error saving success story:', error);
      notifications.show({
        title: "Error",
        message: "There was a problem saving your success story.",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Title"
              placeholder="Success Story Title"
              withAsterisk
              {...form.getInputProps('title')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Slug"
              placeholder="success-story-slug"
              withAsterisk
              {...form.getInputProps('slug')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Person Name"
              placeholder="Rahul Kumar"
              withAsterisk
              {...form.getInputProps('personName')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Location"
              placeholder="Delhi"
              withAsterisk
              {...form.getInputProps('location')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              label="Display Order"
              placeholder="1"
              min={1}
              withAsterisk
              {...form.getInputProps('order')}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box pt={25}>
              <Checkbox
                label="Featured Story"
                {...form.getInputProps('featured', { type: 'checkbox' })}
              />
            </Box>
          </Grid.Col>
        </Grid>

        <Stack gap="sm">
          <Text fw={500} size="sm" component="label">Cover Image</Text>
          {imageUrl && (
            <Box pos="relative" h={200} w="100%" style={{ overflow: 'hidden', borderRadius: 8 }}>
              <Image
                src={imageUrl}
                alt="Success Story Cover"
                fill
                style={{ objectFit: 'cover' }}
              />
            </Box>
          )}

          <FileInput
            placeholder="Click to upload image"
            accept="image/*"
            onChange={handleImageUpload}
            leftSection={imageUploading ? <IconLoader size="1rem" /> : <IconUpload size="1rem" />}
            disabled={imageUploading}
            label={imageUploading ? "Uploading..." : "Upload Image"}
          />
        </Stack>

        <Stack gap="sm">
          <Text fw={500} size="sm" component="label">Content</Text>
          <Box style={{ minHeight: 400, border: '1px solid #e9ecef', borderRadius: 8 }}>
            <TiptapEditor
              content={initialData?.content || ''}
              onChange={setContent}
              placeholder="Write your success story here..."
              onImageUpload={handleEditorImageUpload}
            />
          </Box>
          {form.errors.content && (
            <Text c="red" size="sm">{form.errors.content}</Text>
          )}
        </Stack>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={() => router.push('/success-stories')}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Update Story' : 'Create Story'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
