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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { AdminPageLayout } from '@/components/Layout/AdminPageLayout';
import { formatDate } from '@/utils/formatDate';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { fetchWithError } from '@/utils/fetchWithError';


interface Career {
  id: number;
  title: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  isActive: boolean;
  createdAt: string;
}

const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'volunteer', label: 'Volunteer' },
];

export default function CareersAdmin() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: '',
    description: '',
    requirements: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCareers();
  }, []);

  const validateForm = (data: typeof formData) => {
    const errors: Record<string, string> = {};

    if (!data.title.trim()) errors.title = 'Title is required';
    if (!data.location.trim()) errors.location = 'Location is required';
    if (!data.type) errors.type = 'Job type is required';
    if (!data.description.trim()) errors.description = 'Description is required';
    if (!data.requirements.trim()) errors.requirements = 'Requirements are required';

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const fetchCareers = async () => {
    try {
      const data = await fetchWithError<Career[]>('/api/careers');
      setCareers(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to fetch careers',
        color: 'red'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (errors) {
      Object.entries(errors).forEach(([field, message]) => {
        notifications.show({
          title: 'Validation Error',
          message: `${field}: ${message}`,
          color: 'red'
        });
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchWithError('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      notifications.show({
        title: 'Success',
        message: 'Career created successfully',
        color: 'green'
      });

      setFormData({
        title: '',
        location: '',
        type: '',
        description: '',
        requirements: '',
      });

      fetchCareers();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create career',
        color: 'red'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
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
      console.error('Error deleting career:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete career',
        color: 'red'
      });
    }
  };

  return (
    <ErrorBoundary>
      <AdminPageLayout>
        <Title order={2} mb="lg">Manage Careers</Title>

        <Grid>
          <Grid.Col span={7}>
            <Paper shadow="sm" p="md">
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
                  <Group justify="flex-end">
                    <Button type="submit" loading={isSubmitting}>
                      Add Career
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>
          </Grid.Col>

          <Grid.Col span={5}>
            <Paper shadow="sm" p="md">
              <Title order={3} mb="md">Active Positions</Title>
              <Stack>
                {careers.map((item) => (
                  <Paper key={item.id} shadow="xs" p="sm">
                    <Group justify="space-between" mb="xs">
                      <div>
                        <Title order={4}>{item.title}</Title>
                        <Group gap="xs">
                          <Text size="sm" color="dimmed">{item.location}</Text>
                          <Badge>{item.type}</Badge>
                        </Group>
                      </div>
                      <Group gap="xs">
                        <ActionIcon
                          color="blue"
                          onClick={() => {/* TODO: Implement edit */ }}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          onClick={() => handleDelete(item.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                    <Text size="sm" mb="xs">
                      Posted on: {formatDate(item.createdAt)}
                    </Text>
                    <Text size="sm" mb="xs" lineClamp={3}>
                      {item.description}
                    </Text>
                    <Text size="sm" color="dimmed" lineClamp={2}>
                      Requirements: {item.requirements}
                    </Text>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      </AdminPageLayout>
    </ErrorBoundary>
  );
} 