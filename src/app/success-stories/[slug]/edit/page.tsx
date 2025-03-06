'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Title, Text, Box, Loader, Center } from '@mantine/core';
import { SuccessStoryForm } from '@/components/SuccessStories/SuccessStoryForm';
import { notifications } from '@mantine/notifications';

interface SuccessStory {
  id: string;
  slug: string;
  title: string;
  content: any;
  featured: boolean;
  imageUrl: string;
  personName: string;
  location: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function EditSuccessStoryPage() {
  const params = useParams();
  const router = useRouter();
  const [successStory, setSuccessStory] = useState<SuccessStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuccessStory = async () => {
      if (!params?.slug) {
        setError('No slug provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
        const response = await fetch(
          `/api/success-stories/${slug}`,
          {
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Success story not found');
          }
          throw new Error('Failed to fetch success story');
        }

        const data = await response.json();
        setSuccessStory(data);
      } catch (err) {
        console.error('Error loading success story:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');

        notifications.show({
          title: "Error",
          message: err instanceof Error ? err.message : 'Failed to load success story',
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSuccessStory();
  }, [params?.slug]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={300}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (error || !successStory) {
    return (
      <Container size="xl" py="xl">
        <Box mb="lg">
          <Title order={1}>Error</Title>
          <Text c="red">{error || 'Success story not found'}</Text>
          <Box mt="md">
            <Text
              component="a"
              onClick={() => router.push('/success-stories')}
              c="blue"
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              Return to success stories
            </Text>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Box mb="lg">
        <Title order={1}>Edit Success Story</Title>
        <Text c="dimmed">Update the details of your success story</Text>
      </Box>

      <Box>
        <SuccessStoryForm initialData={successStory} isEditing={true} />
      </Box>
    </Container>
  );
}