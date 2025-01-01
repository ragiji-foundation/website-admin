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
  FileButton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { AdminPageLayout } from '@/components/Layout/AdminPageLayout';
import { handleImageUpload } from '@/utils/imageUpload';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface Center {
  id: number;
  name: string;
  location: string;
  description: string;
  imageUrl?: string;
  contactInfo?: string;
}

export default function CentersAdmin() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    imageUrl: '',
    contactInfo: ''
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await fetch('/api/centers');
      if (!response.ok) {
        throw new Error('Failed to fetch centers');
      }
      const data = await response.json();
      setCenters(data);
    } catch (error) {
      console.error('Error fetching centers:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch centers',
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
      const response = await fetch('/api/centers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create center');
      }

      notifications.show({
        title: 'Success',
        message: 'Center created successfully',
        color: 'green'
      });

      setFormData({
        name: '',
        location: '',
        description: '',
        imageUrl: '',
        contactInfo: ''
      });

      fetchCenters();
    } catch (error) {
      console.error('Error creating center:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create center',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/centers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete center');
      }

      notifications.show({
        title: 'Success',
        message: 'Center deleted successfully',
        color: 'green'
      });

      fetchCenters();
    } catch (error) {
      console.error('Error deleting center:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete center',
        color: 'red'
      });
    }
  };

  return (
    <ErrorBoundary>
      <AdminPageLayout>
        <Title order={2} mb="lg">Manage Centers</Title>

        <Grid>
          <Grid.Col span={7}>
            <Paper shadow="sm" p="md">
              <form onSubmit={handleSubmit}>
                <Stack>
                  <TextInput
                    label="Center Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <TextInput
                    label="Location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                  <Textarea
                    label="Description"
                    required
                    minRows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  <TextInput
                    label="Contact Info"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  />
                  <Group justify="flex-end">
                    <Button type="submit" loading={loading}>
                      Add Center
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
          </Grid.Col>

          <Grid.Col span={5}>
            <Paper shadow="sm" p="md">
              <Title order={3} mb="md">Centers List</Title>
              <Stack>
                {centers.map((item) => (
                  <Paper key={item.id} shadow="xs" p="sm">
                    <Group justify="space-between" mb="xs">
                      <div>
                        <Title order={4}>{item.name}</Title>
                        <Text size="sm" color="dimmed">{item.location}</Text>
                      </div>
                      <Group gap="xs">
                        <ActionIcon
                          color="blue"
                          onClick={() => {/* TODO: Implement edit */ }}
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
                        alt={item.name}
                        height={120}
                        fit="cover"
                        mb="xs"
                      />
                    )}
                    <Text size="sm" lineClamp={3}>
                      {item.description}
                    </Text>
                    {item.contactInfo && (
                      <Text size="sm" mt="xs" color="dimmed">
                        Contact: {item.contactInfo}
                      </Text>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </AdminPageLayout>
    </ErrorBoundary>
  );
} 