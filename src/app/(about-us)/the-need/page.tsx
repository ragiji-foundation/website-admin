'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Title,
  TextInput,
  Button,
  Group,
  Stack,
  Switch,
  FileInput,
  Alert
} from '@mantine/core';
import { LexicalEditor } from '@/components/LexicalEditor';
import { notifications } from '@mantine/notifications';
import { uploadImage } from '@/utils/upload';

interface TheNeedForm {
  mainText: string;
  statistics: string;
  impact: string;
  imageUrl: string;
  statsImageUrl: string;
  isPublished: boolean;
}

export default function TheNeedAdminPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TheNeedForm | null>(null);
  const [uploading, setUploading] = useState<{
    main: boolean;
    stats: boolean;
  }>({ main: false, stats: false });

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/the-need');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load content',
        color: 'red'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/admin/the-need', {
        method: data?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to save');

      notifications.show({
        title: 'Success',
        message: 'Content saved successfully',
        color: 'green'
      });

      await fetchData();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save content',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'main' | 'stats') => {
    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      const url = await uploadImage(file);

      setData(prev => ({
        ...prev!,
        [type === 'main' ? 'imageUrl' : 'statsImageUrl']: url,
      }));

      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red'
      });
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Manage "The Need" Content</Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Box>
            <Title order={3}>Main Text</Title>
            <LexicalEditor
              initialContent={data?.mainText}
              onChange={(content) => setData(prev => ({ ...prev!, mainText: content }))}
            />
          </Box>

          <Box>
            <Title order={3}>Statistics</Title>
            <LexicalEditor
              initialContent={data?.statistics}
              onChange={(content) => setData(prev => ({ ...prev!, statistics: content }))}
            />
          </Box>

          <Box>
            <Title order={3}>Impact</Title>
            <LexicalEditor
              initialContent={data?.impact}
              onChange={(content) => setData(prev => ({ ...prev!, impact: content }))}
            />
          </Box>

          <FileInput
            label="Main Image"
            placeholder="Upload image"
            accept="image/*"
            loading={uploading.main}
            onChange={(file) => file && handleImageUpload(file, 'main')}
          />

          <FileInput
            label="Statistics Image"
            placeholder="Upload image"
            accept="image/*"
            loading={uploading.stats}
            onChange={(file) => file && handleImageUpload(file, 'stats')}
          />

          <Switch
            label="Published"
            checked={data?.isPublished}
            onChange={(e) => setData(prev => ({ ...prev!, isPublished: e.currentTarget.checked }))}
          />

          <Group justify="flex-end">
            <Button type="submit" loading={loading}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
