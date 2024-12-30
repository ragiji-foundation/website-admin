'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Group,
  Badge,
  Button,
  TextInput,
  Select,
  Pagination,
  Image,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { IconSearch, IconEdit, IconEye, IconTrash } from '@tabler/icons-react';

interface Draft {
  id: number;
  title: string;
  content: string;
  slug: string;
  status: string;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  author: {
    name: string;
    image: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

function DraftsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeLocale, _setActiveLocale] = useState(searchParams.get('locale') || 'en');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });

  const fetchDrafts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        locale: activeLocale,
        status: 'draft',
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(category && { category }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/blogs?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setDrafts(data.blogs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching drafts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
    } finally {
      setIsLoading(false);
    }
  }, [activeLocale, category, pagination.page, pagination.limit, search]);

  useEffect(() => {
    fetchDrafts();
  }, [activeLocale, pagination.page, category, search, fetchDrafts]);

  const handleEdit = (slug: string) => {
    router.push(`/blogs/${slug}/edit?locale=${activeLocale}`);
  };

  const handleView = (slug: string) => {
    router.push(`/blogs/${slug}?locale=${activeLocale}`);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;

    try {
      const response = await fetch(`/api/blogs/${slug}?locale=${activeLocale}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete draft');

      fetchDrafts();
    } catch (error) {
      console.error('Error deleting draft:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete draft');
    }
  };

  return (
    <Container size="xl">
      <LoadingOverlay visible={isLoading} />

      {error && (
        <Alert
          icon={<IconSearch size={16} />}
          title="Error"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}

      <Group justify="space-between" mb="xl">
        <Title order={1}>Blog Drafts</Title>
        <Button onClick={() => router.push('/blogs/create')}>
          Create New Blog
        </Button>
      </Group>

      <Grid mb="md">
        <Grid.Col span={8}>
          <TextInput
            placeholder="Search drafts..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            placeholder="Filter by category"
            value={category}
            onChange={setCategory}
            data={[
              { value: '', label: 'All Categories' },
              { value: 'technology', label: 'Technology' },
              { value: 'lifestyle', label: 'Lifestyle' },
              { value: 'health', label: 'Health' },
            ]}
            clearable
          />
        </Grid.Col>
      </Grid>

      <Grid>
        {drafts.length > 0 ? (
          drafts.map((draft) => (
            <Grid.Col key={draft.id} span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg">
                <Card.Section>
                  <Image
                    src={draft.author.image || '/default-blog-image.jpg'}
                    height={160}
                    alt={draft.title}
                  />
                </Card.Section>

                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={500}>{draft.title}</Text>
                  <Badge color="yellow">Draft</Badge>
                </Group>

                <Text size="sm" c="dimmed" lineClamp={2}>
                  {draft.content.replace(/<[^>]*>/g, '')}
                </Text>

                <Group mt="md" gap="xs">
                  {draft.tags.map((tag) => (
                    <Badge key={tag.id} variant="light">
                      {tag.name}
                    </Badge>
                  ))}
                </Group>

                <Group mt="md" justify="space-between">
                  <Text size="sm" c="dimmed">
                    By {draft.author.name}
                  </Text>
                  <Group gap="xs">
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => handleView(draft.slug)}
                      leftSection={<IconEye size={16} />}
                    >
                      View
                    </Button>
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => handleEdit(draft.slug)}
                      leftSection={<IconEdit size={16} />}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="light"
                      color="red"
                      size="xs"
                      onClick={() => handleDelete(draft.slug)}
                      leftSection={<IconTrash size={16} />}
                    >
                      Delete
                    </Button>
                  </Group>
                </Group>
              </Card>
            </Grid.Col>
          ))
        ) : (
          <Grid.Col>
            <Text ta="center" fz="lg" fw={500} c="dimmed">
              No drafts found
            </Text>
          </Grid.Col>
        )}
      </Grid>

      {pagination.pages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            total={pagination.pages}
            value={pagination.page}
            onChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </Group>
      )}
    </Container>
  );
}

export default function DraftsPage() {
  return (
    <Suspense fallback={
      <Container size="xl">
        <LoadingOverlay visible={true} />
      </Container>
    }>
      <DraftsPageContent />
    </Suspense>
  );
}
