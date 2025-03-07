"use client";

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Grid,
  Card,
  Image,
  Text,
  Button,
  Group,
  Modal,
  Tabs,
  FileButton,
  Stack,
  Skeleton,
  ActionIcon,
  Tooltip,
  Badge,
  Overlay,
  Paper,
  Box,
  Text as MantineText,
  rem,
  Loader
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPhoto,
  IconFiles,
  IconTrash,
  IconCopy,
  IconSearch,
  IconEye,
  IconEdit,
  IconX
} from '@tabler/icons-react';
import { ContentLibrarySelector } from '@/components/Gallery/ContentLibrarySelector';
import { uploadToCloudinary, getTransformedUrl } from '@/utils/cloudinary';
import { useHover } from '@mantine/hooks';

interface GalleryItem {
  id: string;
  title: string;
  url?: string;
  imageUrl?: string; // Some API responses might have imageUrl instead of url
  type?: 'image' | 'content';
  createdAt: string;
  description?: string;
  category?: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [previewOpened, { open: openPreview, close: closePreview }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gallery');
      if (!response.ok) throw new Error('Failed to fetch gallery items');

      const data = await response.json();

      // Transform the data to ensure consistent field names
      const normalizedItems = data.map((item: any) => ({
        id: item.id,
        title: item.title || 'Untitled',
        url: item.url || item.imageUrl, // Handle both url and imageUrl
        imageUrl: item.imageUrl || item.url, // Support both formats
        type: item.type || 'image',
        createdAt: item.createdAt || new Date().toISOString(),
        description: item.description || '',
        category: item.category || 'general'
      }));

      setItems(normalizedItems);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch gallery items',
        color: 'red'
      });
      console.error('Gallery fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    try {
      setLoading(true);

      // Use Cloudinary for upload
      const result = await uploadToCloudinary(file, {
        folder: 'gallery',
        tags: ['gallery', 'upload'],
        resourceType: 'image'
      });

      // Create a new gallery item
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: file.name.split('.')[0],
          imageUrl: result.url,
          type: 'image',
          description: 'Uploaded on ' + new Date().toLocaleDateString(),
          category: 'upload'
        }),
      });

      if (!response.ok) throw new Error('Failed to save to gallery');

      await fetchGalleryItems();
      notifications.show({
        title: 'Success',
        message: 'File uploaded successfully',
        color: 'green'
      });
      close();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to upload file',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (item: GalleryItem) => {
    setSelectedItem(item);
    openPreview();
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this image?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setItems(items.filter(item => item.id !== id));

      notifications.show({
        title: 'Success',
        message: 'Image deleted successfully',
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete image',
        color: 'red'
      });
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    notifications.show({
      title: 'URL Copied',
      message: 'Image URL copied to clipboard',
      color: 'blue'
    });
  };

  const filteredItems = searchTerm
    ? items.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    : items;

  return (
    <Container size="xl" py="xl">
      <Paper shadow="xs" p="md" mb="lg" withBorder>
        <Group justify="space-between" wrap="nowrap">
          <MantineText
            component="h1"
            size="xl"
            fw={700}
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Media Gallery
          </MantineText>
          <Group>
            <div className="search-container" style={{ position: 'relative' }}>
              <IconSearch
                size={16}
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search images..."
                style={{
                  padding: '8px 8px 8px 35px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  width: '200px'
                }}
              />
              {searchTerm && (
                <ActionIcon
                  size="xs"
                  radius="xl"
                  variant="subtle"
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                >
                  <IconX size={12} />
                </ActionIcon>
              )}
            </div>
            <Button
              onClick={open}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              leftSection={<IconPhoto size={16} />}
            >
              Add New
            </Button>
          </Group>
        </Group>
      </Paper>

      {isLoading ? (
        <Grid>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section>
                  <Skeleton height={160} />
                </Card.Section>
                <Skeleton height={20} mt="md" width="70%" />
                <Skeleton height={15} mt="sm" width="40%" />
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      ) : filteredItems.length === 0 ? (
        <Paper
          p="xl"
          withBorder
          style={{
            textAlign: 'center',
            borderStyle: 'dashed',
            backgroundColor: '#f9f9f9'
          }}
        >
          <IconPhoto size={40} style={{ opacity: 0.5, marginBottom: 10 }} />
          <Text size="lg" fw={500} mb="xs">No images found</Text>
          <Text size="sm" c="dimmed" mb="md">
            {searchTerm ? 'No results match your search criteria.' : 'Your gallery is empty.'}
          </Text>
          {!searchTerm && (
            <Button variant="light" onClick={open} leftSection={<IconPhoto size={16} />}>
              Upload your first image
            </Button>
          )}
        </Paper>
      ) : (
        <Grid gutter="md">
          {filteredItems.map((item) => (
            <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
                className="gallery-card"
              >
                <Card.Section style={{ position: 'relative' }} onClick={() => handlePreview(item)}>
                  <Image
                    src={getTransformedUrl(item.imageUrl || item.url || '', 600, 400, { quality: 80 })}
                    height={200}
                    alt={item.title}
                    fallbackSrc="/placeholder.svg"
                    style={{ cursor: 'pointer' }}
                    fit="cover"
                  />
                  <div className="image-hover-overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  }}>
                    <IconEye color="white" size={24} />
                  </div>
                </Card.Section>

                <Stack gap="xs" mt="md" style={{ flex: 1 }}>
                  <Text fw={500} lineClamp={1}>{item.title}</Text>
                  <Text size="xs" c="dimmed">
                    Added on {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                  {item.category && (
                    <Badge size="sm" variant="light">
                      {item.category}
                    </Badge>
                  )}
                </Stack>

                <Group mt="auto" gap="xs" style={{ marginTop: 'auto' }}>
                  <Tooltip label="Preview">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handlePreview(item)}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Copy URL">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => copyToClipboard(item.url || item.imageUrl || '')}
                    >
                      <IconCopy size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete">
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(item.id)}
                      ml="auto"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Upload Modal */}
      <Modal opened={opened} onClose={close} title="Add to Gallery" size="lg">
        <Tabs defaultValue="upload">
          <Tabs.List>
            <Tabs.Tab value="upload" leftSection={<IconPhoto size={16} />}>
              Upload Photo
            </Tabs.Tab>
            <Tabs.Tab value="content" leftSection={<IconFiles size={16} />}>
              Content Library
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="upload" pt="md">
            <Stack>
              <Box
                style={{
                  border: '2px dashed #e0e0e0',
                  borderRadius: '8px',
                  padding: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f9fafb'
                }}
              >
                <IconPhoto size={40} style={{ opacity: 0.5, marginBottom: 15 }} />
                <Text size="sm" ta="center" mb="md">
                  Drag and drop your image here, or click to select
                </Text>
                <FileButton onChange={handleFileUpload} accept="image/png,image/jpeg,image/webp,image/gif">
                  {(props) => (
                    <Button {...props} loading={loading} variant="light" size="sm">
                      Choose image
                    </Button>
                  )}
                </FileButton>
              </Box>
              <Text size="xs" c="dimmed" mt="xs">
                Accepted formats: PNG, JPG, WebP, GIF (max 5MB)
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="md">
            <ContentLibrarySelector onSelect={handleFileUpload} />
          </Tabs.Panel>
        </Tabs>
      </Modal>

      {/* Preview Modal */}
      <Modal
        opened={previewOpened}
        onClose={closePreview}
        title={selectedItem?.title || 'Image Preview'}
        size="xl"
        padding="lg"
      >
        {selectedItem && (
          <Stack>
            <Box
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <Image
                src={selectedItem.imageUrl || selectedItem.url || ''}
                alt={selectedItem.title}
                fit="contain"
                style={{ maxHeight: '60vh' }}
                fallbackSrc="/placeholder.svg"
              />
            </Box>

            <Stack gap="xs" mt="xs">
              <Text fw={500} size="lg">{selectedItem.title}</Text>
              {selectedItem.description && (
                <Text size="sm" c="dimmed">{selectedItem.description}</Text>
              )}
              <Text size="xs" c="dimmed">
                Added on {new Date(selectedItem.createdAt).toLocaleDateString()}
              </Text>

              <Group mt="md">
                <Button
                  variant="light"
                  leftSection={<IconCopy size={16} />}
                  onClick={() => copyToClipboard(selectedItem.url || selectedItem.imageUrl || '')}
                >
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => {
                    handleDelete(selectedItem.id);
                    closePreview();
                  }}
                >
                  Delete Image
                </Button>
              </Group>
            </Stack>
          </Stack>
        )}
      </Modal>

      {/* Add custom styling */}
      <style jsx global>{`
        .gallery-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .gallery-card:hover .image-hover-overlay {
          opacity: 1;
        }
      `}</style>
    </Container>
  );
}

