'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Title,
  Paper,
  Button,
  Group,
  Stack,
  Select,
  Grid,
  Card,
  Text,
  Badge,
  Alert,
  MultiSelect
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconDeviceFloppy, IconEye } from '@tabler/icons-react';
import { BilingualInput, BilingualRichText } from '@/components/BilingualInput';
import { useRouter } from 'next/navigation';

interface BlogFormData {
  slug: string;
  locale: string;
  title: string;
  titleHi: string;
  content: string;
  contentHi: string;
  status: string;
  authorName: string;
  authorNameHi: string;
  metaDescription: string;
  metaDescriptionHi: string;
  ogTitle: string;
  ogTitleHi: string;
  ogDescription: string;
  ogDescriptionHi: string;
  categoryId: string;
  tagIds: string[];
}

interface Category {
  id: number;
  name: string;
  nameHi?: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  nameHi?: string;
  slug: string;
}

interface BlogFormProps {
  blogId?: string;
  initialData?: Partial<BlogFormData>;
}

export default function BlogForm({ blogId, initialData }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const form = useForm<BlogFormData>({
    initialValues: {
      slug: '',
      locale: 'en',
      title: '',
      titleHi: '',
      content: '',
      contentHi: '',
      status: 'draft',
      authorName: '',
      authorNameHi: '',
      metaDescription: '',
      metaDescriptionHi: '',
      ogTitle: '',
      ogTitleHi: '',
      ogDescription: '',
      ogDescriptionHi: '',
      categoryId: '',
      tagIds: [],
      ...initialData
    },

    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      slug: (value) => (!value ? 'Slug is required' : null),
      content: (value) => (!value ? 'Content is required' : null),
      authorName: (value) => (!value ? 'Author name is required' : null),
    },
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (form.values.title && !blogId) {
      const slug = form.values.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setFieldValue('slug', slug);
    }
  }, [form.values.title, blogId]);

  // Auto-populate OG fields if empty
  useEffect(() => {
    if (form.values.title && !form.values.ogTitle) {
      form.setFieldValue('ogTitle', form.values.title);
    }
    if (form.values.titleHi && !form.values.ogTitleHi) {
      form.setFieldValue('ogTitleHi', form.values.titleHi);
    }
  }, [form.values.title, form.values.titleHi]);

  useEffect(() => {
    if (form.values.metaDescription && !form.values.ogDescription) {
      form.setFieldValue('ogDescription', form.values.metaDescription);
    }
    if (form.values.metaDescriptionHi && !form.values.ogDescriptionHi) {
      form.setFieldValue('ogDescriptionHi', form.values.metaDescriptionHi);
    }
  }, [form.values.metaDescription, form.values.metaDescriptionHi]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const handleSubmit = async (values: BlogFormData) => {
    try {
      setLoading(true);
      
      const url = blogId ? `/api/blogs/${blogId}` : '/api/blogs';
      const method = blogId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: blogId ? 'Blog updated successfully' : 'Blog created successfully',
          color: 'green'
        });
        
        router.push('/admin/blogs');
      } else {
        throw new Error('Failed to save blog');
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to save blog',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>
          {blogId ? 'Edit Blog Post' : 'Create New Blog Post'}
        </Title>
        <Group>
          <Button
            variant="light"
            leftSection={<IconEye size={16} />}
            onClick={handlePreview}
          >
            {isPreviewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button
            variant="light"
            onClick={() => router.push('/admin/blogs')}
          >
            Back to Blogs
          </Button>
        </Group>
      </Group>

      {!isPreviewMode ? (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid>
            {/* Left Column - Main Content */}
            <Grid.Col span={8}>
              <Stack>
                {/* Basic Information */}
                <Paper withBorder p="md">
                  <Title order={4} mb="md">Basic Information</Title>
                  
                  <Stack>
                    <BilingualInput
                      label="Blog Title"
                      required
                      valueEn={form.values.title}
                      valueHi={form.values.titleHi}
                      onChangeEn={(value) => form.setFieldValue('title', value)}
                      onChangeHi={(value) => form.setFieldValue('titleHi', value)}
                      placeholder="Enter blog title in English"
                      placeholderHi="ब्लॉग शीर्षक हिंदी में दर्ज करें"
                      error={form.errors.title as string}
                    />

                    <BilingualInput
                      label="Author Name"
                      required
                      valueEn={form.values.authorName}
                      valueHi={form.values.authorNameHi}
                      onChangeEn={(value) => form.setFieldValue('authorName', value)}
                      onChangeHi={(value) => form.setFieldValue('authorNameHi', value)}
                      placeholder="Enter author name in English"
                      placeholderHi="लेखक का नाम हिंदी में दर्ज करें"
                      error={form.errors.authorName as string}
                    />

                    <BilingualInput
                      label="URL Slug"
                      required
                      valueEn={form.values.slug}
                      valueHi=""
                      onChangeEn={(value) => form.setFieldValue('slug', value)}
                      onChangeHi={() => {}} // Slug only in English
                      placeholder="blog-post-url-slug"
                      description="URL-friendly version of the title (English only)"
                      error={form.errors.slug as string}
                    />
                  </Stack>
                </Paper>

                {/* Content */}
                <Paper withBorder p="md">
                  <Title order={4} mb="md">Content</Title>
                  
                  <BilingualRichText
                    label="Blog Content"
                    required
                    valueEn={form.values.content}
                    valueHi={form.values.contentHi}
                    onChangeEn={(value) => form.setFieldValue('content', value)}
                    onChangeHi={(value) => form.setFieldValue('contentHi', value)}
                    error={form.errors.content as string}
                    description="Main content of the blog post"
                  />
                </Paper>

                {/* SEO Settings */}
                <Paper withBorder p="md">
                  <Title order={4} mb="md">SEO Settings</Title>
                  
                  <Stack>
                    <BilingualInput
                      label="Meta Description"
                      valueEn={form.values.metaDescription}
                      valueHi={form.values.metaDescriptionHi}
                      onChangeEn={(value) => form.setFieldValue('metaDescription', value)}
                      onChangeHi={(value) => form.setFieldValue('metaDescriptionHi', value)}
                      placeholder="Brief description for search engines"
                      placeholderHi="खोज इंजन के लिए संक्षिप्त विवरण"
                      multiline
                      rows={3}
                      description="Recommended length: 150-160 characters"
                    />

                    <BilingualInput
                      label="Open Graph Title"
                      valueEn={form.values.ogTitle}
                      valueHi={form.values.ogTitleHi}
                      onChangeEn={(value) => form.setFieldValue('ogTitle', value)}
                      onChangeHi={(value) => form.setFieldValue('ogTitleHi', value)}
                      placeholder="Title for social media sharing"
                      placeholderHi="सोशल मीडिया शेयरिंग के लिए शीर्षक"
                      description="Will default to blog title if empty"
                    />

                    <BilingualInput
                      label="Open Graph Description"
                      valueEn={form.values.ogDescription}
                      valueHi={form.values.ogDescriptionHi}
                      onChangeEn={(value) => form.setFieldValue('ogDescription', value)}
                      onChangeHi={(value) => form.setFieldValue('ogDescriptionHi', value)}
                      placeholder="Description for social media sharing"
                      placeholderHi="सोशल मीडिया शेयरिंग के लिए विवरण"
                      multiline
                      rows={3}
                      description="Will default to meta description if empty"
                    />
                  </Stack>
                </Paper>
              </Stack>
            </Grid.Col>

            {/* Right Column - Settings */}
            <Grid.Col span={4}>
              <Stack>
                {/* Publish Settings */}
                <Paper withBorder p="md">
                  <Title order={4} mb="md">Publish Settings</Title>
                  
                  <Stack>
                    <Select
                      label="Status"
                      data={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                        { value: 'archived', label: 'Archived' }
                      ]}
                      value={form.values.status}
                      onChange={(value) => form.setFieldValue('status', value || 'draft')}
                    />

                    <Select
                      label="Primary Language"
                      data={[
                        { value: 'en', label: 'English' },
                        { value: 'hi', label: 'हिंदी (Hindi)' }
                      ]}
                      value={form.values.locale}
                      onChange={(value) => form.setFieldValue('locale', value || 'en')}
                      description="Primary language for this blog post"
                    />
                  </Stack>
                </Paper>

                {/* Categories & Tags */}
                <Paper withBorder p="md">
                  <Title order={4} mb="md">Categories & Tags</Title>
                  
                  <Stack>
                    <Select
                      label="Category"
                      placeholder="Select a category"
                      data={categories.map(cat => ({
                        value: cat.id.toString(),
                        label: `${cat.name}${cat.nameHi ? ` / ${cat.nameHi}` : ''}`
                      }))}
                      value={form.values.categoryId}
                      onChange={(value) => form.setFieldValue('categoryId', value || '')}
                    />
                 

                    <MultiSelect
                      label="Tags"
                      placeholder="Select tags"
                      data={tags.map(tag => ({
                        value: tag.id.toString(),
                        label: `${tag.name}${tag.nameHi ? ` / ${tag.nameHi}` : ''}`
                      }))}
                      value={form.values.tagIds}
                      onChange={(value) => form.setFieldValue('tagIds', value)}
                      searchable
                    />
                    
                  </Stack>
                </Paper>

                {/* Translation Status */}
                <Paper withBorder p="md">
                  <Title order={4} mb="md">Translation Status</Title>
                  
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="sm">English Content</Text>
                      <Badge color="green" size="sm">
                        {form.values.title && form.values.content ? 'Complete' : 'Incomplete'}
                      </Badge>
                    </Group>
                    
                    <Group justify="space-between">
                      <Text size="sm">Hindi Content</Text>
                      <Badge 
                        color={form.values.titleHi && form.values.contentHi ? 'green' : 'orange'} 
                        size="sm"
                      >
                        {form.values.titleHi && form.values.contentHi ? 'Complete' : 'Incomplete'}
                      </Badge>
                    </Group>
                    
                    <Group justify="space-between">
                      <Text size="sm">SEO (English)</Text>
                      <Badge 
                        color={form.values.metaDescription && form.values.ogTitle ? 'green' : 'yellow'} 
                        size="sm"
                      >
                        {form.values.metaDescription && form.values.ogTitle ? 'Complete' : 'Partial'}
                      </Badge>
                    </Group>
                    
                    <Group justify="space-between">
                      <Text size="sm">SEO (Hindi)</Text>
                      <Badge 
                        color={form.values.metaDescriptionHi && form.values.ogTitleHi ? 'green' : 'yellow'} 
                        size="sm"
                      >
                        {form.values.metaDescriptionHi && form.values.ogTitleHi ? 'Complete' : 'Partial'}
                      </Badge>
                    </Group>
                  </Stack>

                  {(!form.values.titleHi || !form.values.contentHi) && (
                    <Alert color="orange" mt="md">
                      <Text size="sm">
                        Consider adding Hindi translation to reach a wider audience.
                      </Text>
                    </Alert>
                  )}
                </Paper>
              </Stack>
            </Grid.Col>
          </Grid>

          {/* Form Actions */}
          <Paper withBorder p="md" mt="lg">
            <Group justify="flex-end">
              <Button
                variant="light"
                onClick={() => router.push('/admin/blogs')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                leftSection={<IconDeviceFloppy size={16} />}
              >
                {loading ? 'Saving...' : (blogId ? 'Update Blog' : 'Create Blog')}
              </Button>
            </Group>
          </Paper>
        </form>
      ) : (
        // Preview Mode
        <Paper withBorder p="md">
          <Title order={3} mb="md">Preview Mode</Title>
          <Grid>
            <Grid.Col span={6}>
              <Card withBorder h="100%">
                <Title order={4} mb="md">English Version</Title>
                <Stack>
                  <Title order={2}>{form.values.title || 'Blog Title'}</Title>
                  <Text c="dimmed">By {form.values.authorName || 'Author Name'}</Text>
                  <div dangerouslySetInnerHTML={{ __html: form.values.content || 'Blog content will appear here...' }} />
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card withBorder h="100%">
                <Title order={4} mb="md">Hindi Version</Title>
                <Stack>
                  <Title order={2} style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                    {form.values.titleHi || 'ब्लॉग शीर्षक'}
                  </Title>
                  <Text c="dimmed" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                    लेखक: {form.values.authorNameHi || 'लेखक का नाम'}
                  </Text>
                  <div 
                    style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                    dangerouslySetInnerHTML={{ 
                      __html: form.values.contentHi || 'ब्लॉग की सामग्री यहाँ दिखाई जाएगी...' 
                    }} 
                  />
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>
      )}
    </Container>
  );
}