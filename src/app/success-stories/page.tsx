import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Group,
  SimpleGrid,
  Box,
  Stack,
  Badge,
  Flex
} from '@mantine/core';
import { formatDate } from '@/utils/date';
import { truncateText, stripHtml } from '@/utils/strings';
import { IconPlus, IconStar, IconPencil, IconTrash } from '@tabler/icons-react';
import { DeleteSuccessStory } from '@/components/SuccessStories/DeleteSuccessStory';

export const metadata: Metadata = {
  title: 'Success Stories | Admin Dashboard',
  description: 'Manage success stories for your website',
};

async function getSuccessStories() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/success-stories`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch success stories');
    }

    return response.json();
  } catch (error) {
    console.error('Error loading success stories:', error);
    return { data: [] };
  }
}

async function deleteSuccessStory(id: string) {
  'use server';
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/success-stories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete success story');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting success story:', error);
    return { success: false };
  }
}

export default async function SuccessStoriesPage() {
  const { data: successStories = [] } = await getSuccessStories();

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="lg">
        <Box>
          <Title order={1}>Success Stories</Title>
          <Text c="dimmed">
            Manage your client success stories
          </Text>
        </Box>
        <Button
          component={Link}
          href="/success-stories/new"
          leftSection={<IconPlus size="1rem" />}
        >
          Add New Story
        </Button>
      </Group>

      {successStories.length === 0 ? (
        <Box ta="center" py="xl">
          <Text size="xl" c="dimmed" mb="md">
            No success stories found
          </Text>
          <Button
            component={Link}
            href="/success-stories/new"
          >
            Create your first success story
          </Button>
        </Box>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {successStories.map((story: any) => (
            <Card key={story.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Box pos="relative" h={200}>
                  {story.imageUrl ? (
                    <Image
                      src={story.imageUrl}
                      alt={story.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Flex
                      h={200}
                      w="100%"
                      bg="gray.1"
                      align="center"
                      justify="center"
                    >
                      <Text c="gray.6">No image</Text>
                    </Flex>
                  )}

                  {story.featured && (
                    <Badge
                      color="yellow"
                      pos="absolute"
                      top={8}
                      right={8}
                      leftSection={<IconStar size="0.8rem" />}
                    >
                      Featured
                    </Badge>
                  )}
                </Box>
              </Card.Section>

              <Stack mt="md" gap="xs">
                <Title order={3} lineClamp={2}>{story.title}</Title>
                <Stack gap={2}>
                  <Text size="sm" c="dimmed">By {story.clientName}</Text>
                  <Text size="sm" c="dimmed">{story.clientCompany}</Text>
                  <Text size="sm" c="dimmed">{formatDate(story.publishedDate)}</Text>
                </Stack>

                <Text mt="sm" size="sm" lineClamp={3} c="dimmed">
                  {truncateText(stripHtml(story.content), 150)}
                </Text>
              </Stack>

              <Group mt="xl" justify="space-between" pt="sm" style={{ borderTop: '1px solid #e9ecef' }}>
                <Button
                  variant="default"
                  component={Link}
                  href={`/success-stories/${story.slug}/edit`}
                  leftSection={<IconPencil size="1rem" />}
                >
                  Edit
                </Button>

                <DeleteSuccessStory
                  storyId={story.id}
                  onDelete={async (id) => {
                    'use server';
                    await deleteSuccessStory(id);
                  }}
                />
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
