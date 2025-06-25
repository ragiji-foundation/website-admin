'use client'

import { useState, useEffect } from 'react';
import { 
  Button, 
  Group, 
  Text, 
  Container, 
  Loader, 
  Alert, 
  Card, 
  Badge, 
  Grid, 
  Title, 
  Stack, 
  TextInput, 
  Select, 
  ActionIcon,
  Pagination,
  Box,
  Paper
} from '@mantine/core';
import { IconEdit, IconEye, IconTrash, IconSearch, IconPlus, IconCalendar, IconUser } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import Link from "next/link";
import { format } from 'date-fns';

interface Blog {
  id: number;
  title: string;
  titleHi?: string;
  excerpt?: string;
  status: string;
  createdAt: string;
  slug: string;
  locale: string;
  authorName: string;
  featuredImage?: string;
  tags?: string[];
}

interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

const statusColors: Record<string, string> = {
  published: 'green',
  draft: 'yellow',
  archived: 'gray',
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 12
  });

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        locale: 'en',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/blogs?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch blogs');

      const data = await response.json();
      
      // Ensure we're getting the right data structure
      console.log('API Response:', data);
      
      // Handle different response formats
      let blogData = [];
      let paginationData = { total: 0, pages: 0, page: 1, limit: 12 };
      
      if (Array.isArray(data)) {
        // If data is directly an array
        blogData = data;
        paginationData.total = data.length;
        paginationData.pages = Math.ceil(data.length / pagination.limit);
      } else if (data.blogs && Array.isArray(data.blogs)) {
        // If data has blogs property
        blogData = data.blogs;
        paginationData = data.pagination || paginationData;
      } else if (data.data && Array.isArray(data.data)) {
        // If data has data property
        blogData = data.data;
        paginationData = data.pagination || paginationData;
      }
      
      setBlogs(blogData);
      setPagination(paginationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch blogs',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [pagination.page, statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (pagination.page === 1) {
        fetchBlogs();
      } else {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const response = await fetch(`/api/blogs/${slug}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete blog');
      
      notifications.show({
        title: 'Success',
        message: 'Blog deleted successfully',
        color: 'green'
      });
      
      fetchBlogs();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete blog';
      setError(errorMessage);
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red'
      });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) return (
    <Container size="xl" py="xl">
      <Stack align="center" gap="md">
        <Loader size="lg" />
        <Text c="dimmed">Loading blogs...</Text>
      </Stack>
    </Container>
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Title order={1}>Blog Management</Title>
            <Text c="dimmed" size="lg">
              Manage your blog posts and content
            </Text>
          </Stack>
          <Button 
            component={Link} 
            href="/blogs/new"
            leftSection={<IconPlus size={16} />}
            size="md"
          >
            Create New Blog
          </Button>
        </Group>

        {/* Filters */}
        <Paper shadow="xs" p="md" withBorder>
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <TextInput
                placeholder="Search blogs by title..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                placeholder="Filter by status"
                data={[
                  { value: 'all', label: 'All Status' },
                  { value: 'published', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' }
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value || 'all')}
                size="md"
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert color="red" title="Error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Blog Stats */}
        <Group>
          <Badge variant="light" size="lg">
            Total: {pagination.total} blogs
          </Badge>
          {pagination.total > 0 && (
            <Badge variant="outline" size="lg">
              Page {pagination.page} of {pagination.pages}
            </Badge>
          )}
        </Group>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          <Paper shadow="xs" p="xl" withBorder>
            <Stack align="center" gap="md">
              <Text size="xl" c="dimmed">No blogs found</Text>
              <Text c="dimmed">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first blog post'
                }
              </Text>
              {!searchQuery && statusFilter === 'all' && (
                <Button component={Link} href="/blogs/new" leftSection={<IconPlus size={16} />}>
                  Create Your First Blog
                </Button>
              )}
            </Stack>
          </Paper>
        ) : (
          <Grid>
            {blogs.map((blog) => (
              <Grid.Col key={blog.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                  <Stack gap="md" h="100%">
                    {/* Featured Image */}
                    {blog.featuredImage ? (
                      <Card.Section>
                        <Box
                          style={{
                            backgroundImage: `url(${blog.featuredImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            height: 160,
                            backgroundColor: '#f8f9fa'
                          }}
                        />
                      </Card.Section>
                    ) : (
                      <Card.Section>
                        <Box
                          style={{
                            backgroundColor: '#f1f3f4',
                            height: 160,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#6c757d'
                          }}
                        >
                          <Text size="sm">No image</Text>
                        </Box>
                      </Card.Section>
                    )}

                    {/* Content */}
                    <Stack gap="xs" style={{ flex: 1 }}>
                      <Group justify="space-between" align="flex-start">
                        <Badge 
                          color={statusColors[blog.status] || 'blue'} 
                          variant="light"
                          size="sm"
                        >
                          {blog.status}
                        </Badge>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            component={Link}
                            href={`/blogs/${blog.slug}/edit`}
                            size="sm"
                          >
                            <IconEdit size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            component={Link}
                            href={`/blogs/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="sm"
                          >
                            <IconEye size={14} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDelete(blog.slug, blog.title)}
                            size="sm"
                          >
                            <IconTrash size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>

                      <Title order={4} lineClamp={2}>
                        {blog.title}
                      </Title>

                      {blog.titleHi && (
                        <Text 
                          size="sm" 
                          c="dimmed" 
                          lineClamp={1}
                          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                        >
                          {blog.titleHi}
                        </Text>
                      )}

                      {blog.excerpt && (
                        <Text size="sm" c="dimmed" lineClamp={3}>
                          {truncateText(blog.excerpt, 120)}
                        </Text>
                      )}

                      {/* Tags */}
                      {blog.tags && blog.tags.length > 0 && (
                        <Group gap="xs">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" size="xs">
                              {tag}
                            </Badge>
                          ))}
                          {blog.tags.length > 3 && (
                            <Badge variant="outline" size="xs" c="dimmed">
                              +{blog.tags.length - 3} more
                            </Badge>
                          )}
                        </Group>
                      )}
                    </Stack>

                    {/* Footer */}
                    <Stack gap="xs" mt="auto">
                      <Group justify="space-between" gap="xs">
                        <Group gap="xs">
                          <IconUser size={14} />
                          <Text size="xs" c="dimmed">
                            {blog.authorName}
                          </Text>
                        </Group>
                        <Group gap="xs">
                          <IconCalendar size={14} />
                          <Text size="xs" c="dimmed">
                            {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
                          </Text>
                        </Group>
                      </Group>
                    </Stack>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Group justify="center">
            <Pagination
              value={pagination.page}
              onChange={(page) => setPagination(prev => ({ ...prev, page }))}
              total={pagination.pages}
              size="md"
              withEdges
            />
          </Group>
        )}
      </Stack>
    </Container>
  );
}
