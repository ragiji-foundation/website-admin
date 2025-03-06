'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Grid,
  Card,
  Text,
  Group,
  Badge,
  Button,
  Select,
  TextInput,
  Pagination,
  Tabs,
  Image,
  LoadingOverlay,
  Alert,
  MultiSelect,
} from '@mantine/core';
import { IconSearch, IconEdit, IconTrash, IconAlertCircle, IconPhoto } from '@tabler/icons-react';
import { extractFirstImageUrl, stripHtml, truncateText } from '@/utils/contentUtils';

interface Blog {
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
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

function BlogListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeLocale, setActiveLocale] = useState(searchParams?.get('locale') || 'en');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        locale: activeLocale,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(category && { category }),
        ...(status && { status }),
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

      setBlogs(data.blogs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setIsLoading(false);
    }
  }, [activeLocale, category, pagination.page, pagination.limit, search, status]);

  const fetchTaxonomies = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tags')
      ]);

      if (categoriesRes.ok && tagsRes.ok) {
        const categoriesData = await categoriesRes.json();
        const tagsData = await tagsRes.json();

        setCategories(categoriesData);
        setTags(tagsData);
      }
    } catch (error) {
      console.error('Error fetching taxonomies:', error);
    }
  };

  useEffect(() => {
    fetchTaxonomies();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [activeLocale, pagination.page, pagination.limit, category, status, fetchBlogs]);

  const handleEdit = (slug: string) => {
    router.push(`/blogs/${slug}/edit?locale=${activeLocale}`);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const response = await fetch(`/api/blogs/${slug}?locale=${activeLocale}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete blog');

      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  // Function to get thumbnail image for a blog
  const getBlogThumbnail = (blog: Blog): string => {
    // First try to extract image from content
    if (typeof window !== 'undefined') {
      const contentImage = extractFirstImageUrl(blog.content);
      if (contentImage) return contentImage;
    }

    // Fallback to default image
    return '/default-blog-image.jpg';
  };

  return (
    <Container size="xl">
      <LoadingOverlay visible={isLoading} />

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          mb="md"
        >
          {error}
        </Alert>
      )}

      <Group justify="apart" mb="xl">
        <Text size="xl" fw={700}>Blog Posts</Text>
        <Button onClick={() => router.push('/blogs/create')}>Create New Blog</Button>
      </Group>

      <Tabs value={activeLocale} onChange={(value) => setActiveLocale(value || 'en')} mb="md">
        <Tabs.List>
          <Tabs.Tab value="en">English</Tabs.Tab>
          <Tabs.Tab value="hi">Hindi</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Grid mb="md">
        <Grid.Col span={4}>
          <TextInput
            placeholder="Search blogs..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            placeholder="Filter by category"
            value={category}
            onChange={setCategory}
            data={[
              { value: '', label: 'All Categories' },
              ...categories.map(cat => ({
                value: cat.slug,
                label: cat.name
              }))
            ]}
            clearable
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            placeholder="Filter by status"
            value={status}
            onChange={setStatus}
            data={[
              { value: '', label: 'All Status' },
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
              { value: 'archived', label: 'Archived' },
            ]}
            clearable
          />
        </Grid.Col>
      </Grid>

      <MultiSelect
        placeholder="Filter by tags"
        value={selectedTags}
        onChange={setSelectedTags}
        data={tags.map(tag => ({
          value: tag.slug,
          label: tag.name
        }))}
        clearable
        searchable
      />

      <Grid>
        {blogs.map((blog) => (

          <Grid.Col key={blog.id} span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg">
              <Card.Section>
                <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                  <Image
                    src={getBlogThumbnail(blog)}
                    height={160}
                    fallbackSrc="/default-blog-image.jpg"
                    style={{ objectFit: 'cover' }}
                    alt={blog.title}
                    onError={(e) => {
                      // Fallback on error
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-blog-image.jpg';
                    }}
                  />
                  {!extractFirstImageUrl(blog.content) && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.03)'
                      }}
                    >
                      <IconPhoto size={32} stroke={1.5} color="rgba(0,0,0,0.2)" />
                    </div>
                  )}
                </div>
              </Card.Section>

              <Group justify="apart" mt="md" mb="xs">
                <Text fw={500} lineClamp={1}>{blog.title}</Text>
                <Badge color={blog.status === 'published' ? 'green' : 'yellow'}>
                  {blog.status}
                </Badge>
              </Group>

              <Text size="sm" color="dimmed" lineClamp={2}>
                {stripHtml(blog.content)}
              </Text>

              <Group mt="md" gap="xs">
                {blog.tags.map((tag) => (
                  <Badge key={tag.id} variant="light">
                    {tag.name}
                  </Badge>
                ))}
              </Group>

              <Group mt="md" justify="apart">
                <Text size="sm" color="dimmed">
                  By {blog.author.name}
                </Text>
                <Group gap="xs">
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => handleEdit(blog.slug)}
                    leftSection={<IconEdit size={16} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    size="xs"
                    onClick={() => handleDelete(blog.slug)}
                    leftSection={<IconTrash size={16} />}
                  >
                    Delete
                  </Button>
                </Group>
              </Group>
            </Card>
          </Grid.Col>
        ))}
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

export default function BlogListPage() {
  return (
    <Suspense fallback={
      <Container size="xl">
        <LoadingOverlay visible={true} />
      </Container>
    }>
      <BlogListPageContent />
    </Suspense>
  );
}