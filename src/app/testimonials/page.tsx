'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Button,
  Group,
  Stack,
  Paper,
  Table,
  Modal,
  Select,
  Switch,
  ActionIcon,
  Badge,
  Text,
  Avatar,
  Card
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { BilingualInput, BilingualRichText } from '@/components/BilingualInput';

interface Testimonial {
  id: number;
  name: string;
  nameHi?: string;
  role: string;
  roleHi?: string;
  content: string;
  contentHi?: string;
  avatar?: string;
  isPublished: boolean;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      nameHi: '',
      role: '',
      roleHi: '',
      content: '',
      contentHi: '',
      avatar: '',
      isPublished: false
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      role: (value) => (!value ? 'Role is required' : null),
      content: (value) => (!value ? 'Content is required' : null),
    },
  });

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      const data = await response.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const url = editingTestimonial 
        ? `/api/testimonials/${editingTestimonial.id}`
        : '/api/testimonials';
      
      const method = editingTestimonial ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: editingTestimonial 
            ? 'Testimonial updated successfully' 
            : 'Testimonial created successfully',
          color: 'green'
        });
        fetchTestimonials();
        handleCloseModal();
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to save testimonial',
        color: 'red'
      });
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    form.setValues({
      name: testimonial.name,
      nameHi: testimonial.nameHi || '',
      role: testimonial.role,
      roleHi: testimonial.roleHi || '',
      content: testimonial.content,
      contentHi: testimonial.contentHi || '',
      avatar: testimonial.avatar || '',
      isPublished: testimonial.isPublished
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: 'Testimonial deleted successfully',
          color: 'green'
        });
        fetchTestimonials();
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to delete testimonial',
        color: 'red'
      });
    }
  };

  const handleCloseModal = () => {
    setEditingTestimonial(null);
    form.reset();
    close();
  };

  const getTranslationStatus = (testimonial: Testimonial) => {
    const hasHindi = testimonial.nameHi && testimonial.roleHi && testimonial.contentHi;
    return hasHindi ? 'complete' : 'partial';
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Testimonials Management</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add Testimonial
        </Button>
      </Group>

      {/* Statistics */}
      <Group mb="lg">
        <Card withBorder>
          <Text size="lg" fw={700}>{testimonials.length}</Text>
          <Text size="sm" c="dimmed">Total Testimonials</Text>
        </Card>
        <Card withBorder>
          <Text size="lg" fw={700} c="green">
            {testimonials.filter(t => t.isPublished).length}
          </Text>
          <Text size="sm" c="dimmed">Published</Text>
        </Card>
        <Card withBorder>
          <Text size="lg" fw={700} c="blue">
            {testimonials.filter(t => getTranslationStatus(t) === 'complete').length}
          </Text>
          <Text size="sm" c="dimmed">Fully Translated</Text>
        </Card>
      </Group>

      {/* Testimonials Table */}
      <Paper withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Person</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Content Preview</Table.Th>
              <Table.Th>Translation Status</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {testimonials.map((testimonial) => (
              <Table.Tr key={testimonial.id}>
                <Table.Td>
                  <Group>
                    <Avatar src={testimonial.avatar} radius="xl" />
                    <div>
                      <Text fw={500}>{testimonial.name}</Text>
                      {testimonial.nameHi && (
                        <Text size="sm" c="dimmed" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                          {testimonial.nameHi}
                        </Text>
                      )}
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <div>
                    <Text>{testimonial.role}</Text>
                    {testimonial.roleHi && (
                      <Text size="sm" c="dimmed" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                        {testimonial.roleHi}
                      </Text>
                    )}
                  </div>
                </Table.Td>
                <Table.Td>
                  <Text lineClamp={2} maw={200}>
                    {testimonial.content}
                  </Text>
                  {testimonial.contentHi && (
                    <Text size="sm" c="dimmed" lineClamp={1} style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                      {testimonial.contentHi}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Badge 
                    color={getTranslationStatus(testimonial) === 'complete' ? 'green' : 'orange'}
                    size="sm"
                  >
                    {getTranslationStatus(testimonial) === 'complete' ? 'Complete' : 'Partial'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={testimonial.isPublished ? 'green' : 'gray'} size="sm">
                    {testimonial.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="light" color="blue" onClick={() => handleEdit(testimonial)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="red" onClick={() => handleDelete(testimonial.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Add/Edit Modal */}
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <BilingualInput
              label="Person Name"
              required
              valueEn={form.values.name}
              valueHi={form.values.nameHi}
              onChangeEn={(value) => form.setFieldValue('name', value)}
              onChangeHi={(value) => form.setFieldValue('nameHi', value)}
              placeholder="Enter person's name"
              placeholderHi="व्यक्ति का नाम दर्ज करें"
              error={form.errors.name as string}
            />

            <BilingualInput
              label="Role/Position"
              required
              valueEn={form.values.role}
              valueHi={form.values.roleHi}
              onChangeEn={(value) => form.setFieldValue('role', value)}
              onChangeHi={(value) => form.setFieldValue('roleHi', value)}
              placeholder="e.g., CEO, Director, Volunteer"
              placeholderHi="जैसे: सीईओ, निदेशक, स्वयंसेवक"
              error={form.errors.role as string}
            />

            <BilingualRichText
              label="Testimonial Content"
              required
              valueEn={form.values.content}
              valueHi={form.values.contentHi}
              onChangeEn={(value) => form.setFieldValue('content', value)}
              onChangeHi={(value) => form.setFieldValue('contentHi', value)}
              error={form.errors.content as string}
              description="The testimonial quote or review"
            />

            <BilingualInput
              label="Avatar URL"
              valueEn={form.values.avatar}
              valueHi=""
              onChangeEn={(value) => form.setFieldValue('avatar', value)}
              onChangeHi={() => {}}
              placeholder="https://example.com/avatar.jpg"
              description="URL to person's photo (optional)"
            />

            <Switch
              label="Publish testimonial"
              description="Make this testimonial visible on the website"
              checked={form.values.isPublished}
              onChange={(event) => form.setFieldValue('isPublished', event.currentTarget.checked)}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTestimonial ? 'Update' : 'Create'} Testimonial
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}