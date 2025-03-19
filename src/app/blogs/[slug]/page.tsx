'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Text,
  Group,
  Badge,
  Image,
  Stack,
  Button,
  Tabs,
  Paper,
  Avatar,
  LoadingOverlay,
  Alert,
  Divider,
  Box,
  ActionIcon,
} from '@mantine/core';
import { IconEdit, IconCalendar, IconUser, IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { format } from 'date-fns';
import DOMPurify from 'isomorphic-dompurify';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface BlogPost {
  id: number;
  slug: string;
  locale: string;
  title: string;
  content: string;
  status: string;
  authorName: string;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  authorId: number;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    image: string | null;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags: Tag[];
}

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const locale = searchParams?.get('locale') || 'en';
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/blogs/${params.slug}?locale=${locale}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch blog post (${response.status})`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setBlog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug, locale]);

  const switchLocale = (newLocale: string) => {
    router.push(`/blogs/${params.slug}?locale=${newLocale}`);
  };

  const sanitizedContent = blog?.content ? DOMPurify.sanitize(blog.content) : '';

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (error || !blog) {
    return (
      <Container size="md" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
        >
          {error || 'Blog post not found'}
        </Alert>
        <Button
          leftSection={<IconArrowLeft size={16} />}
          variant="subtle"
          mt="md"
          onClick={() => router.push('/blogs')}
        >
          Return to blog list
        </Button>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Group mb="xl" justify="space-between">
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => router.push('/blogs')}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>

        <Tabs value={locale} onChange={(value) => switchLocale(value || 'en')}>
          <Tabs.List>
            <Tabs.Tab value="en">English</Tabs.Tab>
            <Tabs.Tab value="hi">Hindi</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Group>

      <Paper shadow="xs" p="lg" mb="xl" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={1}>{blog.title}</Title>
            <Button
              variant="light"
              leftSection={<IconEdit size={16} />}
              onClick={() => router.push(`/blogs/${params.slug}/edit?locale=${locale}`)}
            >
              Edit
            </Button>
          </Group>

          <Group mt="md" mb="lg">
            <Group gap="xs">
              <Avatar
                src={blog.author.image}
                radius="xl"
                alt={blog.author.name}
                size="sm"
              />
              <Text size="sm" c="dimmed">
                <IconUser size={14} style={{ display: 'inline', marginRight: 4 }} />
                {blog.author.name}
              </Text>
            </Group>

            <Text size="sm" c="dimmed">
              <IconCalendar size={14} style={{ display: 'inline', marginRight: 4 }} />
              {format(new Date(blog.createdAt), 'MMMM dd, yyyy')}
            </Text>

            <Badge color={blog.status === 'published' ? 'green' : 'yellow'}>
              {blog.status}
            </Badge>
          </Group>

          {blog.category && (
            <Badge color="blue" size="lg">
              {blog.category.name}
            </Badge>
          )}

          {blog.tags && blog.tags.length > 0 && (
            <Group gap="xs">
              {blog.tags.map((tag) => (
                <Badge key={tag.id} variant="light">
                  {tag.name}
                </Badge>
              ))}
            </Group>
          )}

          <Divider my="md" />

          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </Stack>
      </Paper>

      <Box mb="xl">
        <Title order={4}>SEO Information</Title>
        <Paper p="md" withBorder mt="sm">
          <Stack>
            <Group>
              <Text fw={600}>Meta Description:</Text>
              <Text>{blog.metaDescription || 'Not set'}</Text>
            </Group>
            <Group>
              <Text fw={600}>OG Title:</Text>
              <Text>{blog.ogTitle || 'Not set'}</Text>
            </Group>
            <Group>
              <Text fw={600}>OG Description:</Text>
              <Text>{blog.ogDescription || 'Not set'}</Text>
            </Group>
          </Stack>
        </Paper>
      </Box>

      <style jsx global>{`
        .blog-content {
          font-size: 1.1rem;
          line-height: 1.7;
        }

        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4 {
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .blog-content p {
          margin-bottom: 1.5rem;
        }

        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 2rem 0;
        }

        .blog-content blockquote {
          border-left: 4px solid var(--mantine-color-blue-6);
          margin: 2rem 0;
          padding: 1rem 2rem;
          background: var(--mantine-color-gray-0);
          font-style: italic;
        }

        .blog-content pre {
          background: var(--mantine-color-gray-1);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
        }

        .blog-content code {
          background: var(--mantine-color-gray-1);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.9em;
        }
        
        .blog-content ul, 
        .blog-content ol {
          margin-left: 2rem;
          margin-bottom: 1.5rem;
        }
        
        .blog-content li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Container>
  );
}