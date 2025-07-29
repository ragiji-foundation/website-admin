'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Image,
  Badge,
  Group,
  ActionIcon,
  Button,
  Modal,
  Stack,
  LoadingOverlay,
  Box
} from '@mantine/core';
import { IconStar, IconStarFilled, IconEdit, IconTrash, IconPlus, IconEye } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
// ✅ ADDED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

interface SuccessStory {
  id: string;
  slug: string;
  title: string;
  titleHi?: string;
  content: string | { root?: { children?: Array<{ children?: Array<{ text?: string }> }> } };
  contentHi?: string | { root?: { children?: Array<{ children?: Array<{ text?: string }> }> } };
  personName: string;
  personNameHi?: string;
  location: string;
  locationHi?: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function SuccessStoriesPage() {
  // ✅ MIGRATED: Using centralized hooks instead of manual state management
  const { data: stories, loading, refetch: fetchStories } = useApiData<SuccessStory[]>(
    '/api/success-stories', 
    [],
    { showNotifications: true }
  );

  // ✅ MIGRATED: Using centralized CRUD operations
  const { remove } = useCrudOperations<SuccessStory>('/api/success-stories', {
    showNotifications: true,
    onSuccess: () => {
      fetchStories(); // Refresh data after operations
      closeDeleteModal();
    }
  });

  const [deleteStory, setDeleteStory] = useState<SuccessStory | null>(null);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleDelete = async () => {
    if (!deleteStory) return;

    try {
      await remove(deleteStory.id);
      setDeleteStory(null);
    } catch {
      console.error('Error deleting success story');
    }
  };

  const renderContent = (content: string | { root?: { children?: Array<{ children?: Array<{ text?: string }> }> } }) => {
    if (typeof content === 'string') {
      return content;
    }
    // Handle rich text content - extract plain text
    if (content?.root?.children) {
      return content.root.children
        .map((p) => p.children?.map((c) => c.text).join(''))
        .join(' ')
        .substring(0, 200) + '...';
    }
    return 'No content available';
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Success Stories</Title>
          <Text c="dimmed">Manage client success stories and testimonials</Text>
        </div>
        <Link href="/success-stories/new">
          <Button leftSection={<IconPlus size={16} />}>
            Add New Story
          </Button>
        </Link>
      </Group>

      <Grid>
        {stories.map((story) => (
          <Grid.Col key={story.id} span={{ base: 12, md: 6, lg: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
              <Card.Section>
                {story.imageUrl && (
                  <Image
                    src={story.imageUrl}
                    height={160}
                    alt={story.title}
                    fallbackSrc="/avatar.png"
                  />
                )}
              </Card.Section>

              <Stack gap="sm" mt="md" mb="xs">
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Title order={4} lineClamp={2}>
                      {story.title}
                    </Title>
                    {story.titleHi && (
                      <Text 
                        size="sm" 
                        c="dimmed" 
                        lineClamp={1}
                        style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                      >
                        {story.titleHi}
                      </Text>
                    )}
                  </div>
                  <ActionIcon
                    variant="subtle"
                    color={story.featured ? 'yellow' : 'gray'}
                    size="sm"
                  >
                    {story.featured ? <IconStarFilled size={16} /> : <IconStar size={16} />}
                  </ActionIcon>
                </Group>

                <div>
                  <Text fw={500} size="sm">{story.personName}</Text>
                  {story.personNameHi && (
                    <Text 
                      size="xs" 
                      c="dimmed"
                      style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                    >
                      {story.personNameHi}
                    </Text>
                  )}
                  <Text size="xs" c="dimmed">{story.location}</Text>
                  {story.locationHi && (
                    <Text 
                      size="xs" 
                      c="dimmed"
                      style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                    >
                      {story.locationHi}
                    </Text>
                  )}
                </div>

                <Text size="sm" lineClamp={3}>
                  {renderContent(story.content)}
                </Text>

                <Group gap="xs">
                  {story.featured && <Badge color="yellow" size="xs">Featured</Badge>}
                  <Badge variant="light" size="xs">Order: {story.order}</Badge>
                </Group>
              </Stack>

              <Group justify="space-between" mt="auto">
                <Link href={`/success-stories/${story.id}`}>
                  <ActionIcon variant="light" color="blue">
                    <IconEye size={16} />
                  </ActionIcon>
                </Link>
                <Group gap="xs">
                  <Link href={`/success-stories/${story.id}/edit`}>
                    <ActionIcon variant="light" color="blue">
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Link>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => {
                      setDeleteStory(story);
                      openDeleteModal();
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {stories.length === 0 && (
        <Box ta="center" py="xl">
          <Text c="dimmed" size="lg">No success stories found</Text>
          <Text c="dimmed" size="sm">Start by adding your first success story</Text>
        </Box>
      )}

      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Success Story"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete &quot;{deleteStory?.title}&quot;? 
            This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
