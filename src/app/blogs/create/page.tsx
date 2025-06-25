"use client";

import { useState, useEffect } from 'react';
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
// Fix the import path to use the correct component
import TiptapEditor from '@/components/TiptapEditor';
import { RichTextContent } from '@/components/RichTextContent';

import {
  Button,
  Group,
  Grid,
  Paper,
  Stack,
  Text,
  Title,
  TextInput,
  Select,
  MultiSelect,
  Badge,
  Divider,
  ScrollArea,
  ActionIcon,
} from '@mantine/core';
import { IconArrowLeft, IconEye, IconEyeOff } from '@tabler/icons-react';


interface Author {
  id: number;
  name: string;
  email: string;
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

interface Blog {
  title: string;
  titleHi?: string;
  content: string;
  contentHi?: string;
  status: string;
  authorId?: number;
  authorName: string;
  authorNameHi?: string;
  metaDescription: string;
  metaDescriptionHi?: string;
  ogTitle: string;
  ogTitleHi?: string;
  ogDescription: string;
  ogDescriptionHi?: string;
  categoryId?: number | null;
  category?: { id: number; name: string };
  locale: string;
  tags: Array<{ id: number; name: string }>;
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
  const [authors, setAuthors] = useState<Author[]>([]);
  const [blog, setBlog] = useState<Blog>({
    title: '',
    titleHi: '',
    content: '',
    contentHi: '',
    status: 'draft',
    metaDescription: '',
    metaDescriptionHi: '',
    ogTitle: '',
    ogTitleHi: '',
    ogDescription: '',
    ogDescriptionHi: '',
    tags: [],
    locale: 'en',
    authorId: undefined,
    authorName: 'Admin',
    authorNameHi: '',
    categoryId: undefined,
  });
  const [showPreview, setShowPreview] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = getBaseUrl();
        const [categoriesRes, tagsRes, authorsRes] = await Promise.all([
          fetch(`${baseUrl}/api/categories`),
          fetch(`${baseUrl}/api/tags`),
          fetch(`${baseUrl}/api/authors`)
        ]);

        const [categoriesData, tagsData, authorsData] = await Promise.all([
          categoriesRes.json(),
          tagsRes.json(),
          authorsRes.json()
        ]);

        setCategories(categoriesData);
        setTags(tagsData);
        setAuthors(authorsData);
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!blog.title.trim()) {
        notifications.show({
          title: 'Validation Error',
          message: 'Blog title is required',
          color: 'red'
        });
        setLoading(false);
        return;
      }

      if (!blog.content.trim() && !editor?.getHTML()) {
        notifications.show({
          title: 'Validation Error',
          message: 'Blog content is required',
          color: 'red'
        });
        setLoading(false);
        return;
      }

      const blogData = {
        title: blog.title,
        titleHi: blog.titleHi || null,
        content: editor?.getHTML() || blog.content,
        contentHi: blog.contentHi || null,
        status: blog.status,
        authorId: blog.authorId || 1, // Default to admin if no author selected
        authorName: blog.authorName || 'Admin',
        authorNameHi: blog.authorNameHi || null,
        metaDescription: blog.metaDescription,
        metaDescriptionHi: blog.metaDescriptionHi || null,
        ogTitle: blog.ogTitle || blog.title,
        ogTitleHi: blog.ogTitleHi || blog.titleHi,
        ogDescription: blog.ogDescription || blog.metaDescription,
        ogDescriptionHi: blog.ogDescriptionHi || blog.metaDescriptionHi,
        categoryId: blog.categoryId,
        locale: blog.locale,
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
        throw new Error(error.error || error.message || 'Failed to create blog');
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
        message: error instanceof Error ? error.message : 'Failed to create blog. Please try again.',
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
              <Button
                variant={showPreview ? "filled" : "light"}
                leftSection={showPreview ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>

              <Select
                value={blog.locale}
                onChange={(value) => {
                  setBlog({ ...blog, locale: value || 'en' });
                  // Update URL to reflect locale change
                  const url = new URL(window.location.href);
                  url.searchParams.set('locale', value || 'en');
                  window.history.replaceState({}, '', url.toString());
                }}
                data={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'Hindi' },
                ]}
                size="md"
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
            {/* Expanded Editor Column - Adjust width based on preview state */}
            <Grid.Col span={{ base: 12, md: showPreview ? 7 : 10 }}>
              <Stack gap="md">
                <Paper shadow="sm" p="sm" withBorder>
                  <TextInput
                    label="Title (English)"
                    placeholder="Enter blog title in English"
                    value={blog.title}
                    onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                    required
                    size="lg"
                  />
                </Paper>

                {blog.locale === 'hi' && (
                  <Paper shadow="sm" p="sm" withBorder>
                    <TextInput
                      label="Title (Hindi)"
                      placeholder="ब्लॉग शीर्षक हिंदी में दर्ज करें"
                      value={blog.titleHi || ''}
                      onChange={(e) => setBlog({ ...blog, titleHi: e.target.value })}
                      size="lg"
                      style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                    />
                  </Paper>
                )}

                <Paper shadow="sm" p="sm" withBorder style={{ minHeight: '500px' }}>
                  <Text fw={500} size="sm" mb={8}>Content (English)</Text>
                  <TiptapEditor
                    content={blog.content}
                    onChange={(html) => setBlog({ ...blog, content: html })}
                    placeholder="Start writing your blog content here..."
                  />
                </Paper>

                {blog.locale === 'hi' && (
                  <Paper shadow="sm" p="sm" withBorder style={{ minHeight: '300px' }}>
                    <Text fw={500} size="sm" mb={8}>Content (Hindi)</Text>
                    <TiptapEditor
                      content={blog.contentHi || ''}
                      onChange={(html) => setBlog({ ...blog, contentHi: html })}
                      placeholder="यहाँ अपना ब्लॉग कंटेंट लिखना शुरू करें..."
                    />
                  </Paper>
                )}
              </Stack>
            </Grid.Col>

            {/* Preview Column - Only visible when preview is enabled */}
            {showPreview && (
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Paper shadow="sm" p="md" withBorder style={{ minHeight: '500px', position: 'sticky', top: '20px' }}>
                  <ScrollArea h="calc(100vh - 150px)" type="auto">
                    <Title order={4} mb="md">Preview</Title>
                    <Divider mb="md" />

                    <div className="blog-preview">
                      <Title order={2} mb="xs">{blog.title || 'Untitled Blog'}</Title>

                      {/* Author and Date */}
                      <Group mb="md">
                        <Text size="sm" c="dimmed">By {blog.authorName || 'Admin'}</Text>
                        <Text size="sm" c="dimmed">•</Text>
                        <Text size="sm" c="dimmed">{new Date().toLocaleDateString()}</Text>
                      </Group>

                      {/* Category and Tags */}
                      <Group mb="lg">
                        {blog.category && (
                          <Badge color="blue">{blog.category.name}</Badge>
                        )}
                        {blog.tags && blog.tags.map(tag => (
                          <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                        ))}
                      </Group>

                      <Divider mb="md" />

                      {/* Blog Content */}
                      <div className="blog-content">
                        <RichTextContent content={blog.content || editor?.getHTML() || ''} />
                      </div>
                    </div>
                  </ScrollArea>
                </Paper>
              </Grid.Col>
            )}

            {/* Compact Settings Column - Adjust width based on preview state */}
            <Grid.Col span={{ base: 12, md: showPreview ? 2 : 2 }}>
              <Stack gap="xs">
                <Paper shadow="xs" p="xs" withBorder>
                  <Title order={5} mb="xs" size="sm">Publishing</Title>
                  <Stack gap="xs">
                    <Select
                      label="Status"
                      size="xs"
                      value={blog.status}
                      onChange={(value) => setBlog({ ...blog, status: value || 'draft' })}
                      data={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                        { value: 'archived', label: 'Archived' },
                      ]}
                    />
                    <Select
                      label="Author"
                      size="xs"
                      value={blog.authorId?.toString()}
                      onChange={(value) => {
                        const selectedAuthor = value ? authors.find(a => a.id.toString() === value) : null;
                        setBlog({
                          ...blog,
                          authorId: selectedAuthor ? selectedAuthor.id : undefined,
                          authorName: selectedAuthor ? selectedAuthor.name : 'Admin'
                        });
                      }}
                      data={authors.map((author: Author) => ({
                        value: author.id.toString(),
                        label: author.name
                      }))}
                      placeholder="Select author"
                    />
                    <Select
                      label="Category"
                      size="xs"
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
                      size="xs"
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
                      }))}
                    />

                    {/* Compact SEO fields */}
                    <Title order={5} mt="sm" mb="xs" size="sm">SEO</Title>
                    <TextInput
                      label="Meta Description (EN)"
                      size="xs"
                      placeholder="SEO description"
                      value={blog.metaDescription}
                      onChange={(e) => setBlog({ ...blog, metaDescription: e.target.value })}
                    />
                    {blog.locale === 'hi' && (
                      <TextInput
                        label="Meta Description (HI)"
                        size="xs"
                        placeholder="SEO विवरण"
                        value={blog.metaDescriptionHi || ''}
                        onChange={(e) => setBlog({ ...blog, metaDescriptionHi: e.target.value })}
                        style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                      />
                    )}
                    <TextInput
                      label="OG Title (EN)"
                      size="xs"
                      placeholder="Social title"
                      value={blog.ogTitle}
                      onChange={(e) => setBlog({ ...blog, ogTitle: e.target.value })}
                    />
                    {blog.locale === 'hi' && (
                      <TextInput
                        label="OG Title (HI)"
                        size="xs"
                        placeholder="सामाजिक शीर्षक"
                        value={blog.ogTitleHi || ''}
                        onChange={(e) => setBlog({ ...blog, ogTitleHi: e.target.value })}
                        style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                      />
                    )}
                    <TextInput
                      label="OG Description (EN)"
                      size="xs"
                      placeholder="Social description"
                      value={blog.ogDescription}
                      onChange={(e) => setBlog({ ...blog, ogDescription: e.target.value })}
                    />
                    {blog.locale === 'hi' && (
                      <TextInput
                        label="OG Description (HI)"
                        size="xs"
                        placeholder="सामाजिक विवरण"
                        value={blog.ogDescriptionHi || ''}
                        onChange={(e) => setBlog({ ...blog, ogDescriptionHi: e.target.value })}
                        style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                      />
                    )}
                  </Stack>
                </Paper>

                <Button
                  fullWidth
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Create Blog
                </Button>
              </Stack>
            </Grid.Col>
          </Grid>
        </form>
      </div>

      <style jsx global>{`
        .blog-preview {
          font-family: var(--mantine-font-family);
        }
        
        .blog-content {
          font-size: 1rem;
          line-height: 1.7;
        }
        
        .blog-content h1,
        .blog-content h2 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .blog-content p {
          margin-bottom: 1rem;
        }
        
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 1rem 0;
        }
        
        @media (max-width: 768px) {
          .blog-preview {
            margin-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
}