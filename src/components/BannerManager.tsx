'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Modal,
  TextInput,
  Textarea,
  Select,
  Grid,
  Card,
  ActionIcon,
  Badge,
  Image,
  Box,
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus, IconEye } from '@tabler/icons-react';
import { MediaUpload } from '@/components/MediaUpload';

interface Banner {
  id: string;
  type: string;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  backgroundImage: string;
  createdAt: string;
  updatedAt: string;
}

const BANNER_TYPES = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'promotion', label: 'Promotion Banner' },
  { value: 'announcement', label: 'Announcement Banner' },
  { value: 'event', label: 'Event Banner' },
  { value: 'campaign', label: 'Campaign Banner' },
];

export function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const form = useForm({
    initialValues: {
      type: '',
      title: '',
      titleHi: '',
      description: '',
      descriptionHi: '',
      backgroundImage: '',
    },
    validate: {
      type: (value) => (!value ? 'Banner type is required' : null),
      title: (value) => (!value ? 'Title is required' : null),
      backgroundImage: (value) => (!value ? 'Background image is required' : null),
    },
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/banner');
      if (!response.ok) throw new Error('Failed to fetch banners');
      const data = await response.json();
      setBanners(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch banners',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const method = editingBanner ? 'PUT' : 'POST';
      const url = editingBanner ? `/api/banner/${editingBanner.id}` : '/api/banner';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Failed to save banner');

      notifications.show({
        title: 'Success',
        message: `Banner ${editingBanner ? 'updated' : 'created'} successfully`,
        color: 'green',
      });

      form.reset();
      setEditingBanner(null);
      closeModal();
      fetchBanners();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save banner',
        color: 'red',
      });
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    form.setValues({
      type: banner.type,
      title: banner.title,
      titleHi: banner.titleHi || '',
      description: banner.description || '',
      descriptionHi: banner.descriptionHi || '',
      backgroundImage: banner.backgroundImage,
    });
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/banner/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete banner');

      notifications.show({
        title: 'Success',
        message: 'Banner deleted successfully',
        color: 'green',
      });

      fetchBanners();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete banner',
        color: 'red',
      });
    }
  };

  const handleAddNew = () => {
    setEditingBanner(null);
    form.reset();
    openModal();
  };

  return (
    <Stack gap="xl">
      <Paper p="lg" withBorder>
        <LoadingOverlay visible={loading} />

        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Banner Management</Title>
            <Text c="dimmed">Create and manage website banners</Text>
          </div>
          <Button leftSection={<IconPlus size={16} />} onClick={handleAddNew}>
            Add New Banner
          </Button>
        </Group>

        <Grid>
          {banners.map((banner) => (
            <Grid.Col key={banner.id} span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                <Card.Section>
                  <Image
                    src={banner.backgroundImage}
                    height={160}
                    alt={banner.title}
                    fit="cover"
                  />
                </Card.Section>

                <Stack gap="xs" mt="md">
                  <Group justify="space-between" align="flex-start">
                    <Badge variant="light" size="sm">
                      {banner.type}
                    </Badge>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        size="sm"
                        onClick={() => handleEdit(banner)}
                      >
                        <IconEdit size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        size="sm"
                        onClick={() => handleDelete(banner.id)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>

                  <Box>
                    <Text fw={600} lineClamp={2} mb="xs">
                      {banner.title}
                    </Text>
                    {banner.titleHi && (
                      <Text
                        size="sm"
                        c="dimmed"
                        lineClamp={2}
                        style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                        mb="xs"
                      >
                        {banner.titleHi}
                      </Text>
                    )}
                  </Box>

                  {banner.description && (
                    <Box>
                      <Text size="sm" c="dimmed" lineClamp={3}>
                        {banner.description}
                      </Text>
                      {banner.descriptionHi && (
                        <Text
                          size="xs"
                          c="dimmed"
                          lineClamp={2}
                          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                        >
                          {banner.descriptionHi}
                        </Text>
                      )}
                    </Box>
                  )}

                  <Text size="xs" c="dimmed" mt="auto">
                    Updated: {new Date(banner.updatedAt).toLocaleDateString()}
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {banners.length === 0 && !loading && (
          <Box ta="center" py="xl">
            <Text c="dimmed" mb="md">
              No banners found
            </Text>
            <Button leftSection={<IconPlus size={16} />} onClick={handleAddNew}>
              Create Your First Banner
            </Button>
          </Box>
        )}
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingBanner ? 'Edit Banner' : 'Create New Banner'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label="Banner Type"
              placeholder="Select banner type"
              required
              data={BANNER_TYPES}
              {...form.getInputProps('type')}
            />

            <TextInput
              label="Title (English)"
              placeholder="Enter banner title"
              required
              {...form.getInputProps('title')}
            />

            <TextInput
              label="Title (Hindi)"
              placeholder="बैनर का शीर्षक"
              style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              {...form.getInputProps('titleHi')}
            />

            <Textarea
              label="Description (English)"
              placeholder="Enter banner description"
              rows={3}
              {...form.getInputProps('description')}
            />

            <Textarea
              label="Description (Hindi)"
              placeholder="बैनर का विवरण"
              rows={3}
              style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              {...form.getInputProps('descriptionHi')}
            />

            <MediaUpload
              label="Background Image"
              value={form.values.backgroundImage}
              onChange={(url) => form.setFieldValue('backgroundImage', url)}
              folder="banners"
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}