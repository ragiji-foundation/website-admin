'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  Paper,
  Text,
  Group,
  Button,
  Badge,
  Image,
  Select,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconNews, IconExclamationCircle, IconCalendar, IconExternalLink } from '@tabler/icons-react';
import { BilingualInput } from '@/components/BilingualInput';
import { MediaUpload } from '@/components/MediaUpload';

interface NewsArticleFormData {
  title: string;
  titleHi?: string;
  source: string;
  date: string;
  imageUrl?: string;
  link?: string;
  description?: string;
  descriptionHi?: string;
}

interface NewsArticleFormProps {
  initialData?: Partial<NewsArticleFormData>;
  onSubmit: (data: NewsArticleFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const NEWS_SOURCES = [
  'The Hindu',
  'Times of India',
  'Indian Express',
  'Hindustan Times',
  'Dainik Jagran',
  'Amar Ujala',
  'Dainik Bhaskar',
  'Local Newspaper',
  'Online Portal',
  'Press Release'
];

export default function NewsArticleForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: NewsArticleFormProps) {
  const form = useForm({
    initialValues: {
      title: initialData?.title || '',
      titleHi: initialData?.titleHi || '',
      source: initialData?.source || '',
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      imageUrl: initialData?.imageUrl || '',
      link: initialData?.link || '',
      description: initialData?.description || '',
      descriptionHi: initialData?.descriptionHi || ''
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      source: (value) => (!value ? 'Source is required' : null),
      date: (value) => (!value ? 'Date is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const formattedValues = {
        ...values,
        date: values.date.toISOString()
      };
      await onSubmit(formattedValues);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* Header Section */}
        <Paper withBorder p="md" radius="md">
          <Text fw={500} size="sm" mb="md" c="blue">
            Article Information
          </Text>
          <Stack gap="md">
            <BilingualInput
              label="Article Title"
              required
              valueEn={form.values.title}
              valueHi={form.values.titleHi}
              onChangeEn={(value) => form.setFieldValue('title', value)}
              onChangeHi={(value) => form.setFieldValue('titleHi', value)}
              placeholder="Enter article headline"
              placeholderHi="लेख का शीर्षक दर्ज करें"
              error={form.errors.title as string}
            />

            <Group grow>
              <Select
                label="News Source"
                placeholder="Select source"
                required
                data={NEWS_SOURCES}
                value={form.values.source}
                onChange={(value) => form.setFieldValue('source', value || '')}
                error={form.errors.source as string}
                searchable
                allowDeselect
                leftSection={<IconNews size={16} />}
                onOptionSubmit={(value) => {
                  if (!NEWS_SOURCES.includes(value)) {
                    NEWS_SOURCES.push(value);
                  }
                  form.setFieldValue('source', value);
                }}
              />
              <DatePickerInput
                label="Publication Date"
                placeholder="Pick date"
                required
                value={form.values.date}
                onChange={(value) => form.setFieldValue('date', value || new Date())}
                error={form.errors.date as string}
                leftSection={<IconCalendar size={16} />}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Content Section */}
        <Paper withBorder p="md" radius="md">
          <Text fw={500} size="sm" mb="md" c="green">
            Article Content
          </Text>
          <Stack gap="md">
            <BilingualInput
              label="Description"
              valueEn={form.values.description}
              valueHi={form.values.descriptionHi}
              onChangeEn={(value) => form.setFieldValue('description', value)}
              onChangeHi={(value) => form.setFieldValue('descriptionHi', value)}
              placeholder="Brief description or excerpt (optional)"
              placeholderHi="संक्षिप्त विवरण या अंश (वैकल्पिक)"
              multiline
              rows={4}
            />
          </Stack>
        </Paper>

        {/* Media & Links Section */}
        <Paper withBorder p="md" radius="md">
          <Text fw={500} size="sm" mb="md" c="orange">
            Media & Links
          </Text>
          <Stack gap="md">
            <BilingualInput
              label="Article Link"
              valueEn={form.values.link}
              valueHi=""
              onChangeEn={(value) => form.setFieldValue('link', value)}
              onChangeHi={() => {}}
              placeholder="https://example.com/article"
              description="Link to the full article (optional)"
            />

            <Stack gap="xs">
              <MediaUpload
                label="Article Image"
                value={form.values.imageUrl || ''}
                onChange={(url) => form.setFieldValue('imageUrl', url)}
                folder="news-articles"
              />
              <Text size="xs" c="dimmed">
                Featured image for the article (optional)
              </Text>
            </Stack>

            {/* Image Preview */}
            {form.values.imageUrl && (
              <div>
                <Text size="sm" fw={500} mb="xs">Image Preview</Text>
                <Image
                  src={form.values.imageUrl}
                  height={200}
                  fit="contain"
                  radius="md"
                  fallbackSrc="/placeholder-news.jpg"
                  alt="Article preview"
                />
              </div>
            )}
          </Stack>
        </Paper>

        {/* Translation Status */}
        <Paper withBorder p="md" radius="md" bg="gray.0">
          <Text fw={500} size="sm" mb="md">
            Translation Status
          </Text>
          <Group gap="md">
            <Group gap="xs">
              <Text size="sm">English Content:</Text>
              <Badge 
                color={form.values.title && (form.values.description || !form.values.description) ? 'green' : 'red'}
                size="sm"
              >
                {form.values.title ? 'Complete' : 'Incomplete'}
              </Badge>
            </Group>
            <Group gap="xs">
              <Text size="sm">Hindi Content:</Text>
              <Badge 
                color={form.values.titleHi && (form.values.descriptionHi || !form.values.description) ? 'green' : 'orange'}
                size="sm"
              >
                {form.values.titleHi ? 'Complete' : 'Partial'}
              </Badge>
            </Group>
            <Group gap="xs">
              <Text size="sm">Media:</Text>
              <Badge 
                color={form.values.imageUrl || form.values.link ? 'green' : 'yellow'}
                size="sm"
              >
                {form.values.imageUrl || form.values.link ? 'Available' : 'Missing'}
              </Badge>
            </Group>
          </Group>
        </Paper>

        {/* Action Buttons */}
        <Group justify="space-between" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
          <Button 
            variant="light" 
            color="gray"
            onClick={onCancel}
            leftSection={<IconExclamationCircle size={16} />}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            leftSection={<IconNews size={16} />}
            loading={loading}
            gradient={{ from: 'blue', to: 'cyan' }}
            variant="gradient"
          >
            {initialData ? 'Update Article' : 'Create Article'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
