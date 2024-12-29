'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Text,
  Paper,
  Title,
  Badge,
  Group,
  Stack,
  ActionIcon,
  Button,
  Modal,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconEdit, IconTrash } from '@tabler/icons-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    avatar: '',
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    try {
      const response = await fetch('/api/testimonials');
      const data = await response.json();

      if (Array.isArray(data)) {
        setTestimonials(data);
      } else {
        console.error('Expected array of testimonials, got:', data);
        setTestimonials([]);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      avatar: testimonial.avatar,
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await fetch(`/api/testimonials/${id}`, {
          method: 'DELETE',
        });
        await fetchTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingTestimonial ? 'PUT' : 'POST';
      const url = editingTestimonial
        ? `/api/testimonials/${editingTestimonial.id}`
        : '/api/testimonials';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      close();
      setEditingTestimonial(null);
      setFormData({ name: '', role: '', content: '', avatar: '' });
      await fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Stack p="xl">
      <Group justify="space-between" align="center">
        <Title order={2}>Testimonials Management</Title>
        <Group>
          <Badge size="lg">{testimonials.length} Total</Badge>
          <Button onClick={open}>Add New Testimonial</Button>
        </Group>
      </Group>

      <Paper shadow="sm" p="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Content</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Array.isArray(testimonials) && testimonials.length > 0 ? (
              testimonials.map((testimonial) => (
                <Table.Tr key={testimonial.id}>
                  <Table.Td>
                    <Text size="sm">{testimonial.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{testimonial.role}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={2}>
                      {testimonial.content}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group>
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(testimonial)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(testimonial.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text ta="center" c="dimmed">
                    No testimonials found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={opened}
        onClose={close}
        title={editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextInput
              label="Role"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
            <Textarea
              label="Content"
              required
              minRows={3}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            <TextInput
              label="Avatar URL"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            />
            <Button type="submit">
              {editingTestimonial ? 'Update' : 'Add'} Testimonial
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
} 