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
  Stack
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPhoto, IconFiles } from '@tabler/icons-react';
import { ContentLibrarySelector } from '@/components/Gallery/ContentLibrarySelector';

interface GalleryItem {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'content';
  createdAt: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch gallery items',
        color: 'red'
      });
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

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
        message: 'Failed to upload file',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Text
          component="h1"
          size="xl"
          fw={700}
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan' }}
        >
          Media Gallery
        </Text>
        <Button onClick={open} variant="filled">Add New</Button>
      </Group>

      <Grid>
        {items.map((item) => (
          <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image
                  src={item.url}
                  height={160}
                  alt={item.title}
                  fallbackSrc="/placeholder.svg"
                />
              </Card.Section>

              <Text mt="md" fw={500}>{item.title}</Text>
              <Text size="sm" c="dimmed">
                Added on {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

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
              <FileButton onChange={handleFileUpload} accept="image/png,image/jpeg">
                {(props) => (
                  <Button {...props} loading={loading}>
                    Choose image
                  </Button>
                )}
              </FileButton>
              <Text size="sm" c="dimmed">
                Accepted formats: PNG, JPG (max 5MB)
              </Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="content" pt="md">
            <ContentLibrarySelector onSelect={handleFileUpload} />
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </Container>
  );
}

