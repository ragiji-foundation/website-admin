'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Image,
  Card,
  Stack,
  Group,
  Badge,
  Button,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { IconArrowLeft, IconEdit, IconExclamationCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { RichTextContent } from '@/components/RichTextContent';
// ✅ MIGRATED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';

interface SuccessStory {
  id: string;
  title: string;
  titleHi?: string;
  content: any; // TipTap JSON content
  contentHi?: any;
  personName: string;
  personNameHi?: string;
  location: string;
  locationHi?: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function SuccessStoryViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id ?? '') as string;

  // ✅ MIGRATED: Using centralized hooks instead of manual state management
  const { data: apiResponse, loading, error } = useApiData<any>(
    `/api/success-stories/${id}`,
    null,
    { 
      showNotifications: true,
      onError: () => router.push('/success-stories')
    }
  );

  // Extract the story data from the API response structure
  // Handle both centralized API format {success: true, data: T} and direct format
  const story: SuccessStory | null = apiResponse?.success 
    ? apiResponse.data 
    : apiResponse;

  // Debug logging
  console.log('Debug - API Response:', apiResponse);
  console.log('Debug - Extracted Story:', story);
  console.log('Debug - Loading:', loading);
  console.log('Debug - Error:', error);

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error || !story) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconExclamationCircle size={16} />} color="red" variant="light">
          {typeof error === 'string' ? error : 'Success story not found'}
        </Alert>
        <Group mt="xl">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.back()}
        >
          Back to Success Stories
        </Button>
        <Link href={`/success-stories/${story.id}/edit`}>
          <Button leftSection={<IconEdit size={16} />}>
            Edit Story
          </Button>
        </Link>
      </Group>

      <Card shadow="sm" padding="xl" radius="md" withBorder>
        {story.imageUrl && (
          <Card.Section mb="lg">
            <Image
              src={story.imageUrl}
              height={300}
              alt={story.title}
              fallbackSrc="/avatar.png"
            />
          </Card.Section>
        )}

        <Stack gap="lg">
          <div>
            <Group justify="space-between" align="flex-start" mb="sm">
              <div style={{ flex: 1 }}>
                <Title order={1} mb="xs">
                  {story.title}
                </Title>
                {story.titleHi && (
                  <Title
                    order={2}
                    c="dimmed"
                    fw={400}
                    style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                  >
                    {story.titleHi}
                  </Title>
                )}
              </div>
              <Group gap="xs">
                {story.featured && <Badge color="yellow">Featured</Badge>}
                <Badge variant="light">Order: {story.order}</Badge>
              </Group>
            </Group>
          </div>

          <div>
            <Text fw={600} size="lg">
              {story.personName}
            </Text>
            {story.personNameHi && (
              <Text
                size="md"
                c="dimmed"
                style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              >
                {story.personNameHi}
              </Text>
            )}
            <Text size="sm" c="dimmed" mt={4}>
              {story.location}
            </Text>
            {story.locationHi && (
              <Text
                size="sm"
                c="dimmed"
                style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              >
                {story.locationHi}
              </Text>
            )}
          </div>

          <div>
            <Title order={3} mb="md">
              Story (English)
            </Title>
            <RichTextContent content={story.content} />
          </div>

          {story.contentHi && (
            <div>
              <Title
                order={3}
                mb="md"
                style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              >
                कहानी (हिंदी)
              </Title>
              <div style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                <RichTextContent content={story.contentHi} />
              </div>
            </div>
          )}

          <Group gap="xs" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
            <Text size="xs" c="dimmed">
              Created: {new Date(story.createdAt).toLocaleDateString()}
            </Text>
            <Text size="xs" c="dimmed">
              •
            </Text>
            <Text size="xs" c="dimmed">
              Updated: {new Date(story.updatedAt).toLocaleDateString()}
            </Text>
            <Text size="xs" c="dimmed">
              •
            </Text>
            <Text size="xs" c="dimmed">
              ID: {story.id}
            </Text>
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}
