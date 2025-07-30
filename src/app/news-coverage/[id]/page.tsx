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
  Paper,
  Divider,
} from '@mantine/core';
import { IconArrowLeft, IconEdit, IconExternalLink, IconExclamationCircle, IconCalendar, IconNews } from '@tabler/icons-react';
import Link from 'next/link';
import { useApiData } from '@/hooks/useApiData';

interface NewsArticle {
  id: number;
  title: string;
  titleHi?: string;
  source: string;
  date: string;
  imageUrl?: string;
  link?: string;
  description?: string;
  descriptionHi?: string;
  createdAt: string;
  updatedAt: string;
}

export default function NewsArticleViewPage() {
  const params = useParams();
  const router = useRouter();
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
  const article: NewsArticle | null = apiResponse?.success 
    ? apiResponse.data 
    : apiResponse;

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconExclamationCircle size={16} />} color="red" variant="light">
          {typeof error === 'string' ? error : 'News article not found'}
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTranslationStatus = (article: NewsArticle) => {
    const hasHindi = article.titleHi && (article.description ? article.descriptionHi : true);
    return hasHindi ? 'complete' : 'partial';
  };

  return (
    <Container size="lg" py="xl">
      {/* Header Navigation */}
      <Group justify="space-between" mb="xl">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.back()}
        >
          Back to News Coverage
        </Button>
        <Group gap="sm">
          {article.link && (
            <Button
              variant="light"
              color="blue"
              leftSection={<IconExternalLink size={16} />}
              component="a"
              href={article.link}
              target="_blank"
            >
              Read Original
            </Button>
          )}
          <Link href={`/news-coverage/${article.id}/edit`}>
            <Button leftSection={<IconEdit size={16} />}>
              Edit Article
            </Button>
          </Link>
        </Group>
      </Group>

      {/* Main Content Card */}
      <Card shadow="sm" padding="xl" radius="lg" withBorder>
        {/* Article Image */}
        {article.imageUrl && (
          <Card.Section mb="lg">
            <Image
              src={article.imageUrl}
              height={400}
              alt={article.title}
              fallbackSrc="/placeholder-news.jpg"
            />
          </Card.Section>
        )}

        <Stack gap="lg">
          {/* Article Header */}
          <div>
            <Group justify="space-between" align="flex-start" mb="sm">
              <div style={{ flex: 1 }}>
                <Title order={1} mb="xs">
                  {article.title}
                </Title>
                {article.titleHi && (
                  <Title
                    order={2}
                    c="dimmed"
                    fw={400}
                    style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                  >
                    {article.titleHi}
                  </Title>
                )}
              </div>
              <Badge color="blue" size="lg" variant="light">
                {article.source}
              </Badge>
            </Group>

            {/* Article Meta */}
            <Group gap="md" mb="lg">
              <Group gap="xs">
                <IconCalendar size={16} color="var(--mantine-color-dimmed)" />
                <Text size="sm" c="dimmed">
                  Published: {formatDate(article.date)}
                </Text>
              </Group>
              <Group gap="xs">
                <IconNews size={16} color="var(--mantine-color-dimmed)" />
                <Text size="sm" c="dimmed">
                  Source: {article.source}
                </Text>
              </Group>
            </Group>
          </div>

          <Divider />

          {/* Article Content */}
          {article.description && (
            <Paper withBorder p="md" radius="md">
              <Title order={3} mb="md">
                Description (English)
              </Title>
              <Text size="md" style={{ lineHeight: 1.6 }}>
                {article.description}
              </Text>
            </Paper>
          )}

          {article.descriptionHi && (
            <Paper withBorder p="md" radius="md">
              <Title
                order={3}
                mb="md"
                style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              >
                विवरण (हिंदी)
              </Title>
              <Text 
                size="md" 
                style={{ 
                  lineHeight: 1.6, 
                  fontFamily: 'Noto Sans Devanagari, sans-serif' 
                }}
              >
                {article.descriptionHi}
              </Text>
            </Paper>
          )}

          {/* Article Stats */}
          <Paper withBorder p="md" radius="md" bg="gray.0">
            <Title order={4} mb="md">
              Article Information
            </Title>
            <Group gap="md">
              <Group gap="xs">
                <Text size="sm" fw={500}>Translation Status:</Text>
                <Badge 
                  color={getTranslationStatus(article) === 'complete' ? 'green' : 'orange'}
                  size="sm"
                >
                  {getTranslationStatus(article) === 'complete' ? 'Complete' : 'Partial'}
                </Badge>
              </Group>
              <Group gap="xs">
                <Text size="sm" fw={500}>Media:</Text>
                <Badge 
                  color={article.imageUrl ? 'green' : 'gray'}
                  size="sm"
                >
                  {article.imageUrl ? 'Image Available' : 'No Image'}
                </Badge>
              </Group>
              <Group gap="xs">
                <Text size="sm" fw={500}>External Link:</Text>
                <Badge 
                  color={article.link ? 'green' : 'gray'}
                  size="sm"
                >
                  {article.link ? 'Available' : 'Not Available'}
                </Badge>
              </Group>
            </Group>
          </Paper>

          {/* Metadata Footer */}
          <Group gap="xs" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
            <Text size="xs" c="dimmed">
              Created: {new Date(article.createdAt).toLocaleDateString()}
            </Text>
            <Text size="xs" c="dimmed">•</Text>
            <Text size="xs" c="dimmed">
              Updated: {new Date(article.updatedAt || article.createdAt).toLocaleDateString()}
            </Text>
            <Text size="xs" c="dimmed">•</Text>
            <Text size="xs" c="dimmed">
              ID: {article.id}
            </Text>
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}
