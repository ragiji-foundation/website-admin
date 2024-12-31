"use client";

import { useState } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import {
  TextInput,
  Stack,
  Button,
  Select,
  MultiSelect,
  Title,
  Grid,
  Paper,
  Group,
  ActionIcon,
  Text,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Editor } from '@/components/Editor';
import { BlogPreview } from '@/components/BlogPreview';

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

interface Blog {
  title: string;
  content: string;
  status: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  category?: { id: number; name: string };
  categoryId?: number;
  tags: Array<{ id: number; name: string }>;
  locale: string;
  authorName?: string;
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default function CreateBlog() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [blog, setBlog] = useState<Blog>({
    title: '',
    content: '',
    status: 'draft',
    metaDescription: '',
    ogTitle: '',
    ogDescription: '',
    tags: [],
    locale: 'en',
    authorName: 'Admin',
    categoryId: undefined,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      setBlog(prev => ({
        ...prev,
        content: editor.getHTML()
      }));
    }
  });

  useState(() => {
    const fetchData = async () => {
      try {
        const baseUrl = getBaseUrl();
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch(`${baseUrl}/api/categories`),
          fetch(`${baseUrl}/api/tags`)
        ]);

        const [categoriesData, tagsData] = await Promise.all([
          categoriesRes.json(),
          tagsRes.json()
        ]);

        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch categories and tags',
          color: 'red'
        });
      }
    };
    fetchData();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const blogData = {
        title: blog.title,
        content: editor?.getHTML() || '',
        status: blog.status,
        metaDescription: blog.metaDescription,
        ogTitle: blog.ogTitle,
        ogDescription: blog.ogDescription,
        categoryId: blog.category?.id,
        locale: blog.locale,
        authorName: 'Admin',
        tags: blog.tags.map(tag => ({ id: tag.id }))
      };

      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create blog');
      }

      notifications.show({
        title: 'Success',
        message: 'Blog created successfully',
        color: 'green'
      });

      router.push('/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create blog',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="w-full px-[5%]">
          <Group justify="space-between" align="center" py="xs">
            <Group>
              <ActionIcon
                variant="subtle"
                onClick={() => router.push('/blogs')}
                size="lg"
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
              <div>
                <Text size="sm" c="dimmed">Creating New</Text>
                <Title order={3}>Blog Post</Title>
              </div>
            </Group>

            <Group>
              <Select
                value={blog.locale}
                onChange={(value) => setBlog({ ...blog, locale: value || 'en' })}
                data={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'Hindi' },
                ]}
              />
              <Button
                variant="light"
                onClick={() => router.push('/blogs')}
              >
                Cancel
              </Button>
              <Button
                loading={loading}
                onClick={handleSubmit}
              >
                Create Blog
              </Button>
            </Group>
          </Group>
        </div>
      </header>

      <div className="w-full px-[5%] py-4">
        <form onSubmit={handleSubmit}>
          <Grid gutter="md">
            <Grid.Col span={7}>
              <Stack gap="md">
                <Paper shadow="sm" p="sm" withBorder>
                  <TextInput
                    label="Title"
                    placeholder="Enter blog title"
                    value={blog.title}
                    onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                    required
                    size="lg"
                  />
                </Paper>

                <Paper shadow="sm" withBorder>
                  <Editor editor={editor} />
                </Paper>

                <Paper shadow="sm" p="sm" withBorder>
                  <Stack gap="md">
                    <Title order={4}>SEO Settings</Title>
                    <TextInput
                      label="Meta Description"
                      placeholder="Enter meta description"
                      value={blog.metaDescription}
                      onChange={(e) => setBlog({ ...blog, metaDescription: e.target.value })}
                    />
                    <TextInput
                      label="OG Title"
                      placeholder="Enter OG title"
                      value={blog.ogTitle}
                      onChange={(e) => setBlog({ ...blog, ogTitle: e.target.value })}
                    />
                    <TextInput
                      label="OG Description"
                      placeholder="Enter OG description"
                      value={blog.ogDescription}
                      onChange={(e) => setBlog({ ...blog, ogDescription: e.target.value })}
                    />
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>

            <Grid.Col span={5}>
              <Stack gap="md">
                <Paper shadow="sm" p="sm" withBorder>
                  <Title order={4} mb="sm">Preview</Title>
                  <BlogPreview
                    title={blog.title}
                    content={blog.content}
                    category={blog.category}
                    tags={blog.tags}
                  />
                </Paper>

                <Paper shadow="sm" p="sm" withBorder>
                  <Stack gap="md">
                    <Title order={4}>Publishing Settings</Title>
                    <Select
                      label="Status"
                      value={blog.status}
                      onChange={(value) => setBlog({ ...blog, status: value || 'draft' })}
                      data={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                        { value: 'archived', label: 'Archived' },
                      ]}
                    />
                    <Select
                      label="Category"
                      value={blog.category?.id.toString()}
                      onChange={(value) => setBlog({
                        ...blog,
                        category: {
                          id: parseInt(value || '0'),
                          name: categories.find((c: Category) => c.id.toString() === value)?.name || ''
                        },
                        categoryId: parseInt(value || '0')
                      })}
                      data={categories.map((cat: Category) => ({
                        value: cat.id.toString(),
                        label: cat.name
                      }))}
                    />
                    <MultiSelect
                      label="Tags"
                      value={blog.tags.map(tag => tag.id.toString())}
                      onChange={(values) => setBlog({
                        ...blog,
                        tags: values.map(v => ({
                          id: parseInt(v),
                          name: tags.find((t: Tag) => t.id.toString() === v)?.name || ''
                        }))
                      })}
                      data={tags.map((tag: Tag) => ({
                        value: tag.id.toString(),
                        label: tag.name,
                        key: `tag-${tag.id}`
                      }))}
                    />
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>
        </form>
      </div>
    </div>
  );
}