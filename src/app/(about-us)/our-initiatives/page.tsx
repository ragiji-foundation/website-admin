'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
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
  Progress,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconEdit, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { FileButton } from '@mantine/core';

import { handleImageUpload } from '@/utils/imageUpload';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import TiptapEditor from '@/components/TiptapEditor';

interface Initiative {
  id: number;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  imageUrl?: string;
  order: number;
}

export default function InitiativesAdmin() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    titleHi: '',
    description: '',
    descriptionHi: '',
    imageUrl: '',
    order: 0
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      const response = await fetch('/api/initiatives');
      const data = await response.json();
      setInitiatives(data);
    } catch (error) {
      console.error('Error fetching initiatives:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch initiatives',
        color: 'red'
      });
    }
  };

  const onImageUpload = async (file: File | null) => {
    if (!file) return;
    setUploadProgress(0);
    try {
      // Use XMLHttpRequest for progress tracking
      const formData = new FormData();
      formData.append('file', file);
      // You may need to adjust the upload endpoint below
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const { url } = JSON.parse(xhr.responseText);
          setFormData(prev => ({ ...prev, imageUrl: url }));
          notifications.show({
            title: 'Success',
            message: 'Image uploaded successfully',
            color: 'green'
          });
        } else {
          notifications.show({
            title: 'Error',
            message: 'Failed to upload image',
            color: 'red'
          });
        }
        setUploadProgress(0);
      };
      xhr.onerror = () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to upload image',
          color: 'red'
        });
        setUploadProgress(0);
      };
      xhr.send(formData);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red'
      });
      setUploadProgress(0);
    }
  };

  const handleEdit = (initiative: Initiative) => {
    setEditingId(initiative.id);
    setFormData({
      title: initiative.title,
      titleHi: initiative.titleHi || '',
      description: initiative.description,
      descriptionHi: initiative.descriptionHi || '',
      imageUrl: initiative.imageUrl || '',
      order: initiative.order
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (editingId) {
        response = await fetch(`/api/initiatives/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('/api/initiatives', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      if (!response.ok) {
        throw new Error(editingId ? 'Failed to update initiative' : 'Failed to create initiative');
      }
      notifications.show({
        title: 'Success',
        message: editingId ? 'Initiative updated successfully' : 'Initiative created successfully',
        color: 'green'
      });
      setFormData({
        title: '',
        titleHi: '',
        description: '',
        descriptionHi: '',
        imageUrl: '',
        order: 0
      });
      setEditingId(null);
      fetchInitiatives();
    } catch (error) {
      console.error(editingId ? 'Error updating initiative:' : 'Error creating initiative:', error);
      notifications.show({
        title: 'Error',
        message: editingId ? 'Failed to update initiative' : 'Failed to create initiative',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/initiatives/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete initiative');
      }

      notifications.show({
        title: 'Success',
        message: 'Initiative deleted successfully',
        color: 'green'
      });

      fetchInitiatives();
    } catch (error) {
      console.error('Error deleting initiative:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete initiative',
        color: 'red'
      });
    }
  };

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = initiatives.findIndex(i => i.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === initiatives.length - 1)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/initiatives/${id}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder initiative');
      }

      fetchInitiatives();
    } catch (error) {
      console.error('Error reordering initiative:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to reorder initiative',
        color: 'red'
      });
    }
  };

  return (
    <ErrorBoundary>

      <Title order={2} mb="lg">Manage Initiatives</Title>

      <Grid>
        <Grid.Col span={7}>
          <Paper shadow="sm" p="md">
            <form onSubmit={handleSubmit}>
              <Stack>
                <TextInput
                  label="Title (English)"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter initiative title in English"
                />
                <TextInput
                  label="Title (Hindi)"
                  value={formData.titleHi}
                  onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                  placeholder="पहल का शीर्षक हिंदी में दर्ज करें"
                  style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                />
                <TiptapEditor
                  label="Description (English)"
                  content={formData.description}
                  onChange={(htmlContent) => setFormData({ ...formData, description: htmlContent })}
                  placeholder="Enter initiative description in English..."
                  required={true}
                  minHeight={200}
                />
                <TiptapEditor
                  label="Description (Hindi)"
                  content={formData.descriptionHi}
                  onChange={(htmlContent) => setFormData({ ...formData, descriptionHi: htmlContent })}
                  placeholder="पहल का विवरण हिंदी में दर्ज करें..."
                  required={false}
                  minHeight={200}
                />
                <Group align="flex-end">
                  <TextInput
                    label="Image URL"
                    style={{ flex: 1 }}
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                  <FileButton
                    onChange={onImageUpload}
                    accept="image/png,image/jpeg,image/gif,image/webp"
                  >
                    {(props) => (
                      <Button {...props}>
                        Upload Image
                      </Button>
                    )}
                  </FileButton>
                </Group>
                {uploadProgress > 0 && (
                  <Progress value={uploadProgress} size="sm" mt="xs" animated />
                )}
                <NumberInput
                  label="Order"
                  value={formData.order}
                  onChange={(value) => setFormData({ ...formData, order: Number(value) || 0 })}
                />
                <Group justify="flex-end">
                  <Button type="submit" loading={loading}>
                    {editingId ? 'Update Initiative' : 'Add Initiative'}
                  </Button>
                  {editingId && (
                    <Button
                      variant="outline"
                      color="gray"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          title: '',
                          titleHi: '',
                          description: '',
                          descriptionHi: '',
                          imageUrl: '',
                          order: 0
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </Group>
              </Stack>
            </form>
          </Paper>
        </Grid.Col>

        <Grid.Col span={5}>
          <Paper shadow="sm" p="md">
            <Title order={3} mb="md">Initiatives List</Title>
            <Stack>
              {initiatives.map((item) => (
                <Paper key={item.id} shadow="xs" p="sm">
                  <Group justify="space-between" mb="xs">
                    <div>
                      <Title order={4}>{item.title}</Title>
                      {item.titleHi && (
                        <Text size="sm" c="dimmed" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                          {item.titleHi}
                        </Text>
                      )}
                    </div>
                    <Group gap="xs">
                      <ActionIcon
                        color="gray"
                        onClick={() => handleReorder(item.id, 'up')}
                      >
                        <IconArrowUp size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="gray"
                        onClick={() => handleReorder(item.id, 'down')}
                      >
                        <IconArrowDown size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="blue"
                        onClick={() => handleEdit(item)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        onClick={() => handleDelete(item.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      height={120}
                      fit="cover"
                      mb="xs"
                    />
                  )}
                  <Text size="sm" lineClamp={3}>
                    {item.description.replace(/<[^>]*>/g, '')}
                  </Text>
                  {item.descriptionHi && (
                    <Text size="xs" c="dimmed" lineClamp={2} mt="xs" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                      {item.descriptionHi.replace(/<[^>]*>/g, '')}
                    </Text>
                  )}
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

    </ErrorBoundary>
  );
}