'use client';

import { useState } from 'react';
import {
  Container,
  Title,
  TextInput,
  Button,
  Group,
  Stack,
  Table,
  ActionIcon,
  LoadingOverlay,
  Alert,
  Modal,
  Avatar,
  Text,
  Badge,
  Paper,
  FileButton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus, IconEye, IconUpload } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { format } from 'date-fns';

// ✅ MIGRATED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

interface Author {
  id: number;
  name: string;
  username?: string;
  email: string;
  image?: string | null;
  blogCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function AuthorsManagement() {
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    image: '',
    password: ''
  });

  // ✅ MIGRATED: Use centralized data fetching and operations
  const { data: authors = [], loading, error, refetch } = useApiData<Author[]>('/api/authors', []);
  const { create, update, remove } = useCrudOperations<Author>('/api/authors');

  // ✅ MIGRATED: Centralized form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submissionData = {
        name: formData.name,
        username: formData.username || formData.email.split('@')[0],
        email: formData.email,
        image: formData.image || null,
        ...(editingAuthor ? {} : { password: formData.password })
      };

      let result;
      if (editingAuthor) {
        result = await update(editingAuthor.id, submissionData);
      } else {
        result = await create(submissionData);
      }

      if (result) {
        notifications.show({
          title: 'Success',
          message: `Author ${editingAuthor ? 'updated' : 'created'} successfully`,
          color: 'green',
        });

        resetForm();
        close();
        refetch();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save author',
        color: 'red',
      });
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      username: author.username || '',
      email: author.email,
      image: author.image || '',
      password: ''
    });
    open();
  };

  // ✅ MIGRATED: Centralized delete operation
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const result = await remove(id);

      if (result) {
        notifications.show({
          title: 'Success',
          message: 'Author deleted successfully',
          color: 'green',
        });

        refetch();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete author',
        color: 'red',
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', username: '', email: '', image: '', password: '' });
    setEditingAuthor(null);
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const { url } = await response.json();
      setFormData(prev => ({ ...prev, image: url }));
      
      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red'
      });
    }
  };

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />

      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1}>Authors Management</Title>
          <Text c="dimmed" size="lg">Manage blog authors and writers</Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            resetForm();
            open();
          }}
        >
          Add New Author
        </Button>
      </Group>

      {error && (
        <Alert color="red" mb="md">
          {error.message}
        </Alert>
      )}

      <Paper shadow="xs" p="md" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Author</Table.Th>
              <Table.Th>Username</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Blog Count</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {authors.map((author) => (
              <Table.Tr key={author.id}>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar
                      src={author.image}
                      alt={author.name}
                      size="sm"
                      radius="xl"
                    />
                    <Text fw={500}>{author.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">@{author.username}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{author.email}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color="blue">
                    {author.blogCount || 0} blogs
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {format(new Date(author.createdAt), 'MMM dd, yyyy')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEdit(author)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(author.id, author.name)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {authors.length === 0 && !loading && (
          <Text ta="center" c="dimmed" py="xl">
            No authors found. Add your first author to get started.
          </Text>
        )}
      </Paper>

      <Modal
        opened={opened}
        onClose={() => {
          resetForm();
          close();
        }}
        title={editingAuthor ? "Edit Author" : "Add New Author"}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter author's full name"
            />
            
            <TextInput
              label="Username"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter username (or auto-generated from email)"
            />
            
            <TextInput
              label="Email"
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter author's email"
            />

            {!editingAuthor && (
              <TextInput
                label="Password"
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter temporary password"
              />
            )}

            <div>
              <Text size="sm" fw={500} mb="xs">Profile Image</Text>
              <Group>
                <TextInput
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{ flex: 1 }}
                />
                <FileButton
                  onChange={handleImageUpload}
                  accept="image/png,image/jpeg,image/gif,image/webp"
                >
                  {(props) => (
                    <Button {...props} variant="light" leftSection={<IconUpload size={16} />}>
                      Upload
                    </Button>
                  )}
                </FileButton>
              </Group>
              {formData.image && (
                <Avatar
                  src={formData.image}
                  size="lg"
                  mt="sm"
                  radius="md"
                />
              )}
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => { resetForm(); close(); }}>
                Cancel
              </Button>
              <Button type="submit">
                {editingAuthor ? 'Update Author' : 'Add Author'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}