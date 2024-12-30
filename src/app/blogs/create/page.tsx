"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import {
  Container,
  TextInput,
  Select,
  MultiSelect,
  Button,
  Group,
  Stack,
  Tabs,
  Grid,
  Paper,
  Title,
  Badge,
  Text,
  Avatar,
  Divider,
  Switch,
  Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconUser } from '@tabler/icons-react';
import { format } from 'date-fns';

interface BlogFormData {
  title: string;
  content: string;
  slug: string;
  status: string;
  category: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  tags: string[];
  locale: string;
}

const initialContent = `
<h2>Start writing your blog post...</h2>
<p>Use the toolbar above to format your content.</p>
`;

export default function CreateBlogPage() {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<string>('en');
  const [showPreview, setShowPreview] = useState(true);
  const [formData, setFormData] = useState<Record<string, BlogFormData>>({
    en: {
      title: '',
      content: initialContent,
      slug: '',
      status: 'draft',
      category: '',
      metaDescription: '',
      ogTitle: '',
      ogDescription: '',
      tags: [],
      locale: 'en',
    },
    hi: {
      title: '',
      content: initialContent,
      slug: '',
      status: 'draft',
      category: '',
      metaDescription: '',
      ogTitle: '',
      ogDescription: '',
      tags: [],
      locale: 'hi',
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
    ],
    content: formData[activeLocale].content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        [activeLocale]: {
          ...prev[activeLocale],
          content: editor.getHTML(),
        },
      }));
    },
  });

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData[activeLocale]),
      });

      if (!response.ok) throw new Error('Failed to create blog');

      const blog = await response.json();
      notifications.show({
        title: 'Success',
        message: 'Blog post created successfully',
        color: 'green',
      });

      router.push(`/blogs/${blog.slug}`);
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to create blog post',
        color: 'red',
      });
    }
  };

  const BlogPreview = () => (
    <Paper shadow="xs" p="md" style={{ height: '100%', overflowY: 'auto' }}>
      <Stack gap="md">
        <Title order={1}>{formData[activeLocale].title || 'Untitled Blog'}</Title>

        <Group gap="xs">
          {formData[activeLocale].tags?.map((tag, index) => (
            <Badge key={index} variant="light">
              {tag}
            </Badge>
          ))}
        </Group>

        {formData[activeLocale].category && (
          <Badge color="blue" size="lg">
            {formData[activeLocale].category}
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
          <Badge color={formData[activeLocale].status === 'published' ? 'green' : 'yellow'}>
            {formData[activeLocale].status}
          </Badge>
        </Group>

        <Divider />

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: formData[activeLocale].content }}
        />
      </Stack>
    </Paper>
  );

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Create New Blog</Title>
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
            Create
          </Button>
        </Group>
      </Group>

      <Tabs value={activeLocale} onChange={(value) => setActiveLocale(value as string)} mb="xl">
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
              value={formData[activeLocale].title}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [activeLocale]: {
                  ...prev[activeLocale],
                  title: e.target.value,
                },
              }))}
            />

            <TextInput
              label="Slug"
              value={formData[activeLocale].slug}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [activeLocale]: {
                  ...prev[activeLocale],
                  slug: e.target.value,
                },
              }))}
            />

            <Select
              label="Status"
              data={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
              value={formData[activeLocale].status}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                [activeLocale]: {
                  ...prev[activeLocale],
                  status: value || 'draft',
                },
              }))}
            />

            <Select
              label="Category"
              data={[
                { value: 'technology', label: 'Technology' },
                { value: 'lifestyle', label: 'Lifestyle' },
                { value: 'health', label: 'Health' },
              ]}
              value={formData[activeLocale].category}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                [activeLocale]: {
                  ...prev[activeLocale],
                  category: value || '',
                },
              }))}
            />

            <MultiSelect
              label="Tags"
              data={[
                { value: 'web', label: 'Web Development' },
                { value: 'mobile', label: 'Mobile Development' },
                { value: 'design', label: 'Design' },
              ]}
              value={formData[activeLocale].tags}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                [activeLocale]: {
                  ...prev[activeLocale],
                  tags: value,
                },
              }))}
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
              value={formData[activeLocale].metaDescription}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [activeLocale]: {
                  ...prev[activeLocale],
                  metaDescription: e.target.value,
                },
              }))}
            />

            <TextInput
              label="OG Title"
              value={formData[activeLocale].ogTitle}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [activeLocale]: {
                  ...prev[activeLocale],
                  ogTitle: e.target.value,
                },
              }))}
            />

            <Textarea
              label="OG Description"
              value={formData[activeLocale].ogDescription}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [activeLocale]: {
                  ...prev[activeLocale],
                  ogDescription: e.target.value,
                },
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