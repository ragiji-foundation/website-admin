import { useState, useEffect } from 'react';
import {
  TextInput,
  Button,
  Group,
  SimpleGrid,
  Card,
  Title,
  NumberInput,
  Select,
  Stack,
  Text,
  Box,
  Image,
  Alert,
  Tabs,
  Divider
} from '@mantine/core';
import { IconDeviceFloppy, IconArrowLeft, IconUpload, IconTrash, IconPhoto, IconMovie } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { slugify } from '@/utils/strings';
import { Feature, MediaItem } from '@/types/feature';
import TiptapEditor from '@/components/TiptapEditor'; // Corrected import path
import { uploadToCloudinary } from '@/utils/cloudinary';

interface FeatureFormProps {
  initialData?: Feature;
  isEditing?: boolean;
}

export function FeatureForm({ initialData, isEditing = false }: FeatureFormProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(initialData?.description || null);
  const [contentHi, setContentHi] = useState(initialData?.descriptionHi || null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>(
    initialData?.mediaItem?.type || 'image'
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(
    initialData?.mediaItem?.type === 'image' ? initialData.mediaItem.url : ''
  );
  const [previewThumbnail, setPreviewThumbnail] = useState<string>(
    initialData?.mediaItem?.thumbnail || ''
  );
  const router = useRouter();

  const form = useForm({
    initialValues: {
      title: initialData?.title || '',
      titleHi: initialData?.titleHi || '',
      slug: initialData?.slug || '',
      category: initialData?.category || '',
      order: initialData?.order || 0,
      videoUrl: initialData?.mediaItem?.type === 'video' ? initialData.mediaItem.url : '',
    },
    validate: {
      title: (value) => !value ? 'Title is required' : null,
      slug: (value) => !value ? 'Slug is required' : null,
    }
  });

  // Autogenerate slug when title changes
  useEffect(() => {
    if (!isEditing && form.values.title && !form.values.slug) {
      form.setFieldValue('slug', slugify(form.values.title));
    }
  }, [form.values.title, form.values.slug, isEditing, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setPreviewThumbnail(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      // Validate form inputs
      if (!content) {
        notifications.show({
          title: 'Error',
          message: 'Please add some content to the feature',
          color: 'red'
        });
        return;
      }

      // Prepare media item
      let mediaItem: MediaItem;

      if (mediaType === 'image') {
        if (!previewImage && !imageFile) {
          notifications.show({
            title: 'Error',
            message: 'Please upload an image',
            color: 'red'
          });
          return;
        }

        // Upload new image if provided
        let imageUrl = previewImage;
        if (imageFile) {
          const uploadResult = await uploadToCloudinary(imageFile, { folder: 'features' });
          imageUrl = uploadResult.url;
        }

        mediaItem = {
          type: 'image',
          url: imageUrl
        };
      } else {
        // Handle video type
        if (!values.videoUrl) {
          notifications.show({
            title: 'Error',
            message: 'Please provide a video URL',
            color: 'red'
          });
          return;
        }

        // Upload thumbnail if provided
        let thumbnailUrl = previewThumbnail;
        if (thumbnailFile) {
          const uploadResult = await uploadToCloudinary(thumbnailFile, { folder: 'features/thumbnails' });
          thumbnailUrl = uploadResult.url;
        }

        mediaItem = {
          type: 'video',
          url: values.videoUrl,
          thumbnail: thumbnailUrl
        };
      }

      // Prepare feature object with proper typing for API
      const featureData = {
        title: values.title,
        titleHi: values.titleHi || '',
        slug: values.slug, // API will map this to mediaType
        description: content,
        descriptionHi: contentHi || '',
        category: values.category || undefined, // API will map this to section
        order: values.order,
        mediaItem // API will extract mediaType, mediaUrl and thumbnail from this
      };

      // Add ID if editing
      if (isEditing && initialData) {
        (featureData as typeof featureData & { id: string }).id = initialData.id;
      }

      // Send to API
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/features/${initialData?.id}` : '/api/features';

      console.log('Sending data to API:', featureData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(featureData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API error response:', errorData);
        throw new Error(isEditing ? 'Failed to update feature' : 'Failed to create feature');
      }

      notifications.show({
        title: 'Success',
        message: isEditing ? 'Feature updated successfully' : 'Feature created successfully',
        color: 'green'
      });

      router.push('/features');
    } catch (error) {
      console.error('Form submission error:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'An error occurred',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={2} mb="lg">
        {isEditing ? 'Edit Feature' : 'Create Feature'}
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
          <TextInput
            required
            label="Title (English)"
            placeholder="Feature title"
            {...form.getInputProps('title')}
          />
          <TextInput
            label="Title (Hindi)"
            placeholder="फीचर का शीर्षक"
            {...form.getInputProps('titleHi')}
          />
        </SimpleGrid>

        <TextInput
          required
          label="Slug"
          placeholder="feature-slug"
          description="URL-friendly identifier"
          {...form.getInputProps('slug')}
          mb="md"
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} mb="md">
          <Select
            label="Category"
            placeholder="Select category"
            data={[
              { value: 'education', label: 'Education' },
              { value: 'technology', label: 'Technology' },
              { value: 'health', label: 'Health' },
              { value: 'community', label: 'Community' },
              { value: 'environment', label: 'Environment' }
            ]}
            clearable
            {...form.getInputProps('category')}
          />
          <NumberInput
            label="Display Order"
            placeholder="0"
            min={0}
            {...form.getInputProps('order')}
          />
        </SimpleGrid>

        <Box mb="md">
          <Text fw={500} size="sm" mb={5}>Description (English)</Text>
          <TiptapEditor
            content={content || ''}
            onChange={setContent}
            placeholder="Enter feature description in English..."
          />
        </Box>

        <Box mb="md">
          <Text fw={500} size="sm" mb={5}>Description (Hindi)</Text>
          <TiptapEditor
            content={contentHi || ''}
            onChange={setContentHi}
            placeholder="हिंदी में फीचर विवरण दर्ज करें..."
          />
        </Box>

        <Divider my="lg" label="Media" labelPosition="center" />

        <Tabs value={mediaType} onChange={(value) => setMediaType(value as 'image' | 'video')} mb="lg">
          <Tabs.List>
            <Tabs.Tab value="image" leftSection={<IconPhoto size={14} />}>
              Image
            </Tabs.Tab>
            <Tabs.Tab value="video" leftSection={<IconMovie size={14} />}>
              Video
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="image" pt="xs">
            <Stack>
              <Text size="sm">Upload a feature image</Text>
              {previewImage ? (
                <Box style={{ position: 'relative' }}>
                  <Image
                    src={previewImage}
                    alt="Feature preview"
                    height={200}
                    fit="contain"
                  />
                  <Button
                    variant="light"
                    color="red"
                    onClick={() => {
                      setPreviewImage('');
                      setImageFile(null);
                    }}
                    leftSection={<IconTrash size={16} />}
                    style={{ position: 'absolute', bottom: 10, right: 10 }}
                  >
                    Remove
                  </Button>
                </Box>
              ) : (
                <Button
                  component="label"
                  leftSection={<IconUpload size={16} />}
                  variant="outline"
                >
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </Button>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="video" pt="xs">
            <Stack>
              <TextInput
                label="Video URL"
                placeholder="https://www.youtube.com/watch?v=..."
                description="YouTube or Vimeo URL"
                {...form.getInputProps('videoUrl')}
              />
              <Text size="sm">Upload a video thumbnail (optional)</Text>
              {previewThumbnail ? (
                <Box style={{ position: 'relative' }}>
                  <Image
                    src={previewThumbnail}
                    alt="Thumbnail preview"
                    height={150}
                    fit="contain"
                  />
                  <Button
                    variant="light"
                    color="red"
                    onClick={() => {
                      setPreviewThumbnail('');
                      setThumbnailFile(null);
                    }}
                    leftSection={<IconTrash size={16} />}
                    style={{ position: 'absolute', bottom: 10, right: 10 }}
                  >
                    Remove
                  </Button>
                </Box>
              ) : (
                <Button
                  component="label"
                  leftSection={<IconUpload size={16} />}
                  variant="outline"
                >
                  Upload Thumbnail
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleThumbnailUpload}
                  />
                </Button>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {(imageFile || thumbnailFile) && (
          <Alert color="blue" mb="md">
            Images will be uploaded when you save the feature.
          </Alert>
        )}

        <Group justify="apart" mt="xl">
          <Button
            component={Link}
            href="/features"
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Features
          </Button>
          <Button
            type="submit"
            leftSection={<IconDeviceFloppy size={16} />}
            loading={loading}
          >
            {isEditing ? 'Update Feature' : 'Save Feature'}
          </Button>
        </Group>
      </form>
    </Card>
  );
}
