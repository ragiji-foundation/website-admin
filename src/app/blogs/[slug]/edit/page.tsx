'use client';

import { useEffect, useState } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { useParams, useRouter } from 'next/navigation';
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
import { IconArrowLeft, IconClock, IconCalendar } from '@tabler/icons-react';
import { Editor } from '@/components/Editor/index';
import { BlogPreview } from '@/components/BlogPreview';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';

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
  id: number;
  title: string;
  content: string;
  status: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  category: { id: number; name: string };
  categoryId?: number;
  tags: Array<{ id: number; name: string }>;
  locale: string;
  authorName?: string;
}

export default function EditBlog() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

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
      if (blog) {
        setBlog(prev => ({
          ...prev!,
          content: editor.getHTML()
        }));
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogRes, categoriesRes, tagsRes] = await Promise.all([
          fetch(`/api/blogs/${params.slug}?locale=en`),
          fetch('/api/categories'),
          fetch('/api/tags')
        ]);

        const [blogData, categoriesData, tagsData] = await Promise.all([
          blogRes.json(),
          categoriesRes.json(),
          tagsRes.json()
        ]);

        setBlog(blogData);
        setCategories(categoriesData);
        setTags(tagsData);
        editor?.commands.setContent(blogData.content);
      } catch (error) {
        console.error('Error fetching data:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch data',
          color: 'red'
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchData();
    }
  }, [params.slug, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const blogData = {
        title: blog?.title,
        content: editor?.getHTML() || '',
        status: blog?.status,
        metaDescription: blog?.metaDescription,
        ogTitle: blog?.ogTitle,
        ogDescription: blog?.ogDescription,
        categoryId: blog?.category?.id,
        locale: blog?.locale || 'en',
        authorName: blog?.authorName || 'Admin',
        tags: blog?.tags.map(tag => ({ id: tag.id }))
      };

      const response = await fetch(`/api/blogs/${params.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update blog');
      }

      notifications.show({
        title: 'Success',
        message: 'Blog updated successfully',
        color: 'green'
      });

      router.push('/blogs');
    } catch (error) {
      console.error('Error updating blog:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update blog',
        color: 'red'
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!blog) return <div>Blog not found</div>;

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
                <Text size="sm" c="dimmed">Editing</Text>
                <Title order={3}>{blog?.title || 'Loading...'}</Title>
              </div>
            </Group>

            <Group>
              <Group gap="xs">
                <IconClock size={16} />
                <Text size="sm">Last modified: {new Date().toLocaleDateString()}</Text>
              </Group>
              <Group gap="xs">
                <IconCalendar size={16} />
                <Text size="sm">Created: {new Date().toLocaleDateString()}</Text>
              </Group>
              <Button
                variant="light"
                onClick={() => router.push(`/blogs/${params.slug}`)}
              >
                Preview
              </Button>
              <Button type="submit">Publish Changes</Button>
            </Group>
          </Group>
        </div>
      </header>

      <div className="w-full px-[5%] py-4">
        <form onSubmit={handleSubmit}>
          <Grid gutter="md">
            <Grid.Col span={7} p="xs">
              <Stack gap="md">
                <Paper shadow="sm" p="sm" withBorder>
                  <TextInput
                    label="Title"
                    placeholder="Enter blog title"
                    value={blog?.title}
                    onChange={(e) => setBlog({ ...blog!, title: e.target.value })}
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
                      value={blog?.metaDescription}
                      onChange={(e) => setBlog({ ...blog!, metaDescription: e.target.value })}
                    />
                    <TextInput
                      label="OG Title"
                      placeholder="Enter OG title"
                      value={blog?.ogTitle}
                      onChange={(e) => setBlog({ ...blog!, ogTitle: e.target.value })}
                    />
                    <TextInput
                      label="OG Description"
                      placeholder="Enter OG description"
                      value={blog?.ogDescription}
                      onChange={(e) => setBlog({ ...blog!, ogDescription: e.target.value })}
                    />
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>

            <Grid.Col span={5} p="xs">
              <Stack gap="md">
                <Paper shadow="sm" p="sm" withBorder>
                  <Title order={4} mb="sm">Preview</Title>
                  <BlogPreview
                    title={blog?.title || ''}
                    content={blog?.content || ''}
                    category={blog?.category}
                    tags={blog?.tags}
                  />
                </Paper>

                <Paper shadow="sm" p="sm" withBorder>
                  <Stack gap="md">
                    <Title order={4}>Publishing Settings</Title>
                    <Select
                      label="Status"
                      value={blog?.status}
                      onChange={(value) => setBlog({ ...blog!, status: value || 'draft' })}
                      data={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                        { value: 'archived', label: 'Archived' },
                      ]}
                    />
                    <Select
                      label="Category"
                      value={blog?.category?.id.toString()}
                      onChange={(value) => setBlog({
                        ...blog!,
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
                      value={blog?.tags.map(tag => tag.id.toString())}
                      onChange={(values) => setBlog({
                        ...blog!,
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