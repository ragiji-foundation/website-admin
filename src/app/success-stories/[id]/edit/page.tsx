'use client';
import { useCallback } from 'react';
import { Container, Title, Text, Box, LoadingOverlay } from '@mantine/core';
import { SuccessStoryForm } from '@/components/SuccessStories/SuccessStoryFormUpdated';
import { useRouter, useParams } from 'next/navigation';
import { notifications } from '@mantine/notifications';

// ✅ MIGRATED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

type Json = Record<string, unknown>;

interface SuccessStoryFormData {
  slug: string;
  title: string;
  titleHi?: string;
  content: string;
  contentHi?: string;
  personName: string;
  personNameHi?: string;
  location: string;
  locationHi?: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
}

interface SuccessStoryData {
  id: string;
  slug: string;
  title: string;
  titleHi?: string;
  content: string;
  contentHi?: string;
  personName: string;
  personNameHi?: string;
  location: string;
  locationHi?: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
}

export default function EditSuccessStoryPage() {
  const router = useRouter();
  const params = useParams();
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
  const story: SuccessStoryData | null = apiResponse?.success 
    ? apiResponse.data 
    : apiResponse;

  // ✅ MIGRATED: Using centralized CRUD operations
  const { update, loading: updateLoading } = useCrudOperations<SuccessStoryData>('/api/success-stories', {
    showNotifications: true,
    onSuccess: () => router.push('/success-stories')
  });

  const handleSubmit = useCallback(async (data: SuccessStoryFormData) => {
    if (!story?.id) {
      notifications.show({
        title: 'Error',
        message: 'Story ID not found',
        color: 'red',
      });
      return;
    }

    try {
      // Merge the id from the loaded story into the form data
      const payload = { ...data, id: story.id };
      await update(story.id, payload);
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    }
  }, [story?.id, update]);

  const handleCancel = useCallback(() => {
    router.push('/success-stories');
  }, [router]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error || !story) {
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
          loading={updateLoading}
        />
      </Box>
    </Container>
  );
}