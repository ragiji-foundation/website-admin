'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Button,
  Group,
  Stack,
  Paper,
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
import { IconPlus, IconEdit, IconTrash, IconVideo, IconPlayerPlay, IconExternalLink, IconBrandYoutube, IconBrandInstagram, IconBrandFacebook, IconBrandTwitter, IconBrandVimeo } from '@tabler/icons-react';
import { BilingualInput } from '@/components/BilingualInput';
import Image from 'next/image';
// ✅ ADDED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

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
  // ✅ MIGRATED: Using centralized hooks instead of manual state management
  const { data: mediaItems, loading: _loading, refetch: fetchMediaItems } = useApiData<ElectronicMedia[]>(
    '/api/electronic-media', 
    [],
    { showNotifications: true }
  );

  // ✅ MIGRATED: Using centralized CRUD operations
  const { create, remove, update } = useCrudOperations<ElectronicMedia>('/api/electronic-media', {
    showNotifications: true,
    onSuccess: () => {
      fetchMediaItems(); // Refresh data after operations
      handleCloseModal();
    }
  });

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
      videoUrl: (value) => {
        if (!value) return 'Video URL is required';
        
        // Check if it's a valid URL
        try {
          new URL(value);
        } catch {
          return 'Please enter a valid URL';
        }
        
        // Check if it's from a supported platform
        const supportedPatterns = [
          /youtube\.com\/watch\?v=/,
          /youtu\.be\//,
          /vimeo\.com\/\d+/,
          /instagram\.com\/(?:p|reel|tv)\//,
          /facebook\.com\/.*?\/(?:videos|posts)\//,
          /fb\.watch\//,
          /(?:twitter\.com|x\.com)\/\w+\/status\//,
          /\.(mp4|webm|ogg|mov|avi)(\?|$)/i // Direct video files
        ];
        
        const isSupported = supportedPatterns.some(pattern => pattern.test(value));
        if (!isSupported) {
          return 'URL must be from YouTube, Vimeo, Instagram, Facebook, Twitter/X, or a direct video file';
        }
        
        return null;
      },
    },
  });

  useEffect(() => {
    fetchMediaItems();
  }, [fetchMediaItems]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (editingMedia) {
        await update(editingMedia.id, values);
      } else {
        await create(values);
      }
    } catch (error) {
      console.error('Error submitting electronic media:', error);
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
      await remove(id);
    } catch (error) {
      console.error('Error deleting electronic media:', error);
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
    
    // Extract Vimeo video ID and create thumbnail URL
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    }
    
    // For social media platforms, use a generic placeholder or default image
    if (url.includes('instagram.com')) {
      return '/default-blog-image.png';
    }
    if (url.includes('facebook.com') || url.includes('fb.watch')) {
      return '/default-blog-image.png';
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return '/default-blog-image.png';
    }
    
    return '/placeholder-banner.jpg';
  };

  const getVideoId = (url: string) => {
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) return { platform: 'youtube', id: youtubeMatch[1] };
    
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return { platform: 'vimeo', id: vimeoMatch[1] };
    
    const instagramMatch = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
    if (instagramMatch) return { platform: 'instagram', id: instagramMatch[1] };
    
    const facebookMatch = url.match(/(?:facebook\.com|fb\.watch)\/.*?\/(?:videos|posts)\/(\d+)/);
    if (facebookMatch) return { platform: 'facebook', id: facebookMatch[1] };
    
    const twitterMatch = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
    if (twitterMatch) return { platform: 'twitter', id: twitterMatch[1] };
    
    return null;
  };

  const getPlatformStatistics = () => {
    const stats = {
      youtube: 0,
      vimeo: 0,
      instagram: 0,
      facebook: 0,
      twitter: 0,
      other: 0
    };
    
    mediaItems.forEach(media => {
      const videoInfo = getVideoId(media.videoUrl);
      if (videoInfo) {
        stats[videoInfo.platform as keyof typeof stats]++;
      } else {
        stats.other++;
      }
    });
    
    return stats;
  };

  const getPlatformBadge = (url: string) => {
    const videoInfo = getVideoId(url);
    if (!videoInfo) return { color: 'gray', label: 'Video', icon: IconVideo };
    
    switch (videoInfo.platform) {
      case 'youtube':
        return { color: 'red', label: 'YouTube', icon: IconBrandYoutube };
      case 'vimeo':
        return { color: 'blue', label: 'Vimeo', icon: IconBrandVimeo };
      case 'instagram':
        return { color: 'pink', label: 'Instagram', icon: IconBrandInstagram };
      case 'facebook':
        return { color: 'blue', label: 'Facebook', icon: IconBrandFacebook };
      case 'twitter':
        return { color: 'cyan', label: 'Twitter', icon: IconBrandTwitter };
      default:
        return { color: 'gray', label: 'Video', icon: IconVideo };
    }
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
      <Group mb="lg" wrap="wrap">
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
        
        {/* Platform Statistics */}
        {(() => {
          const platformStats = getPlatformStatistics();
          return (
            <>
              {platformStats.youtube > 0 && (
                <Card withBorder>
                  <Text size="lg" fw={700} c="red">{platformStats.youtube}</Text>
                  <Text size="sm" c="dimmed">YouTube</Text>
                </Card>
              )}
              {platformStats.instagram > 0 && (
                <Card withBorder>
                  <Text size="lg" fw={700} c="pink">{platformStats.instagram}</Text>
                  <Text size="sm" c="dimmed">Instagram</Text>
                </Card>
              )}
              {platformStats.facebook > 0 && (
                <Card withBorder>
                  <Text size="lg" fw={700} c="blue">{platformStats.facebook}</Text>
                  <Text size="sm" c="dimmed">Facebook</Text>
                </Card>
              )}
              {platformStats.twitter > 0 && (
                <Card withBorder>
                  <Text size="lg" fw={700} c="cyan">{platformStats.twitter}</Text>
                  <Text size="sm" c="dimmed">Twitter/X</Text>
                </Card>
              )}
              {platformStats.vimeo > 0 && (
                <Card withBorder>
                  <Text size="lg" fw={700} c="blue">{platformStats.vimeo}</Text>
                  <Text size="sm" c="dimmed">Vimeo</Text>
                </Card>
              )}
            </>
          );
        })()}
      </Group>

      {/* Media Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {mediaItems.map((media) => (
          <Card key={media.id} withBorder>
            <Card.Section>
              <AspectRatio ratio={16 / 9}>
                <div style={{ position: 'relative', backgroundColor: '#f8f9fa' }}>
                  <Image
                    src={media.thumbnail || getVideoThumbnail(media.videoUrl)}
                    alt={media.title}
                    fill
                    style={{ objectFit: 'cover' }}
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
                  {(() => {
                    const platformInfo = getPlatformBadge(media.videoUrl);
                    const IconComponent = platformInfo.icon;
                    return (
                      <Badge 
                        size="sm" 
                        color={platformInfo.color} 
                        ml="xs"
                        leftSection={<IconComponent size={12} />}
                      >
                        {platformInfo.label}
                      </Badge>
                    );
                  })()}
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
              <Text size="sm" mb="xs">
                Supports YouTube, Vimeo, Instagram, Facebook, Twitter/X, and direct video links. 
                YouTube and Vimeo thumbnails are auto-generated.
              </Text>
              <Text size="xs" c="dimmed">
                Examples: youtube.com/watch?v=..., instagram.com/p/..., facebook.com/video/..., x.com/user/status/...
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
              placeholder="https://www.youtube.com/watch?v=... or https://instagram.com/p/..."
              description="YouTube, Vimeo, Instagram, Facebook, Twitter/X, or direct video file URL"
              error={form.errors.videoUrl as string}
            />

            <BilingualInput
              label="Custom Thumbnail URL"
              valueEn={form.values.thumbnail}
              valueHi=""
              onChangeEn={(value) => form.setFieldValue('thumbnail', value)}
              onChangeHi={() => {}}
              placeholder="https://example.com/thumbnail.jpg"
              description="Optional: Custom thumbnail (YouTube/Vimeo thumbnails auto-generated)"
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