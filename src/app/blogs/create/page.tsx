"use client";

import { useState, useCallback, useMemo } from 'react';
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
import dynamic from 'next/dynamic';

// ✅ MIGRATED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { MediaUpload } from '@/components/MediaUpload';

// Lazy load heavy components
const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded"></div>,
  ssr: false
});

const RichTextContent = dynamic(() => 
  import('@/components/RichTextContent').then(mod => ({ default: mod.RichTextContent })), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded"></div>,
  ssr: false
});

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
  Skeleton,
  Loader,
  Center,
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
  featuredImage?: string;
}

export default function CreateBlog() {
  const router = useRouter();
  
  // ✅ MIGRATED: Using centralized hooks instead of manual state management
  const { data: categories, loading: categoriesLoading } = useApiData<Category[]>('/api/categories', [], { showNotifications: true });
  const { data: tags, loading: tagsLoading } = useApiData<Tag[]>('/api/tags', [], { showNotifications: true });
  const { data: authors, loading: authorsLoading } = useApiData<Author[]>('/api/authors', [], { showNotifications: true });
  
  // ✅ MIGRATED: Using centralized CRUD operations
  const { create, loading: createLoading } = useCrudOperations<Blog>('/api/blogs', {
    showNotifications: true,
    onSuccess: () => {
      router.push('/blogs');
    }
  });

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
    locale: 'hi',
    authorId: undefined,
    authorName: 'Admin',
    authorNameHi: '',
    categoryId: undefined,
    featuredImage: '',
  });
  const [showPreview, setShowPreview] = useState(false);

  // Memoize editor configuration
  const editorConfig = useMemo(() => ({
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
  }), []);

  const editor = useEditor({
    ...editorConfig,
    onUpdate: useCallback(({ editor }: { editor: ReturnType<typeof useEditor> }) => {
      setBlog(prev => ({
        ...prev,
        content: editor?.getHTML() || ''
      }));
    }, [])
  });

  // ✅ MIGRATED: Optimized form submission using centralized operations
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validation
      if (!blog.title.trim()) {
        notifications.show({
          title: 'Validation Error',
          message: 'Blog title is required',
          color: 'red'
        });
        return;
      }

      if (!blog.content.trim() && !editor?.getHTML()) {
        notifications.show({
          title: 'Validation Error',
          message: 'Blog content is required',
          color: 'red'
        });
        return;
      }

      const blogData = {
        title: blog.title,
        titleHi: blog.titleHi || undefined,
        content: editor?.getHTML() || blog.content,
        contentHi: blog.contentHi || undefined,
        status: blog.status,
        authorId: blog.authorId || 1,
        authorName: blog.authorName || 'Admin',
        authorNameHi: blog.authorNameHi || undefined,
        metaDescription: blog.metaDescription,
        metaDescriptionHi: blog.metaDescriptionHi || undefined,
        ogTitle: blog.ogTitle || blog.title,
        ogTitleHi: blog.ogTitleHi || blog.titleHi,
        ogDescription: blog.ogDescription || blog.metaDescription,
        ogDescriptionHi: blog.ogDescriptionHi || blog.metaDescriptionHi,
        categoryId: blog.categoryId,
        locale: blog.locale,
        tags: blog.tags,
        featuredImage: blog.featuredImage || undefined,
      };

      await create(blogData);
    } catch (error) {
      console.error('Error creating blog:', error);
      // Error handling is done by the centralized hook
    }
  }, [blog, editor, create]);

  // Show loading state while fetching initial data
  const dataLoading = categoriesLoading || tagsLoading || authorsLoading;
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="w-full px-[5%]">
            <Group justify="space-between" align="center" py="xs">
              <Group>
                <ActionIcon variant="subtle" size="lg">
                  <IconArrowLeft size={20} />
                </ActionIcon>
                <div>
                  <Text size="sm" c="dimmed">Creating New</Text>
                  <Title order={3}>Blog Post</Title>
                </div>
              </Group>
              <Group>
                <Skeleton height={36} width={120} />
                <Skeleton height={36} width={100} />
                <Skeleton height={36} width={80} />
                <Skeleton height={36} width={100} />
              </Group>
            </Group>
          </div>
        </header>
        
        <div className="w-full px-[5%] py-4">
          <Center h={400}>
            <Stack align="center">
              <Loader size="lg" />
              <Text>Loading blog editor...</Text>
            </Stack>
          </Center>
        </div>
      </div>
    );
  }

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

              <Button
                variant="light"
                onClick={() => router.push('/blogs')}
              >
                Cancel
              </Button>
              <Button
                loading={createLoading}
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

                <Paper shadow="sm" p="sm" withBorder>
                  <MediaUpload
                    label="Featured Image"
                    value={blog.featuredImage || ''}
                    onChange={(url) => setBlog({ ...blog, featuredImage: url })}
                    folder="blogs"
                    buttonLabel="Upload Featured Image"
                    withPreview={true}
                  />
                  <Text size="xs" c="dimmed" mt="xs">
                    Upload a featured image for your blog post. This will be displayed as the main image.
                  </Text>
                </Paper>
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

                      {/* Featured Image */}
                      {blog.featuredImage && (
                        <div style={{ marginBottom: '1rem' }}>
                          <img
                            src={blog.featuredImage}
                            alt="Featured image"
                            style={{
                              width: '100%',
                              height: 'auto',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              maxHeight: '200px'
                            }}
                          />
                        </div>
                      )}

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
                  loading={createLoading}
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