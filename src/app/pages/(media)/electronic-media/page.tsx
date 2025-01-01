'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Paper,
  Title,
  Grid,
  Image,
  ActionIcon,
  Text,
  NumberInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconEdit, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { FileButton } from '@mantine/core';
import { AdminPageLayout } from '@/components/Layout/AdminPageLayout';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ElectronicMedia {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  order: number;
}

export default function ElectronicMediaAdmin() {
  const [media, setMedia] = useState<ElectronicMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/electronic-media');
      const data = await response.json();
      setMedia(data);
    } catch (error) {
      console.error('Error fetching media:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch media',
        color: 'red'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/electronic-media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create media');
      }

      notifications.show({
        title: 'Success',
        message: 'Media created successfully',
        color: 'green'
      });

      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        thumbnail: ''
      });

      fetchMedia();
    } catch (error) {
      console.error('Error creating media:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create media',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMoveUp = async (id: number) => {
    try {
      const response = await fetch(`/api/electronic-media/${id}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: 'up' }),
      });
      if (!response.ok) throw new Error('Failed to reorder');
      await fetchMedia();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to reorder media',
        color: 'red'
      });
    }
  };

  const handleMoveDown = async (id: number) => {
    try {
      const response = await fetch(`/api/electronic-media/${id}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction: 'down' }),
      });
      if (!response.ok) throw new Error('Failed to reorder');
      await fetchMedia();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to reorder media',
        color: 'red'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/electronic-media/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      await fetchMedia();
      notifications.show({
        title: 'Success',
        message: 'Media deleted successfully',
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete media',
        color: 'red'
      });
    }
  };

  return (
    <ErrorBoundary>
      <AdminPageLayout>
        <Title order={2} mb="lg">Manage Electronic Media</Title>

        <Grid>
          <Grid.Col span={7}>
            <Paper shadow="sm" p="md">
              <form onSubmit={handleSubmit}>
                <Stack>
                  <TextInput
                    label="Title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <TextInput
                    label="Video URL"
                    required
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                  <TextInput
                    label="Thumbnail URL"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  />
                  <Group justify="flex-end">
                    <Button type="submit" loading={loading}>
                      Add Media
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
          </Grid.Col>

          <Grid.Col span={5}>
            <Paper shadow="sm" p="md">
              <Title order={3} mb="md">Preview</Title>
              {media.map((item) => (
                <Paper key={item.id} shadow="xs" p="sm" mb="sm">
                  <Group justify="apart">
                    <Title order={4}>{item.title}</Title>
                    <Group>
                      <ActionIcon onClick={() => handleMoveUp(item.id)}>
                        <IconArrowUp size={16} />
                      </ActionIcon>
                      <ActionIcon onClick={() => handleMoveDown(item.id)}>
                        <IconArrowDown size={16} />
                      </ActionIcon>
                      <ActionIcon color="red" onClick={() => handleDelete(item.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                      <ActionIcon onClick={() => router.push(`/electronic-media/${item.id}/edit`)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <p>{item.description}</p>
                  {item.thumbnail && <Image src={item.thumbnail} alt={item.title} />}
                </Paper>
              ))}
            </Paper>
          </Grid.Col>
        </Grid>
      </AdminPageLayout>
    </ErrorBoundary>
  );
} 