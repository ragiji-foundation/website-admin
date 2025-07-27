'use client';
import { useState, useEffect } from 'react';
import {
  TextInput,
  Button,
  Group,
  Stack,
  Paper,
  Title,
  Box,
  Image,
  ActionIcon,
  Text,
  NumberInput,
  Card,
  Container,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconEdit, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { FileButton } from '@mantine/core';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';

import { handleImageUpload } from '@/utils/imageUpload';

// ✅ MIGRATED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

// Initiative interface matching our Prisma schema
interface Initiative {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

export default function InitiativesAdmin() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    order: 0
  });

  // ✅ MIGRATED: Use centralized data fetching and operations
  const { data: initiatives = [], loading: _dataLoading, refetch } = useApiData<Initiative[]>('/api/initiatives', []);
  const { create, update, remove, loading } = useCrudOperations<Initiative>('/api/initiatives');

  // TipTap editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Highlight,
    ],
    content: formData.description,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, description: editor.getHTML() }));
    },
  });

  useEffect(() => {
    // Update editor content when editing an initiative
    if (editor && editingId) {
      editor.commands.setContent(formData.description);
    }
  }, [editingId, editor, formData.description]);

  const onImageUpload = async (file: File | null) => {
    try {
      if (!file) return;
      const url = await handleImageUpload(file);
      if (url && typeof url === 'string') {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        notifications.show({
          title: 'Success',
          message: 'Image uploaded successfully',
          color: 'green'
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      order: 0
    });
    setEditingId(null);
    editor?.commands.setContent('');
  };

  // ✅ MIGRATED: Centralized form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Make sure we have content from the editor
      if (editor) {
        setFormData(prev => ({ ...prev, description: editor.getHTML() }));
      }

      if (!formData.title) {
        throw new Error('Title is required');
      }

      if (!formData.description) {
        throw new Error('Description is required');
      }

      let result;
      if (editingId) {
        result = await update(editingId, formData);
      } else {
        result = await create(formData);
      }

      if (result) {
        notifications.show({
          title: 'Success',
          message: `Initiative ${editingId ? 'updated' : 'created'} successfully`,
          color: 'green'
        });

        resetForm();
        refetch();
      }
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'creating'} initiative:`, error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'An error occurred',
        color: 'red'
      });
    }
  };

  // ✅ MIGRATED: Centralized delete operation
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this initiative?')) return;

    try {
      const result = await remove(id);

      if (result) {
        notifications.show({
          title: 'Success',
          message: 'Initiative deleted successfully',
          color: 'green'
        });

        refetch();
      }
    } catch (error) {
      console.error('Error deleting initiative:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete initiative',
        color: 'red'
      });
    }
  };

  const handleEdit = (initiative: Initiative) => {
    setFormData({
      title: initiative.title,
      description: initiative.description,
      imageUrl: initiative.imageUrl || '',
      order: initiative.order
    });
    setEditingId(initiative.id);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    // Find the current initiative and its index
    const currentIndex = initiatives.findIndex(i => i.id === id);
    if (currentIndex === -1) return;

    // Check if we can move in the requested direction
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === initiatives.length - 1)
    ) {
      return;
    }

    try {
      // Get the adjacent initiative
      const adjacentIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const currentInitiative = initiatives[currentIndex];
      const adjacentInitiative = initiatives[adjacentIndex];

      // Swap their order values
      const response1 = await fetch(`/api/initiatives/${currentInitiative.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentInitiative,
          order: adjacentInitiative.order
        }),
      });

      const response2 = await fetch(`/api/initiatives/${adjacentInitiative.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...adjacentInitiative,
          order: currentInitiative.order
        }),
      });

      if (!response1.ok || !response2.ok) {
        throw new Error('Failed to reorder initiatives');
      }

      refetch();
    } catch (error) {
      console.error('Error reordering initiatives:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to reorder initiatives',
        color: 'red'
      });
    }
  };

  return (
    <Container size="lg" py="md">
      <Title order={1} mb="lg">Manage Initiatives</Title>

      <Paper shadow="sm" p="md" mb="xl">
        <Title order={3} mb="md">{editingId ? 'Edit' : 'Create'} Initiative</Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Box>
              <Text size="sm" fw={500} mb={5}>Description</Text>
              <RichTextEditor editor={editor}>
                <RichTextEditor.Toolbar sticky stickyOffset={60}>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
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
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>

                <RichTextEditor.Content
                  style={{ minHeight: '300px' }}
                />
              </RichTextEditor>
            </Box>

            <Group grow align="flex-end">
              <TextInput
                label="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              <FileButton
                onChange={onImageUpload}
                accept="image/png,image/jpeg,image/gif,image/webp"
              >
                {(props) => (
                  <Button {...props} style={{ flex: 'none' }}>
                    Upload Image
                  </Button>
                )}
              </FileButton>
            </Group>

            {formData.imageUrl && (
              <Box>
                <Text size="sm" fw={500} mb={5}>Image Preview</Text>
                <Image
                  src={formData.imageUrl}
                  height={200}
                  fit="contain"
                  alt="Preview"
                  radius="md"
                />
              </Box>
            )}

            <NumberInput
              label="Display Order"
              value={formData.order}
              onChange={(value) => setFormData({ ...formData, order: Number(value) || 0 })}
            />

            <Group justify="apart">
              <Button variant="subtle" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {editingId ? 'Update' : 'Create'} Initiative
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      <Title order={2} mb="md">Initiatives List</Title>

      {initiatives.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">No initiatives found. Create one above.</Text>
      ) : (
        <Stack gap="md">
          {initiatives
            .sort((a, b) => a.order - b.order)
            .map((initiative) => (
              <Card key={initiative.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="apart" mb="md">
                  <Title order={4}>{initiative.title}</Title>
                  <Group gap={8}>
                    <ActionIcon
                      color="gray"
                      onClick={() => handleReorder(initiative.id, 'up')}
                    >
                      <IconArrowUp size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="gray"
                      onClick={() => handleReorder(initiative.id, 'down')}
                    >
                      <IconArrowDown size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="blue"
                      onClick={() => handleEdit(initiative)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      onClick={() => handleDelete(initiative.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                <Group justify="apart" align="flex-start" gap="lg">
                  {initiative.imageUrl && (
                    <Image
                      src={initiative.imageUrl}
                      width={150}
                      height={100}
                      radius="md"
                      fit="cover"
                      alt={initiative.title}
                    />
                  )}
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" lineClamp={3}
                      dangerouslySetInnerHTML={{
                        __html: initiative.description.length > 200
                          ? initiative.description.substring(0, 200) + '...'
                          : initiative.description
                      }}
                    />
                  </Box>
                </Group>
              </Card>
            ))}
        </Stack>
      )}
    </Container>
  );
}
