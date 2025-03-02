'use client';
import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Card,
  Text,
  Stack,
  Button,
  TextInput,
  Group,
  Switch,
  NumberInput,
  ActionIcon,
  Modal,
  Image,
  LoadingOverlay,
  FileButton,
  Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconTrash, IconUpload } from '@tabler/icons-react';
import LexicalEditor from '@/components/LexicalEditor';
import type { SuccessStory } from '@/types/success-story';

interface SuccessStoryForm {
  title: string;
  content: string; // This will store stringified JSON
  personName: string;
  location: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
}

export default function SuccessStoriesManagementPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<SuccessStoryForm>({
    initialValues: {
      title: '',
      content: JSON.stringify({ // Initialize with empty editor state
        root: {
          children: [
            {
              children: [],
              direction: null,
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: null,
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        }
      }),
      personName: '',
      location: '',
      imageUrl: '',
      featured: false,
      order: 0,
    },
    validate: {
      title: (value) => !value.trim() && 'Title is required',
      content: (value) => {
        try {
          JSON.parse(value);
          return null;
        } catch {
          return 'Invalid content format';
        }
      },
      personName: (value) => !value.trim() && 'Person name is required',
      location: (value) => !value.trim() && 'Location is required',
      imageUrl: (value) => !value && 'Image is required',
    },
  });

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/success-stories');
      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      setStories(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch stories',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      form.setFieldValue('imageUrl', data.url);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const url = editingStory
        ? `/api/success-stories/${editingStory.id}`
        : '/api/success-stories';

      const method = editingStory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Failed to save story');

      await fetchStories();
      setModalOpened(false);
      form.reset();
      setEditingStory(null);

      notifications.show({
        title: 'Success',
        message: `Story ${editingStory ? 'updated' : 'created'} successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save story',
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    try {
      const response = await fetch(`/api/success-stories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete story');

      await fetchStories();
      notifications.show({
        title: 'Success',
        message: 'Story deleted successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete story',
        color: 'red',
      });
    }
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title>Success Stories Management</Title>
        <Button
          leftSection={<IconPlus size={14} />}
          onClick={() => setModalOpened(true)}
        >
          Add Story
        </Button>
      </Group>

      <Stack gap="md">
        {stories.map((story) => (
          <Card key={story.id} withBorder>
            <Group>
              {story.imageUrl && (
                <Image
                  src={story.imageUrl}
                  width={100}
                  height={100}
                  radius="md"
                  fit="cover"
                />
              )}
              <Stack gap="xs" style={{ flex: 1 }}>
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>{story.title}</Text>
                    <Text size="sm" c="dimmed">
                      {story.personName} • {story.location}
                    </Text>
                  </div>
                  {story.featured && (
                    <Badge color="blue" variant="light">Featured</Badge>
                  )}
                </Group>
              </Stack>
              <Group>
                <ActionIcon
                  variant="light"
                  color="blue"
                  onClick={() => {
                    setEditingStory(story);
                    form.setValues(story);
                    setModalOpened(true);
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={() => handleDelete(story.id)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
          </Card>
        ))}
      </Stack>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingStory(null);
          form.reset();
        }}
        title={editingStory ? 'Edit Story' : 'Add New Story'}
        size="xl"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Title"
              required
              {...form.getInputProps('title')}
            />
            <Group grow>
              <TextInput
                label="Person Name"
                required
                {...form.getInputProps('personName')}
              />
              <TextInput
                label="Location"
                required
                {...form.getInputProps('location')}
              />
            </Group>
            <Group>
              <NumberInput
                label="Order"
                {...form.getInputProps('order')}
              />
              <Switch
                label="Featured Story"
                {...form.getInputProps('featured', { type: 'checkbox' })}
              />
            </Group>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Story Content</Text>
              <LexicalEditor
                content={form.values.content}
                onChange={(value) => {
                  // Ensure the value is stringified JSON
                  const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
                  form.setFieldValue('content', jsonValue);
                }}
                error={form.errors.content ? String(form.errors.content) : undefined}
                required
              />
            </Stack>
            <Stack gap="xs">
              <Text size="sm" fw={500}>Story Image</Text>
              <Group>
                <FileButton
                  onChange={(file) => file && handleImageUpload(file)}
                  accept="image/png,image/jpeg"
                >
                  {(props) => (
                    <Button
                      {...props}
                      leftSection={<IconUpload size={14} />}
                      loading={uploading}
                    >
                      Upload Image
                    </Button>
                  )}
                </FileButton>
                {form.values.imageUrl && (
                  <Image
                    src={form.values.imageUrl}
                    width={100}
                    height={100}
                    radius="md"
                    fit="cover"
                  />
                )}
              </Group>
            </Stack>
            <Button type="submit" mt="md">
              {editingStory ? 'Update Story' : 'Create Story'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
