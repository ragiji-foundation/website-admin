'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Paper,
  Title,
  Grid,
  ActionIcon,
  Select,
  Badge,
  Text,
  Modal,
  Switch,
  Card,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconEdit, IconSearch } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { generateSlug } from '@/utils/slug';
import LexicalEditor from '@/components/LexicalEditor';

interface Career {
  id: number;
  title: string;
  slug: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'volunteer', label: 'Volunteer' },
];

interface EditorContent {
  json: any;
  isEmpty: boolean;
  text: string;
}

const isEmptyContent = (content: EditorContent | null | undefined): boolean => {
  if (!content) return true;
  return content.isEmpty || !content.text.trim();
};

interface FormData {
  title: string;
  location: string;
  type: string;
  description: EditorContent | null;
  requirements: EditorContent | null;
  isActive: boolean;
}

const initialFormData: FormData = {
  title: '',
  location: '',
  type: '',
  description: null,
  requirements: null,
  isActive: true,
};

const parseRichText = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    return parsed.root.children
      .map((p: any) => p.children
        .map((c: any) => c.text)
        .join('')
      )
      .join('\n');
  } catch (e) {
    return content;
  }
};

export default function CareersAdmin() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/careers');
      if (!response.ok) throw new Error('Failed to fetch careers');
      const data = await response.json();
      setCareers(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to fetch careers',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEmptyContent(formData.description) || isEmptyContent(formData.requirements)) {
      notifications.show({
        title: 'Validation Error',
        message: 'Description and Requirements are required',
        color: 'red'
      });
      return;
    }

    try {
      const slug = generateSlug(formData.title);
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? {
          ...formData,
          id: editingId,
          slug,
          description: formData.description?.json,
          requirements: formData.requirements?.json,
        }
        : {
          ...formData,
          slug,
          description: formData.description?.json,
          requirements: formData.requirements?.json,
        };

      const response = await fetch('/api/careers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save career');

      notifications.show({
        title: 'Success',
        message: `Career ${editingId ? 'updated' : 'created'} successfully`,
        color: 'green'
      });

      setFormData(initialFormData);
      setEditingId(null);
      close();
      fetchCareers();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save career',
        color: 'red'
      });
    }
  };

  const handleEdit = (career: Career) => {
    setFormData({
      title: career.title,
      location: career.location,
      type: career.type,
      description: typeof career.description === 'string'
        ? JSON.parse(career.description)
        : career.description,
      requirements: typeof career.requirements === 'string'
        ? JSON.parse(career.requirements)
        : career.requirements,
      isActive: career.isActive,
    });
    setEditingId(career.id);
    open();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this career?')) return;

    try {
      const response = await fetch(`/api/careers?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete career');

      notifications.show({
        title: 'Success',
        message: 'Career deleted successfully',
        color: 'green'
      });

      fetchCareers();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete career',
        color: 'red'
      });
    }
  };

  const filteredCareers = careers.filter(career =>
    career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    career.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    career.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Stack gap="xl">
      <Card shadow="sm" p="lg">
        <Group justify="space-between" mb="xl">
          <Title order={2}>Manage Careers</Title>
          <Button onClick={open}>Add New Position</Button>
        </Group>

        <TextInput
          rightSection={<IconSearch size={16} />}
          placeholder="Search careers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          mb="lg"
        />

        <Grid>
          {filteredCareers.map((career) => (
            <Grid.Col key={career.id} span={{ base: 12, md: 6 }}>
              <Paper shadow="xs" p="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Stack gap="xs">
                    <Title order={4}>{career.title}</Title>
                    <Group gap="xs">
                      <Text size="sm" c="dimmed">{career.location}</Text>
                      <Badge variant="light">{career.type}</Badge>
                      <Badge
                        color={career.isActive ? 'green' : 'gray'}
                        variant="light"
                      >
                        {career.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Group>
                  </Stack>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEdit(career)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(career.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
                <Text size="sm" lineClamp={2} mb="xs">
                  {parseRichText(career.description)}
                </Text>
                <Text size="sm" c="dimmed">
                  Last updated: {new Date(career.updatedAt).toLocaleDateString()}
                </Text>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          setFormData(initialFormData);
          setEditingId(null);
          close();
        }}
        title={editingId ? "Edit Career" : "Add New Career"}
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Job Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextInput
              label="Location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Select
              label="Job Type"
              required
              data={JOB_TYPES}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value || '' })}
            />
            <LexicalEditor
              label="Description"
              required
              content={formData.description?.json || null}
              onChange={(content) => setFormData(prev => ({
                ...prev,
                description: content
              }))}
              error={isEmptyContent(formData.description) ? 'Description is required' : undefined}
            />
            <LexicalEditor
              label="Requirements"
              required
              content={formData.requirements?.json || null}
              onChange={(content) => setFormData(prev => ({
                ...prev,
                requirements: content
              }))}
              error={isEmptyContent(formData.requirements) ? 'Requirements are required' : undefined}
            />
            <Switch
              label="Active"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
            />
            <Group justify="flex-end">
              <Button variant="light" onClick={close}>Cancel</Button>
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}