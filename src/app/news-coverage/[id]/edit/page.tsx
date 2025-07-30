'use client';

import { useCallback } from 'react';
import { Container, Title, Text, Box, LoadingOverlay } from '@mantine/core';
import { useRouter, useParams } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import NewsArticleForm from '@/components/NewsArticleForm';

interface NewsArticleFormData {
  title: string;
  titleHi?: string;
  source: string;
  date: string;
  imageUrl?: string;
  link?: string;
  description?: string;
  descriptionHi?: string;
}

interface NewsArticleData {
  id: number;
  title: string;
  titleHi?: string;
  source: string;
  date: string;
  imageUrl?: string;
  link?: string;
  description?: string;
  descriptionHi?: string;
}

export default function EditNewsArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id ?? '') as string;

  // Fetch article data using centralized hook
  const { data: apiResponse, loading, error } = useApiData<any>(
    `/api/news-coverage/${id}`,
    null,
    { 
      showNotifications: true,
      onError: () => router.push('/news-coverage')
    }
  );

  // Extract the article data from the API response structure
  const article: NewsArticleData | null = apiResponse?.success 
    ? apiResponse.data 
    : apiResponse;

  // CRUD operations using centralized hook
  const { update, loading: updateLoading } = useCrudOperations<NewsArticleData>('/api/news-coverage', {
    showNotifications: true,
    onSuccess: () => router.push('/news-coverage')
  });

  const handleSubmit = useCallback(async (data: NewsArticleFormData) => {
    if (!article?.id) {
      notifications.show({
        title: 'Error',
        message: 'Article ID not found',
        color: 'red',
      });
      return;
    }

    try {
      // Format the data for API submission
      const payload = {
        ...data,
        date: new Date(data.date).toISOString()
      };
      await update(article.id, payload);
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    }
  }, [article?.id, update]);

  const handleCancel = useCallback(() => {
    router.push('/news-coverage');
  }, [router]);

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container size="xl" py="xl">
        <Title order={1}>Article Not Found</Title>
        <Text c="dimmed">The requested news article could not be found.</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Box mb="lg">
        <Title order={1}>Edit News Article</Title>
        <Text c="dimmed">
          Update the news article details and content
        </Text>
      </Box>

      <Box>
        <NewsArticleForm
          initialData={article}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updateLoading}
        />
      </Box>
    </Container>
  );
}
