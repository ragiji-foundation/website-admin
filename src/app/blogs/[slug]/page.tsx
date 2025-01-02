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
} from '@mantine/core';
import { IconEdit, IconCalendar, IconUser, IconAlertCircle } from '@tabler/icons-react';
import { format } from 'date-fns';

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface BlogPost {
  id: number;
  title: string;
  content: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  tags: Tag[];
  status: string;
  author: {
    name: string;
    image: string | null;
  };
  createdAt: string;
}

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const [activeLocale, setActiveLocale] = useState(searchParams?.get('locale') || 'en');
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/blogs/${params.slug}?locale=${activeLocale}`);

        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
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
  }, [params.slug, activeLocale]);

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
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Tabs value={activeLocale} onChange={(value) => setActiveLocale(value || 'en')} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="en">English</Tabs.Tab>
          <Tabs.Tab value="hi">Hindi</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Paper shadow="xs" p="md" mb="xl">
        <Stack gap="md">
          {blog.author.image && (
            <Image
              src={blog.author.image}
              height={300}
              alt={blog.title}
              fallbackSrc="/default-blog-image.jpg"
            />
          )}

          <Group justify="space-between">
            <Title order={1}>{blog.title}</Title>
            <Button
              variant="light"
              leftSection={<IconEdit size={16} />}
              onClick={() => router.push(`/blogs/${params.slug}/edit?locale=${activeLocale}`)}
            >
              Edit
            </Button>
          </Group>

          {blog.tags && blog.tags.length > 0 && (
            <Group gap="xs">
              {blog.tags.map((tag) => (
                <Badge key={tag.id} variant="light">
                  {tag.name}
                </Badge>
              ))}
            </Group>
          )}

          {blog.category && (
            <Badge color="blue" size="lg">
              {blog.category.name}
            </Badge>
          )}

          <Group gap="lg">
            <Group gap="xs">
              <Avatar
                src={blog.author.image}
                radius="xl"
                alt={blog.author.name}
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

          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </Stack>
      </Paper>

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
          background: var(--mantine-color-dark-8);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
        }

        .blog-content code {
          background: var(--mantine-color-dark-8);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.9em;
        }
      `}</style>
    </Container>
  );
}