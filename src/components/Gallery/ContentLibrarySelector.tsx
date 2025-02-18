import { useState, useEffect } from 'react';
import { Grid, Card, Image, Text, Button, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';

interface ContentItem {
  id: string;
  title: string;
  thumbnail: string;
  type: string;
  url: string;
}

interface ContentLibrarySelectorProps {
  onSelect: (file: File) => void;
}

export function ContentLibrarySelector({ onSelect }: ContentLibrarySelectorProps) {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchContentLibrary();
  }, []);

  const fetchContentLibrary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content-library');
      if (!response.ok) throw new Error('Failed to fetch content');
      const data = await response.json();
      setContents(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch content library',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (content: ContentItem) => {
    try {
      setSelectedId(content.id);
      const response = await fetch(content.url);
      const blob = await response.blob();
      const file = new File([blob], content.title, { type: blob.type });
      await onSelect(file);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to select content',
        color: 'red'
      });
    } finally {
      setSelectedId(null);
    }
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
              }}
            >
              <Group align="flex-start">
                <Image
                  src={content.thumbnail}
                  width={80}
                  height={80}
                  radius="md"
                  alt={content.title}
                  fallbackSrc="/placeholder.svg"
                />
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
                  onClick={() => handleSelect(content)}
                >
                  Select
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {contents.length === 0 && !loading && (
        <Text c="dimmed" ta="center" py="xl">
          No content available in the library
        </Text>
      )}
    </Stack>
  );
}