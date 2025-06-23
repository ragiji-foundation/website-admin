'use client';
import { useState, useEffect } from 'react';
import {
  Grid,
  Container,
  Title,
  Text,
  Button,
  Group,
  Select,
  TextInput,
  Stack,
  LoadingOverlay,
} from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { SuccessStoryCard } from './SuccessStoryCard';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

interface SuccessStory {
  id: string;
  slug: string;
  title: string;
  titleHi?: string;
  content: Record<string, unknown>;
  contentHi?: Record<string, unknown>;
  personName: string;
  personNameHi?: string;
  location: string;
  locationHi?: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
}

interface SuccessStoryListProps {
  showHeader?: boolean;
  showActions?: boolean;
}

export function SuccessStoryList({
  showHeader = true,
  showActions = true,
}: SuccessStoryListProps) {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const router = useRouter();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/success-stories');
      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      setStories(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch success stories',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedStories = stories
    .filter((story) =>
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.titleHi && story.titleHi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (story.personNameHi && story.personNameHi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (story.locationHi && story.locationHi.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'person':
          return a.personName.localeCompare(b.personName);
        case 'featured':
          return Number(b.featured) - Number(a.featured);
        case 'order':
        default:
          return a.order - b.order;
      }
    });

  const handleEdit = (storyId: string) => {
    router.push(`/success-stories/${storyId}/edit`);
  };

  return (
    <Container size="xl" py={showHeader ? "xl" : 0}>
      <LoadingOverlay visible={loading} />
      
      {showHeader && (
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={1}>Success Stories</Title>
            <Text c="dimmed">Manage and showcase client success stories</Text>
          </div>
          {showActions && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push('/success-stories/new')}
            >
              Add New Story
            </Button>
          )}
        </Group>
      )}

      <Stack gap="md" mb="xl">
        <Group>
          <TextInput
            placeholder="Search stories, people, or locations..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Sort by"
            value={sortBy}
            onChange={(value) => setSortBy(value || 'order')}
            data={[
              { value: 'order', label: 'Display Order' },
              { value: 'title', label: 'Title' },
              { value: 'person', label: 'Person Name' },
              { value: 'featured', label: 'Featured First' },
            ]}
            style={{ minWidth: 150 }}
          />
        </Group>
      </Stack>

      <Grid>
        {filteredAndSortedStories.map((story) => (
          <Grid.Col key={story.id} span={{ base: 12, md: 6, lg: 4 }}>
            <SuccessStoryCard
              story={story}
              onEdit={() => handleEdit(story.id)}
              showActions={showActions}
            />
          </Grid.Col>
        ))}
      </Grid>

      {filteredAndSortedStories.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Text c="dimmed" mb="md">
            {searchQuery ? 'No stories match your search criteria' : 'No success stories found'}
          </Text>
          {showActions && !searchQuery && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push('/success-stories/new')}
            >
              Create Your First Story
            </Button>
          )}
        </div>
      )}
    </Container>
  );
}