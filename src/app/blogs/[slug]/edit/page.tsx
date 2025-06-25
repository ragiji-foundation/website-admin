'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
  Tabs,
  LoadingOverlay,
  Box,
  Drawer,
  ScrollArea,
  Divider,
  Badge,
} from '@mantine/core';
import { IconArrowLeft, IconClock, IconCalendar, IconEye, IconEyeOff } from '@tabler/icons-react';
// Fix: Import TiptapEditor from the correct path
import TiptapEditor from '@/components/TiptapEditor';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { RichTextContent } from '@/components/RichTextContent';
import { format } from 'date-fns';

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
  titleHi?: string;
  content: string;
  contentHi?: string;
  status: string;
  metaDescription: string;
  metaDescriptionHi?: string;
  ogTitle: string;
  ogTitleHi?: string;
  ogDescription: string;
  ogDescriptionHi?: string;
  category: { id: number; name: string } | null;
  categoryId?: number | null;
  tags: Array<{ id: number; name: string }>;
  locale: string;
  authorName?: string;
  authorNameHi?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditBlog() {
  const router = useRouter();
  const params = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const locale = searchParams?.get('locale') || 'en';
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [content, setContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Handle image upload for TipTap
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const uploadResult = await uploadToCloudinary(file, { folder: 'blogs' });
      return uploadResult.url;
    } catch (error) {
      console.error('Image upload failed:', error);
      notifications.show({
        title: 'Upload Failed',
        message: 'Failed to upload image. Please try again.',
        color: 'red'
      });
      throw error;
    }
  };

  useEffect(() => {
    if (!params?.slug) return;

    const fetchData = async () => {
      try {
        const [blogRes, categoriesRes, tagsRes] = await Promise.all([
          fetch(`/api/blogs/${params.slug}?locale=${locale}`),
          fetch('/api/categories'),
          fetch('/api/tags')
        ]);

        const [blogData, categoriesData, tagsData] = await Promise.all([
          blogRes.json(),
          categoriesRes.json(),
          tagsRes.json()
        ]);

        if (blogData.error) {
          throw new Error(blogData.error);
        }

        setBlog(blogData);
        setContent(blogData.content || '');
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        notifications.show({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to fetch data',
          color: 'red'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params?.slug, locale]);

  const handleSubmit = async () => {
    if (!blog) return;

    setSaving(true);
    try {
      // Prepare tag connections in the format expected by Prisma
      const tagConnections = blog.tags.map(tag => ({ id: tag.id }));

      const response = await fetch(`/api/blogs/${params.slug}?locale=${locale}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: blog.title,
          titleHi: blog.titleHi,
          content: locale === 'en' ? content : blog.content,
          contentHi: locale === 'en' ? blog.contentHi : content,
          status: blog.status,
          metaDescription: blog.metaDescription,
          metaDescriptionHi: blog.metaDescriptionHi,
          ogTitle: blog.ogTitle || blog.title,
          ogTitleHi: blog.ogTitleHi || blog.titleHi,
          ogDescription: blog.ogDescription || blog.metaDescription,
          ogDescriptionHi: blog.ogDescriptionHi || blog.metaDescriptionHi,
          authorName: blog.authorName,
          authorNameHi: blog.authorNameHi,
          categoryId: blog.category?.id || null,
          locale: locale,
          tags: tagConnections
        }),
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

      router.push(`/blogs/${params.slug}?locale=${locale}`);
    } catch (error) {
      console.error('Error updating blog:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update blog',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };

  // Format date for preview
  const formattedDate = blog?.createdAt
    ? format(new Date(blog.createdAt), 'MMMM dd, yyyy')
    : '';

  if (loading) {
    return (
      <Box p="xl">
        <LoadingOverlay visible={true} />
      </Box>
    );
  }

  if (!blog) {
    return (
      <Box p="xl">
        <Text>Blog not found. <Button onClick={() => router.push('/blogs')}>Return to Blog List</Button></Text>
      </Box>
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
                <Text size="sm" c="dimmed">Editing</Text>
                <Title order={3}>{blog?.title || 'Loading...'}</Title>
              </div>
            </Group>

            <Group>
              <Group gap="xs">
                <IconClock size={16} />
                <Text size="sm">Last modified: {new Date(blog.updatedAt).toLocaleDateString()}</Text>
              </Group>

              <Button
                variant={showPreview ? "filled" : "light"}
                leftSection={showPreview ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>

              <Tabs value={locale} onChange={(value) => {
                if (value) {
                  const newUrl = `/blogs/${params.slug}/edit?locale=${value}`;
                  router.push(newUrl);
                }
              }}>
                <Tabs.List>
                  <Tabs.Tab value="en">
                    English
                  </Tabs.Tab>
                  <Tabs.Tab value="hi">
                    Hindi
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs>

              <Button
                variant="light"
                onClick={() => router.push(`/blogs/${params.slug}?locale=${locale}`)}
              >
                View Blog
              </Button>
              <Button
                onClick={handleSubmit}
                loading={saving}
              >
                Publish Changes
              </Button>
            </Group>
          </Group>
        </div>
      </header>

      <div className="w-full px-[5%] py-4">
        <Grid gutter="md">
          {/* Expanded Editor Column - Adjust width based on preview state */}
          <Grid.Col span={{ base: 12, md: showPreview ? 7 : 10 }} p="xs">
            <Stack gap="md">
              <Paper shadow="sm" p="sm" withBorder>
                <TextInput
                  label={`Title (${locale === 'en' ? 'English' : 'Hindi'})`}
                  placeholder={locale === 'en' ? 'Enter blog title' : 'ब्लॉग शीर्षक दर्ज करें'}
                  value={locale === 'en' ? (blog?.title || '') : (blog?.titleHi || '')}
                  onChange={(e) => {
                    if (locale === 'en') {
                      setBlog({ ...blog!, title: e.target.value });
                    } else {
                      setBlog({ ...blog!, titleHi: e.target.value });
                    }
                  }}
                  required
                  size="lg"
                  style={locale === 'hi' ? { fontFamily: 'Noto Sans Devanagari, sans-serif' } : {}}
                />
              </Paper>

              <Paper shadow="sm" p="sm" withBorder style={{ minHeight: '500px' }}>
                <Text fw={500} size="sm" mb={8}>
                  Content ({locale === 'en' ? 'English' : 'Hindi'})
                </Text>
                <TiptapEditor
                  content={locale === 'en' ? content : (blog?.contentHi || '')}
                  onChange={(newContent) => {
                    if (locale === 'en') {
                      setContent(newContent);
                    } else {
                      setBlog({ ...blog!, contentHi: newContent });
                    }
                  }}
                  onImageUpload={handleImageUpload}
                  placeholder={locale === 'en' ? 
                    'Start writing your blog content here...' : 
                    'यहाँ अपना ब्लॉग कंटेंट लिखना शुरू करें...'
                  }
                />
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Preview Column - Only visible when preview is enabled */}
          {showPreview && (
            <Grid.Col span={{ base: 12, md: 3 }} p="xs">
              <Paper shadow="sm" p="md" withBorder style={{ minHeight: '500px', position: 'sticky', top: '20px' }}>
                <ScrollArea h="calc(100vh - 150px)" type="auto">
                  <Title order={4} mb="md">Preview</Title>
                  <Divider mb="md" />

                  <div className="blog-preview">
                    <Title order={2} mb="xs">
                      {locale === 'en' ? 
                        (blog?.title || 'Untitled Blog') : 
                        (blog?.titleHi || blog?.title || 'Untitled Blog')
                      }
                    </Title>

                    {/* Author and Date */}
                    <Group mb="md">
                      <Text size="sm" c="dimmed">
                        By {locale === 'en' ? 
                          (blog?.authorName || 'Admin') : 
                          (blog?.authorNameHi || blog?.authorName || 'Admin')
                        }
                      </Text>
                      <Text size="sm" c="dimmed">•</Text>
                      <Text size="sm" c="dimmed">{formattedDate}</Text>
                    </Group>

                    {/* Category and Tags */}
                    <Group mb="lg">
                      {blog?.category && (
                        <Badge color="blue">{blog.category.name}</Badge>
                      )}
                      {blog?.tags && blog.tags.map(tag => (
                        <Badge key={tag.id} variant="outline">{tag.name}</Badge>
                      ))}
                    </Group>

                    <Divider mb="md" />

                    {/* Blog Content */}
                    <div className="blog-content">
                      <RichTextContent 
                        content={locale === 'en' ? content : (blog?.contentHi || '')} 
                      />
                    </div>
                  </div>
                </ScrollArea>
              </Paper>
            </Grid.Col>
          )}

          {/* Compact Settings Column - Adjust width based on preview state */}
          <Grid.Col span={{ base: 12, md: showPreview ? 2 : 2 }} p="xs">
            <Stack gap="xs">
              <Paper shadow="xs" p="xs" withBorder>
                <Title order={5} mb="xs" size="sm">Publishing</Title>
                <Stack gap="xs">
                  <Select
                    label="Status"
                    size="xs"
                    value={blog?.status || ''}
                    onChange={(value) => setBlog({ ...blog!, status: value || 'draft' })}
                    data={[
                      { value: 'draft', label: 'Draft' },
                      { value: 'published', label: 'Published' },
                      { value: 'archived', label: 'Archived' },
                    ]}
                  />
                  <Select
                    label="Category"
                    size="xs"
                    value={blog?.category?.id?.toString() || ''}
                    onChange={(value) => {
                      const selectedCategory = value ? categories.find(c => c.id.toString() === value) : null;
                      setBlog({
                        ...blog!,
                        category: selectedCategory
                          ? { id: selectedCategory.id, name: selectedCategory.name }
                          : null,
                        categoryId: selectedCategory ? selectedCategory.id : null
                      });
                    }}
                    data={categories.map((cat: Category) => ({
                      value: cat.id.toString(),
                      label: cat.name
                    }))}
                    clearable
                  />
                  <MultiSelect
                    label="Tags"
                    size="xs"
                    value={(blog?.tags || []).map(tag => tag.id.toString())}
                    onChange={(values) => setBlog({
                      ...blog!,
                      tags: values.map(v => {
                        const foundTag = tags.find((t: Tag) => t.id.toString() === v);
                        return {
                          id: parseInt(v),
                          name: foundTag?.name || ''
                        };
                      })
                    })}
                    data={tags.map((tag: Tag) => ({
                      value: tag.id.toString(),
                      label: tag.name,
                    }))}
                    searchable
                    clearable
                  />

                  {/* Compact SEO fields */}
                  <Title order={5} mt="sm" mb="xs" size="sm">
                    SEO ({locale === 'en' ? 'English' : 'Hindi'})
                  </Title>
                  <TextInput
                    label="Meta Description"
                    size="xs"
                    placeholder={locale === 'en' ? 'SEO description' : 'SEO विवरण'}
                    value={locale === 'en' ? 
                      (blog?.metaDescription || '') : 
                      (blog?.metaDescriptionHi || '')
                    }
                    onChange={(e) => {
                      if (locale === 'en') {
                        setBlog({ ...blog!, metaDescription: e.target.value });
                      } else {
                        setBlog({ ...blog!, metaDescriptionHi: e.target.value });
                      }
                    }}
                    style={locale === 'hi' ? { fontFamily: 'Noto Sans Devanagari, sans-serif' } : {}}
                  />
                  <TextInput
                    label="OG Title"
                    size="xs"
                    placeholder={locale === 'en' ? 'Social title' : 'सामाजिक शीर्षक'}
                    value={locale === 'en' ? 
                      (blog?.ogTitle || '') : 
                      (blog?.ogTitleHi || '')
                    }
                    onChange={(e) => {
                      if (locale === 'en') {
                        setBlog({ ...blog!, ogTitle: e.target.value });
                      } else {
                        setBlog({ ...blog!, ogTitleHi: e.target.value });
                      }
                    }}
                    style={locale === 'hi' ? { fontFamily: 'Noto Sans Devanagari, sans-serif' } : {}}
                  />
                  <TextInput
                    label="OG Description"
                    size="xs"
                    placeholder={locale === 'en' ? 'Social description' : 'सामाजिक विवरण'}
                    value={locale === 'en' ? 
                      (blog?.ogDescription || '') : 
                      (blog?.ogDescriptionHi || '')
                    }
                    onChange={(e) => {
                      if (locale === 'en') {
                        setBlog({ ...blog!, ogDescription: e.target.value });
                      } else {
                        setBlog({ ...blog!, ogDescriptionHi: e.target.value });
                      }
                    }}
                    style={locale === 'hi' ? { fontFamily: 'Noto Sans Devanagari, sans-serif' } : {}}
                  />
                </Stack>
              </Paper>

              <Button
                fullWidth
                onClick={handleSubmit}
                loading={saving}
              >
                Publish Changes
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>
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