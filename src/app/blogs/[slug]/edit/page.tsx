'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { ImageUpload } from '@/components/Editor/ImageUpload';
import {
  Container,
  TextInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Stack,
  Tabs,
  LoadingOverlay,
  Textarea,
  Grid,
  Paper,
  Title,
  Badge,
  Text,
  Avatar,
  Divider,
  Switch,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconUser } from '@tabler/icons-react';
import { format } from 'date-fns';
import Image from '@tiptap/extension-image';

interface BlogFormData {
  title: string;
  content: string;
  slug: string;
  status: string;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  locale: string;
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

export default function EditBlogPage() {
  const router = useRouter();
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const [activeLocale, setActiveLocale] = useState(searchParams.get('locale') || 'en');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    slug: slug as string,
    status: 'draft',
    category: null,
    metaDescription: '',
    ogTitle: '',
    ogDescription: '',
    tags: [],
    locale: activeLocale,
  });
  const [showPreview, setShowPreview] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({
        HTMLAttributes: {
          class: 'blog-image',
        },
      }),
      ImageUpload.configure({
        uploadFn: async (file: File) => {
          const formData = new FormData();
          formData.append('file', file);

          try {
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const { url } = await response.json();
            return url;
          } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
          }
        },
      }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        content: editor.getHTML(),
      }));
    },
  });

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/blogs/${slug}?locale=${activeLocale}`);

        if (!response.ok) throw new Error('Failed to fetch blog');

        const data = await response.json();
        setFormData({
          title: data.title,
          content: data.content,
          slug: data.slug,
          status: data.status,
          category: data.category,
          metaDescription: data.metaDescription,
          ogTitle: data.ogTitle,
          ogDescription: data.ogDescription,
          tags: data.tags,
          locale: activeLocale,
        });
        editor?.commands.setContent(data.content);
      } catch (err) {
        notifications.show({
          title: 'Error',
          message: err instanceof Error ? err.message : 'Failed to fetch blog post',
          color: 'red',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug, activeLocale, editor?.commands]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/blogs/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update blog');

      notifications.show({
        title: 'Success',
        message: 'Blog post updated successfully',
        color: 'green',
      });

      router.push(`/blogs/${slug}?locale=${activeLocale}`);
    } catch (error) {
      console.error('Error updating blog:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update blog post',
        color: 'red',
      });
    }
  };

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

  const BlogPreview = () => (
    <Paper shadow="xs" p="md" style={{ height: '100%', overflowY: 'auto' }}>
      <Stack gap="md">
        <Title order={1}>{formData.title || 'Untitled Blog'}</Title>

        <Group gap="xs">
          {formData.tags?.map((tag) => (
            <Badge key={tag.id} variant="light">
              {tag.name}
            </Badge>
          ))}
        </Group>

        {formData.category && (
          <Badge color="blue" size="lg">
            {formData.category.name}
          </Badge>
        )}

        <Group gap="lg">
          <Group gap="xs">
            <Avatar radius="xl" />
            <Text size="sm" c="dimmed">
              <IconUser size={14} style={{ display: 'inline', marginRight: 4 }} />
              Author Name
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            <IconCalendar size={14} style={{ display: 'inline', marginRight: 4 }} />
            {format(new Date(), 'MMMM dd, yyyy')}
          </Text>
          <Badge color={formData.status === 'published' ? 'green' : 'yellow'}>
            {formData.status}
          </Badge>
        </Group>

        <Divider />

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: formData.content }}
        />
      </Stack>
    </Paper>
  );

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={isLoading} />

      <Group justify="space-between" mb="xl">
        <Title order={2}>{slug ? 'Edit Blog' : 'Create Blog'}</Title>
        <Group>
          <Switch
            label="Show Preview"
            checked={showPreview}
            onChange={(event) => setShowPreview(event.currentTarget.checked)}
          />
          <Button onClick={() => router.back()} variant="light">
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {slug ? 'Update' : 'Create'}
          </Button>
        </Group>
      </Group>

      <Tabs value={activeLocale} onChange={(value) => setActiveLocale(value || 'en')} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="en">English</Tabs.Tab>
          <Tabs.Tab value="hi">Hindi</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Grid gutter="md">
        <Grid.Col span={showPreview ? 6 : 12}>
          <Stack gap="md">
            <TextInput
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                title: e.target.value,
              }))}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                status: value || 'draft',
              }))}
              data={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
            />

            <Select
              label="Category"
              value={formData.category?.id.toString() || null}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                category: value ? categories.find(cat => cat.id.toString() === value) || null : null
              }))}
              data={categories.map(cat => ({
                value: cat.id.toString(),
                label: cat.name
              }))}
              clearable
            />

            <MultiSelect
              label="Tags"
              value={formData.tags.map(tag => tag.id.toString())}
              onChange={(values) => {
                const selectedTags = tags.filter(tag =>
                  values.includes(tag.id.toString())
                );
                setFormData(prev => ({
                  ...prev,
                  tags: selectedTags
                }));
              }}
              data={tags.map(tag => ({
                value: tag.id.toString(),
                label: tag.name
              }))}
              searchable
              clearable
            />

            <RichTextEditor editor={editor}>
              <RichTextEditor.Toolbar sticky stickyOffset={60}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                  <RichTextEditor.ClearFormatting />
                  <RichTextEditor.Highlight />
                  <RichTextEditor.Code />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                  <RichTextEditor.H4 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.Hr />
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async () => {
                        const file = input.files?.[0];
                        if (file) {
                          try {
                            const formData = new FormData();
                            formData.append('file', file);

                            const response = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData,
                            });

                            if (!response.ok) throw new Error('Upload failed');

                            const { url } = await response.json();
                            editor?.commands.setImage({ src: url });
                          } catch (error) {
                            console.error('Error uploading image:', error);
                            notifications.show({
                              title: 'Error',
                              message: 'Failed to upload image',
                              color: 'red',
                            });
                          }
                        }
                      };
                      input.click();
                    }}
                  >
                    Upload Image
                  </Button>
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.AlignLeft />
                  <RichTextEditor.AlignCenter />
                  <RichTextEditor.AlignRight />
                  <RichTextEditor.AlignJustify />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content />
            </RichTextEditor>

            <Textarea
              label="Meta Description"
              value={formData.metaDescription}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                metaDescription: e.target.value,
              }))}
            />

            <TextInput
              label="OG Title"
              value={formData.ogTitle}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                ogTitle: e.target.value,
              }))}
            />

            <Textarea
              label="OG Description"
              value={formData.ogDescription}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                ogDescription: e.target.value,
              }))}
            />
          </Stack>
        </Grid.Col>

        {showPreview && (
          <Grid.Col span={6} style={{ position: 'sticky', top: 0 }}>
            <BlogPreview />
          </Grid.Col>
        )}
      </Grid>

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