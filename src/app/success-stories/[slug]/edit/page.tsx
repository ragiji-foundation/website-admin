'use client';
import { useState, useEffect } from 'react';
import { Container, Title, Text, Box, LoadingOverlay } from '@mantine/core';
import { SuccessStoryForm } from '@/components/SuccessStories/SuccessStoryFormUpdated';
import { useRouter, useParams } from 'next/navigation';
import { notifications } from '@mantine/notifications';

interface SuccessStoryData {
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
}

export default function EditSuccessStoryPage() {
  const [story, setStory] = useState<SuccessStoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const slug = (params?.slug ?? '') as string;

  useEffect(() => {
    if (slug) {
      fetchStory();
    }
  }, [slug]);

  const fetchStory = async () => {
    try {
      const response = await fetch(`/api/success-stories/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch story');
      const data = await response.json();
      setStory(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch success story',
        color: 'red',
      });
      router.push('/success-stories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      // Merge the id from the loaded story into the form data
      const payload = { ...data, id: story?.id };

      const response = await fetch(`/api/success-stories/${story?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update success story');
      }

      notifications.show({
        title: 'Success',
        message: 'Success story updated successfully',
        color: 'green',
      });

      router.push('/success-stories');
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    }
  };

  const handleCancel = () => {
    router.push('/success-stories');
  };

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (!story) {
    return (
      <Container size="xl" py="xl">
        <Title order={1}>Story Not Found</Title>
        <Text c="dimmed">The requested success story could not be found.</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Box mb="lg">
        <Title order={1}>Edit Success Story</Title>
        <Text c="dimmed">
          Update the success story details and content
        </Text>
      </Box>

      <Box>
        <SuccessStoryForm
          initialData={story}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Box>
    </Container>
  );
}