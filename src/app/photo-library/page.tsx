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
  Text,
  Select,
  CopyButton,
  Tooltip,
  Container,
  Drawer,
  ActionIcon,
  Badge,
  Card,
  Flex,
  Box,
  Modal,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconTrash,
  IconCopy,
  IconCheck,
  IconPlus,
  IconFilter,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { FileButton } from '@mantine/core';
import { AdminPageLayout } from '@/components/Layout/AdminPageLayout';
import { handleImageUpload } from '@/utils/imageUpload';
import { useDisclosure } from '@mantine/hooks';

interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
}

const CATEGORIES = [
  { value: 'event', label: 'Event' },
  { value: 'center', label: 'Center' },
  { value: 'initiative', label: 'Initiative' },
  { value: 'blog', label: 'Blog' },
  { value: 'general', label: 'General' },
];

export default function GalleryAdmin() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [viewerOpened, { open: openViewer, close: closeViewer }] = useDisclosure(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
  });

  useEffect(() => {
    fetchImages();
  }, [selectedCategory]);

  const fetchImages = async () => {
    try {
      const url = new URL('/api/gallery', window.location.origin);
      if (selectedCategory) {
        url.searchParams.append('category', selectedCategory);
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch images',
        color: 'red',
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
          color: 'green',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add image');

      notifications.show({
        title: 'Success',
        message: 'Image added successfully',
        color: 'green',
      });

      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        category: '',
      });

      fetchImages();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add image',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete image');

      notifications.show({
        title: 'Success',
        message: 'Image deleted successfully',
        color: 'green',
      });

      fetchImages();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete image',
        color: 'red',
      });
    }
  };

  const filteredImages = images.filter(image => {
    const matchesCategory = !selectedCategory || image.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AdminPageLayout>
      <Container size="xl" py="xl">
        <Group justify="space-between" mb="xl">
        <Title
          order={2}
          styles={{
            root: {
              background: 'linear-gradient(45deg, indigo, cyan)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }
          }}
    >
      Content Library
    </Title>
          <Group>
            <Button
              leftSection={<IconPlus size={16} />}
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
              onClick={openDrawer}
            >
              Add New
            </Button>
          </Group>
        </Group>

        <Paper shadow="sm" p="md" radius="md" withBorder mb="xl">
          <Grid align="center">
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <TextInput
                placeholder="Search images..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Select
                placeholder="Filter by category"
                leftSection={<IconFilter size={16} />}
                value={selectedCategory}
                onChange={setSelectedCategory}
                data={[
                  { value: '', label: 'All Categories' },
                  ...CATEGORIES,
                ]}
                clearable
              />
            </Grid.Col>
          </Grid>
        </Paper>

        <Grid gutter="md">
          {filteredImages.map((item) => (
            <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                shadow="sm"
                padding="md"
                radius="md"
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  },
                }}
                onClick={() => {
                  setSelectedImage(item);
                  openViewer();
                }}
              >
                <Card.Section>
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl || null}
                      alt={item.title}
                      height={200}
                      fit="cover"
                    />
                  )}
                </Card.Section>

                <Stack gap="xs" mt="md">
                  <Text fw={500} lineClamp={1}>{item.title}</Text>
                  <Badge size="sm" variant="light" color="blue">
                    {item.category}
                  </Badge>
                  <Group justify="space-between" mt="xs">
                    <CopyButton value={item.imageUrl}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied!' : 'Copy URL'}>
                          <ActionIcon
                            variant="light"
                            color={copied ? 'teal' : 'blue'}
                            onClick={(e) => {
                              e.stopPropagation();
                              copy();
                            }}
                          >
                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
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

      {/* Upload Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Add New Image"
        position="right"
        size="md"
        padding="xl"
      >
        <form onSubmit={(e) => {
          handleSubmit(e);
          closeDrawer();
        }}>
          <Stack gap="md">
            <TextInput
              label="Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextInput
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Select
              label="Category"
              required
              value={formData.category}
              onChange={(value) => setFormData({ ...formData, category: value || '' })}
              data={CATEGORIES}
            />
            <Box>
              <FileButton
                onChange={onImageUpload}
                accept="image/png,image/jpeg,image/gif,image/webp"
              >
                {(props) => (
                  <Button {...props} variant="light" fullWidth>
                    Choose Image
                  </Button>
                )}
              </FileButton>
              {formData.imageUrl && (
                <Image
                  src={formData.imageUrl || null}
                  alt="Preview"
                  height={200}
                  fit="contain"
                  mt="md"
                />
              )}
            </Box>
            <Button
              type="submit"
              loading={loading}
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
            >
              Upload Image
            </Button>
          </Stack>
        </form>
      </Drawer>

      {/* Image Viewer Modal */}
      <Modal
        opened={viewerOpened}
        onClose={closeViewer}
        size="lg"
        padding="xl"
        title={selectedImage?.title}
      >
        {selectedImage && (
          <Stack>
            {selectedImage.imageUrl && (
              <Image
                src={selectedImage.imageUrl || null}
                alt={selectedImage.title}
                fit="contain"
                height={400}
              />
            )}
            {selectedImage.description && (
              <Text size="sm" c="dimmed">
                {selectedImage.description}
              </Text>
            )}
            <Group>
              <Badge size="lg">{selectedImage.category}</Badge>
              <CopyButton value={selectedImage.imageUrl}>
                {({ copied, copy }) => (
                  <Button
                    variant="light"
                    color={copied ? 'teal' : 'blue'}
                    onClick={copy}
                    leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  >
                    {copied ? 'Copied!' : 'Copy URL'}
                  </Button>
                )}
              </CopyButton>
            </Group>
          </Stack>
        )}
      </Modal>
    </AdminPageLayout>
  );
} 