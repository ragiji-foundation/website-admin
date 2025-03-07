import { useState, useEffect } from 'react';
import { Grid, Card, Image, Text, Button, Group, Stack, LoadingOverlay, Box, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { uploadToCloudinary, getTransformedUrl } from '@/utils/cloudinary';
import { IconCheck, IconEye } from '@tabler/icons-react';

interface ContentItem {
  id: string;
  title: string;
  thumbnail?: string;
  imageUrl?: string; // Support both formats
  url?: string;      // Support both formats
  type?: string;
}

interface ContentLibrarySelectorProps {
  onSelect: (file: File) => void;
}

export function ContentLibrarySelector({ onSelect }: ContentLibrarySelectorProps) {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchContentLibrary();
  }, []);

  const fetchContentLibrary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content-library');
      if (!response.ok) throw new Error('Failed to fetch content');

      const data = await response.json();

      // Normalize the data to ensure consistent field names
      const normalizedContents = data.map((item: any) => ({
        id: item.id || String(Math.random()),
        title: item.title || 'Untitled',
        thumbnail: item.thumbnail || item.imageUrl || item.url || '/placeholder.svg',
        url: item.url || item.imageUrl || '',
        type: item.type || 'image'
      }));

      setContents(normalizedContents);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch content library',
        color: 'red'
      });
      console.error('Content library fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (content: ContentItem) => {
    try {
      setSelectedId(content.id);

      const imageUrl = content.url || content.imageUrl;

      if (!imageUrl) {
        throw new Error('No valid URL found for this content');
      }

      // Fetch the file from the URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image data');
      }

      const blob = await response.blob();
      const file = new File([blob], content.title, { type: blob.type || 'image/jpeg' });

      // Pass the file to the parent component's handler
      await onSelect(file);
    } catch (error) {
      console.error('Error selecting content:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to select content',
        color: 'red'
      });
    } finally {
      setSelectedId(null);
    }
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
  };

  if (loading && contents.length === 0) {
    return (
      <Stack align="center" py="xl">
        <Text>Loading content library...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Text size="sm" fw={500}>
        Select content from your library
      </Text>

      {previewUrl && (
        <Box
          style={{
            position: 'relative',
            marginBottom: 15,
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
            padding: 10,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Image
            src={previewUrl}
            height={200}
            fit="contain"
            alt="Preview"
          />
          <ActionIcon
            variant="filled"
            color="dark"
            radius="xl"
            size="sm"
            style={{ position: 'absolute', top: 5, right: 5 }}
            onClick={() => setPreviewUrl(null)}
          >
            &times;
          </ActionIcon>
        </Box>
      )}

      <Grid gutter="md">
        {contents.map((content) => (
          <Grid.Col key={content.id} span={{ base: 12, sm: 6 }}>
            <Card
              padding="sm"
              radius="md"
              withBorder
              style={{
                cursor: 'pointer',
                opacity: selectedId === content.id ? 0.7 : 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              <Group align="flex-start">
                <div style={{ position: 'relative', width: 80, height: 80 }}>
                  <Image
                    src={getTransformedUrl(content.thumbnail || '/placeholder.svg', 160, 160)}
                    width={80}
                    height={80}
                    radius="md"
                    alt={content.title}
                    fallbackSrc="/placeholder.svg"
                  />
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    radius="xl"
                    size="xs"
                    style={{ position: 'absolute', bottom: 5, right: 5 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(content.url || content.imageUrl || '');
                    }}
                  >
                    <IconEye size={12} />
                  </ActionIcon>
                </div>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {content.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {content.type}
                  </Text>
                </div>
                <Button
                  variant="light"
                  size="xs"
                  loading={selectedId === content.id}
                  leftSection={selectedId === content.id ? <IconCheck size={14} /> : null}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(content);
                  }}
                >
                  Select
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {contents.length === 0 && !loading && (
        <Box
          style={{
            padding: '30px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: 8,
            border: '1px dashed #e0e0e0'
          }}
        >
          <Text c="dimmed" ta="center">
            No content available in the library
          </Text>
        </Box>
      )}
    </Stack>
  );
}