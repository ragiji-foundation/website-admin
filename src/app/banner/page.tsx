'use client';
import { useEffect, useState } from 'react';
import { Container, Title, Card, Text, Button, Group, Image, TextInput, Select, FileInput, Grid, Stack, ActionIcon, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload, IconEdit, IconTrash, IconPhoto } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { Banner, BannerType } from '@/types/banner';

interface FormValues {
  type: BannerType;
  title: string;
  description: string;
  backgroundImage: File | null;
}

const bannerTypes = [
  { value: 'blog', label: 'Blog' },
  { value: 'about', label: 'About' },
  { value: 'initiatives', label: 'Initiatives' },
  { value: 'successstories', label: 'Success Stories' },
  { value: 'home', label: 'Home' },
  { value: 'media', label: 'Media' },
  { value: 'electronicmedia', label: 'Electronic Media' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'newscoverage', label: 'News Coverage' },
  { value: 'ourstory', label: 'Our Story' },
  { value: 'need', label: 'The Need' },
  { value: 'centers', label: 'Centers' },
  { value: 'contactus', label: 'Contact Us' },
  { value: 'careers', label: 'Careers' },
  { value: 'awards', label: 'Awards' }
];

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      type: '' as BannerType,
      title: '',
      description: '',
      backgroundImage: null,
    },
    validate: {
      type: (value) => (!value ? 'Banner type is required' : null),
      title: (value) => (!value ? 'Title is required' : null),
    },
  });

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banner');
      if (!response.ok) throw new Error('Failed to fetch banners');
      const data = await response.json();
      setBanners(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load banners',
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
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const url = editingId ? `/api/banner/${editingId}` : '/api/banner';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save banner');

      notifications.show({
        title: 'Success',
        message: `Banner ${editingId ? 'updated' : 'created'} successfully`,
        color: 'green',
      });

      form.reset();
      setEditingId(null);
      fetchBanners();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save banner',
        color: 'red',
      });
    }
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

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    form.setValues({
      type: banner.type,
      title: banner.title,
      description: banner.description || '',
      backgroundImage: null, // Reset file input when editing
    });
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">Banner Management</Title>

      <Card withBorder p="md" radius="md" mb="xl">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label="Banner Type"
              placeholder="Select banner type"
              data={bannerTypes}
              required
              {...form.getInputProps('type')}
            />
            <TextInput
              label="Title"
              placeholder="Enter banner title"
              required
              {...form.getInputProps('title')}
            />
            <TextInput
              label="Description"
              placeholder="Enter banner description"
              {...form.getInputProps('description')}
            />
            <FileInput
              label="Background Image"
              placeholder="Upload image"
              accept="image/*"
              leftSection={<IconUpload size={14} />}
              {...form.getInputProps('backgroundImage')}
            />
            <Button type="submit">
              {editingId ? 'Update Banner' : 'Create Banner'}
            </Button>
          </Stack>
        </form>
      </Card>

      <Grid>
        {banners.map((banner) => (
          <Grid.Col key={banner.id} span={{ base: 12, sm: 6 }}>
            <Card withBorder shadow="sm">
              <Card.Section>
                <Image
                  src={banner.backgroundImage}
                  height={200}
                  alt={banner.title}
                  fallbackSrc="/placeholder-banner.jpg"
                />
              </Card.Section>

              <Stack mt="md" gap="sm">
                <Group justify="space-between">
                  <Title order={4}>{banner.title}</Title>
                  <Badge>{banner.type}</Badge>
                </Group>
                {banner.description && (
                  <Text size="sm" c="dimmed">
                    {banner.description}
                  </Text>
                )}
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => handleEdit(banner)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
