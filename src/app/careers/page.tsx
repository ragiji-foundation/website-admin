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

const initialFormData = {
  title: '',
  location: '',
  type: '',
  description: '',
  requirements: '',
  isActive: true,
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

    try {
      const slug = generateSlug(formData.title);
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/careers/${editingId}` : '/api/careers';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, slug }),
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
      description: career.description,
      requirements: career.requirements,
      isActive: career.isActive,
    });
    setEditingId(career.id);
    open();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this career?')) return;

    try {
      const response = await fetch(`/api/careers/${id}`, {
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
          icon={<IconSearch size={16} />}
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
                  {career.description}
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
        size="lg"
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
            <Textarea
              label="Description"
              required
              minRows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Textarea
              label="Requirements"
              required
              minRows={4}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
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