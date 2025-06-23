'use client';
import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Button,
  Group,
  Table,
  ActionIcon,
  Badge,
  Text,
  Image,
  Modal,
  Stack,
  Box,
  Card,
  Grid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SuccessStory {
  id: string;
  slug: string;
  title: string;
  titleHi?: string;
  content: Record<string, any>;
  contentHi?: Record<string, any>;
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
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/success-stories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete story');

      notifications.show({
        title: 'Success',
        message: 'Success story deleted successfully',
        color: 'green',
      });

      setStories(stories.filter(story => story.id !== id));
      setDeleteModal(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete success story',
        color: 'red',
      });
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/success-stories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !featured }),
      });

      if (!response.ok) throw new Error('Failed to update story');

      await fetchStories();
      notifications.show({
        title: 'Success',
        message: 'Story updated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update story',
        color: 'red',
      });
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Success Stories</Title>
          <Text c="dimmed">Manage client success stories and testimonials</Text>
        </div>
        <Button
          component={Link}
          href="/success-stories/new"
          leftSection={<IconPlus size={16} />}
        >
          Add Success Story
        </Button>
      </Group>

      <Card withBorder>
        <Grid>
          {stories.map((story) => (
            <Grid.Col key={story.id} span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" p="md" h="100%">
                <Card.Section>
                  {story.imageUrl ? (
                    <Image
                      src={story.imageUrl}
                      height={160}
                      alt={story.title}
                      fit="cover"
                    />
                  ) : (
                    <Box
                      h={160}
                      bg="gray.1"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text c="dimmed">No Image</Text>
                    </Box>
                  )}
                </Card.Section>

                <Stack gap="xs" mt="md">
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Text fw={600} lineClamp={2}>
                        {story.title}
                      </Text>
                      {story.titleHi && (
                        <Text
                          size="sm"
                          c="dimmed"
                          lineClamp={2}
                          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                        >
                          {story.titleHi}
                        </Text>
                      )}
                    </div>
                    {story.featured && (
                      <Badge color="yellow" size="sm">
                        Featured
                      </Badge>
                    )}
                  </Group>

                  <div>
                    <Text size="sm" fw={500}>
                      {story.personName}
                    </Text>
                    {story.personNameHi && (
                      <Text
                        size="xs"
                        c="dimmed"
                        style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                      >
                        {story.personNameHi}
                      </Text>
                    )}
                  </div>

                  <div>
                    <Text size="sm" c="dimmed">
                      {story.location}
                    </Text>
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

                  <Group justify="space-between" mt="md">
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        component={Link}
                        href={`/success-stories/${story.slug}/edit`}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="green"
                        onClick={() => window.open(`/success-stories/${story.slug}`, '_blank')}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => setDeleteModal(story.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                    <Button
                      size="xs"
                      variant={story.featured ? "filled" : "light"}
                      color="yellow"
                      onClick={() => toggleFeatured(story.id, story.featured)}
                    >
                      {story.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {stories.length === 0 && !loading && (
          <Box ta="center" py="xl">
            <Text c="dimmed" mb="md">
              No success stories found
            </Text>
            <Button
              component={Link}
              href="/success-stories/new"
              leftSection={<IconPlus size={16} />}
            >
              Create Your First Story
            </Button>
          </Box>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Success Story"
        centered
      >
        <Text mb="md">
          Are you sure you want to delete this success story? This action cannot be undone.
        </Text>
        <Group justify="right">
          <Button variant="light" onClick={() => setDeleteModal(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => deleteModal && handleDelete(deleteModal)}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
