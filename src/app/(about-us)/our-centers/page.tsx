'use client';

import { useState } from 'react';
import {
  TextInput,
  Button,
  Group,
  Stack,
  Paper,
  Title,
  Grid,
  ActionIcon,
  Text,
  Modal,
  Card,
  Progress,
  Textarea,
  FileButton,
  Image,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconEdit, IconPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import TiptapEditor from '@/components/TiptapEditor';
// ✅ ADDED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

interface Center {
  id: number;
  name: string;
  nameHi?: string;
  location: string;
  locationHi?: string;
  description: string;
  descriptionHi?: string;
  imageUrl?: string;
  contactInfo?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CentersAdmin() {
  // ✅ MIGRATED: Using centralized hooks instead of manual state management
  const { data: centers, loading, refetch: fetchCenters } = useApiData<Center[]>(
    '/api/centers', 
    [],
    { showNotifications: true }
  );

  // ✅ MIGRATED: Using centralized CRUD operations
  const { create, remove, update } = useCrudOperations<Center>('/api/centers', {
    showNotifications: true,
    onSuccess: () => {
      fetchCenters(); // Refresh data after operations
      close();
      setFormData({
        name: '',
        nameHi: '',
        location: '',
        locationHi: '',
        description: '',
        descriptionHi: '',
        imageUrl: '',
        contactInfo: ''
      });
      setEditingId(null);
    }
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    nameHi: '',
    location: '',
    locationHi: '',
    description: '',
    descriptionHi: '',
    imageUrl: '',
    contactInfo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await update(editingId, formData);
      } else {
        await create(formData);
      }
    } catch (error) {
      console.error('Error submitting center:', error);
    }
  };

  const handleEdit = (center: Center) => {
    setFormData({
      name: center.name,
      nameHi: center.nameHi || '',
      location: center.location,
      locationHi: center.locationHi || '',
      description: center.description,
      descriptionHi: center.descriptionHi || '',
      imageUrl: center.imageUrl || '',
      contactInfo: center.contactInfo || ''
    });
    setEditingId(center.id);
    open();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this center?')) return;

    try {
      await remove(id);
    } catch (error) {
      console.error('Error deleting center:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameHi: '',
      location: '',
      locationHi: '',
      description: '',
      descriptionHi: '',
      imageUrl: '',
      contactInfo: ''
    });
    setEditingId(null);
  };

  const onImageUpload = async (file: File | null) => {
    if (!file) return;
    setUploadProgress(0);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
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
      xhr.send(formDataUpload);
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red'
      });
      setUploadProgress(0);
    }
  };

  return (
    <Stack gap="xl">
      <Card shadow="sm" p="lg">
        <Group justify="space-between" mb="xl">
          <Title order={2}>Manage Centers</Title>
          <Button 
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              resetForm();
              open();
            }}
          >
            Add New Center
          </Button>
        </Group>

        <Grid>
          {Array.isArray(centers) && centers.map((center) => (
            <Grid.Col key={center.id} span={{ base: 12, md: 6 }}>
              <Paper shadow="xs" p="md" withBorder>
                {center.imageUrl && (
                  <Image
                    src={center.imageUrl}
                    height={160}
                    alt={center.name}
                    mb="md"
                    radius="sm"
                  />
                )}
                <Group justify="space-between" mb="xs">
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <div>
                      <Title order={4}>{center.name}</Title>
                      {center.nameHi && (
                        <Text 
                          size="sm" 
                          c="dimmed" 
                          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                        >
                          {center.nameHi}
                        </Text>
                      )}
                    </div>
                    <div>
                      <Text size="sm" c="dimmed">{center.location}</Text>
                      {center.locationHi && (
                        <Text 
                          size="xs" 
                          c="dimmed" 
                          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                        >
                          {center.locationHi}
                        </Text>
                      )}
                    </div>
                    <Text size="sm" lineClamp={2}>
                      {center.description}
                    </Text>
                    {center.contactInfo && (
                      <Text size="xs" c="dimmed">{center.contactInfo}</Text>
                    )}
                  </Stack>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEdit(center)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(center.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          resetForm();
          close();
        }}
        title={editingId ? "Edit Center" : "Add New Center"}
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Center Name (English)"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextInput
              label="Center Name (Hindi)"
              value={formData.nameHi}
              onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })}
              placeholder="केंद्र का नाम"
              style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
            />
            <TextInput
              label="Location (English)"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <TextInput
              label="Location (Hindi)"
              value={formData.locationHi}
              onChange={(e) => setFormData({ ...formData, locationHi: e.target.value })}
              placeholder="स्थान"
              style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
            />
            <TiptapEditor
              label="Description (English)"
              required
              content={formData.description}
              onChange={(htmlContent) => setFormData({ ...formData, description: htmlContent })}
              placeholder="Enter center description in English..."
              minHeight={200}
            />
            <TiptapEditor
              label="Description (Hindi)"
              content={formData.descriptionHi}
              onChange={(htmlContent) => setFormData({ ...formData, descriptionHi: htmlContent })}
              placeholder="केंद्र का विवरण हिंदी में दर्ज करें..."
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
            {formData.imageUrl && (
              <Image
                src={formData.imageUrl}
                height={120}
                alt="Center preview"
                radius="sm"
                mt="xs"
              />
            )}
            <Textarea
              label="Contact Information"
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              placeholder="Contact details, phone numbers, etc."
              rows={3}
            />
            <Group justify="flex-end">
              <Button variant="light" onClick={() => { resetForm(); close(); }}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {editingId ? 'Update Center' : 'Add Center'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}