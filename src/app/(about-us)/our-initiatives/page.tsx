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

import { handleImageUpload } from '@/utils/imageUpload';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface Initiative {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

export default function InitiativesAdmin() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    order: 0
  });

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
    try {
      const url = await handleImageUpload(file);
      if (url) {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        notifications.show({
          title: 'Success',
          message: 'Image uploaded successfully',
          color: 'green'
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/initiatives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create initiative');
      }

      notifications.show({
        title: 'Success',
        message: 'Initiative created successfully',
        color: 'green'
      });

      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        order: 0
      });

      fetchInitiatives();
    } catch (error) {
      console.error('Error creating initiative:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create initiative',
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
                  label="Title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <Textarea
                  label="Description"
                  required
                  minRows={4}
                  maxRows={8}
                  styles={{
                    input: {
                      height: '120px',
                      minHeight: '120px',
                      resize: 'vertical',
                    },
                  }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />                  <Group align="flex-end">
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
                <NumberInput
                  label="Order"
                  value={formData.order}
                  onChange={(value) => setFormData({ ...formData, order: Number(value) || 0 })}
                />
                <Group justify="flex-end">
                  <Button type="submit" loading={loading}>
                    Add Initiative
                  </Button>
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
                    <Title order={4}>{item.title}</Title>
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
                        onClick={() => {/* Implement edit */ }}
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
                    {item.description}
                  </Text>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

    </ErrorBoundary>
  );
} 