'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Button,
  Group,
  Stack,
  Paper,
  Table,
  Modal,
  ActionIcon,
  Badge,
  Text,
  Card,
  NumberInput,
  AspectRatio,
  Alert
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconVideo, IconPlayerPlay, IconExternalLink } from '@tabler/icons-react';
import { BilingualInput } from '@/components/BilingualInput';

interface ElectronicMedia {
  id: number;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  videoUrl: string;
  thumbnail?: string;
  order: number;
  createdAt: string;
}

export default function ElectronicMediaPage() {
  const [mediaItems, setMediaItems] = useState<ElectronicMedia[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingMedia, setEditingMedia] = useState<ElectronicMedia | null>(null);

  const form = useForm({
    initialValues: {
      title: '',
      titleHi: '',
      description: '',
      descriptionHi: '',
      videoUrl: '',
      thumbnail: '',
      order: 0
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      videoUrl: (value) => (!value ? 'Video URL is required' : null),
    },
  });

  const fetchMediaItems = async () => {
    try {
      const response = await fetch('/api/electronic-media');
      const data = await response.json();
      setMediaItems(data);
    } catch (error) {
      console.error('Error fetching media items:', error);
    }
  };

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const url = editingMedia 
        ? `/api/electronic-media/${editingMedia.id}`
        : '/api/electronic-media';
      
      const method = editingMedia ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: editingMedia 
            ? 'Video updated successfully' 
            : 'Video added successfully',
          color: 'green'
        });
        fetchMediaItems();
        handleCloseModal();
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to save video',
        color: 'red'
      });
    }
  };

  const handleEdit = (media: ElectronicMedia) => {
    setEditingMedia(media);
    form.setValues({
      title: media.title,
      titleHi: media.titleHi || '',
      description: media.description || '',
      descriptionHi: media.descriptionHi || '',
      videoUrl: media.videoUrl,
      thumbnail: media.thumbnail || '',
      order: media.order
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const response = await fetch(`/api/electronic-media/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: 'Video deleted successfully',
          color: 'green'
        });
        fetchMediaItems();
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to delete video',
        color: 'red'
      });
    }
  };

  const handleCloseModal = () => {
    setEditingMedia(null);
    form.reset();
    close();
  };

  const getTranslationStatus = (media: ElectronicMedia) => {
    const hasHindi = media.titleHi && (media.description ? media.descriptionHi : true);
    return hasHindi ? 'complete' : 'partial';
  };

  const getVideoThumbnail = (url: string) => {
    // Extract YouTube video ID and create thumbnail URL
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    }
    return '/placeholder-video.jpg';
  };

  const getVideoId = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return youtubeMatch ? youtubeMatch[1] : null;
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Electronic Media</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add Video
        </Button>
      </Group>

      {/* Statistics */}
      <Group mb="lg">
        <Card withBorder>
          <Text size="lg" fw={700}>{mediaItems.length}</Text>
          <Text size="sm" c="dimmed">Total Videos</Text>
        </Card>
        <Card withBorder>
          <Text size="lg" fw={700} c="blue">
            {mediaItems.filter(m => getTranslationStatus(m) === 'complete').length}
          </Text>
          <Text size="sm" c="dimmed">Fully Translated</Text>
        </Card>
        <Card withBorder>
          <Text size="lg" fw={700} c="green">
            {mediaItems.filter(m => m.thumbnail).length}
          </Text>
          <Text size="sm" c="dimmed">With Thumbnails</Text>
        </Card>
        <Card withBorder>
          <Text size="lg" fw={700} c="orange">
            {mediaItems.filter(m => m.description).length}
          </Text>
          <Text size="sm" c="dimmed">With Descriptions</Text>
        </Card>
      </Group>

      {/* Media Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {mediaItems.map((media) => (
          <Card key={media.id} withBorder>
            <Card.Section>
              <AspectRatio ratio={16 / 9}>
                <div style={{ position: 'relative', backgroundColor: '#f8f9fa' }}>
                  <img
                    src={media.thumbnail || getVideoThumbnail(media.videoUrl)}
                    alt={media.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: '50%',
                    padding: '12px',
                    cursor: 'pointer'
                  }}>
                    <IconPlayerPlay size={24} color="white" />
                  </div>
                  <Badge 
                    style={{ position: 'absolute', top: '8px', right: '8px' }}
                    size="sm"
                    variant="filled"
                  >
                    #{media.order}
                  </Badge>
                </div>
              </AspectRatio>
            </Card.Section>

            <Stack mt="md" gap="xs">
              <div>
                <Text fw={500} lineClamp={2}>{media.title}</Text>
                {media.titleHi && (
                  <Text size="sm" c="dimmed" lineClamp={1} style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                    {media.titleHi}
                  </Text>
                )}
              </div>

              {media.description && (
                <div>
                  <Text size="sm" lineClamp={2}>{media.description}</Text>
                  {media.descriptionHi && (
                    <Text size="xs" c="dimmed" lineClamp={1} style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                      {media.descriptionHi}
                    </Text>
                  )}
                </div>
              )}

              <Group justify="space-between">
                <div>
                  <Badge 
                    size="sm" 
                    color={getTranslationStatus(media) === 'complete' ? 'green' : 'orange'}
                  >
                    {getTranslationStatus(media) === 'complete' ? 'Translated' : 'Partial'}
                  </Badge>
                  {getVideoId(media.videoUrl) && (
                    <Badge size="sm" color="red" ml="xs">YouTube</Badge>
                  )}
                </div>
                
                <Group gap="xs">
                  <ActionIcon 
                    variant="light" 
                    color="blue" 
                    component="a"
                    href={media.videoUrl}
                    target="_blank"
                  >
                    <IconExternalLink size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="green" onClick={() => handleEdit(media)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon variant="light" color="red" onClick={() => handleDelete(media.id)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Stack>
          </Card>
        ))}
      </div>

      {mediaItems.length === 0 && (
        <Paper withBorder p="xl">
          <Stack align="center" gap="md">
            <IconVideo size={48} color="#adb5bd" />
            <Text c="dimmed" ta="center">
              No videos found. Add your first video to showcase your work!
            </Text>
          </Stack>
        </Paper>
      )}

      {/* Add/Edit Modal */}
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={editingMedia ? 'Edit Video' : 'Add Video'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Alert color="blue" mb="md">
              <Text size="sm">
                Supports YouTube, Vimeo, and direct video links. YouTube thumbnails are auto-generated.
              </Text>
            </Alert>

            <BilingualInput
              label="Video Title"
              required
              valueEn={form.values.title}
              valueHi={form.values.titleHi}
              onChangeEn={(value) => form.setFieldValue('title', value)}
              onChangeHi={(value) => form.setFieldValue('titleHi', value)}
              placeholder="Enter video title"
              placeholderHi="वीडियो शीर्षक दर्ज करें"
              error={form.errors.title as string}
            />

            <BilingualInput
              label="Description"
              valueEn={form.values.description}
              valueHi={form.values.descriptionHi}
              onChangeEn={(value) => form.setFieldValue('description', value)}
              onChangeHi={(value) => form.setFieldValue('descriptionHi', value)}
              placeholder="Brief description (optional)"
              placeholderHi="संक्षिप्त विवरण (वैकल्पिक)"
              multiline
              rows={3}
            />

            <BilingualInput
              label="Video URL"
              required
              valueEn={form.values.videoUrl}
              valueHi=""
              onChangeEn={(value) => form.setFieldValue('videoUrl', value)}
              onChangeHi={() => {}}
              placeholder="https://www.youtube.com/watch?v=..."
              description="YouTube, Vimeo, or direct video file URL"
              error={form.errors.videoUrl as string}
            />

            <BilingualInput
              label="Custom Thumbnail URL"
              valueEn={form.values.thumbnail}
              valueHi=""
              onChangeEn={(value) => form.setFieldValue('thumbnail', value)}
              onChangeHi={() => {}}
              placeholder="https://example.com/thumbnail.jpg"
              description="Optional: Custom thumbnail (YouTube thumbnails auto-generated)"
            />

            <NumberInput
              label="Display Order"
              description="Lower numbers appear first"
              value={form.values.order}
              onChange={(value) => form.setFieldValue('order', Number(value) || 0)}
              min={0}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" leftSection={<IconVideo size={16} />}>
                {editingMedia ? 'Update' : 'Add'} Video
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}