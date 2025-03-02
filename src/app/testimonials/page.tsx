'use client';

import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Grid,
  Card,
  Text,
  Avatar,
  Group,
  Stack,
  Skeleton,
  Alert,
  Button,
  Modal,
  TextInput,
  Textarea,
  ActionIcon,
  Tabs,
  Paper,
  Blockquote,
  rem,
} from '@mantine/core';
import { IconAlertCircle, IconPlus, IconTrash, IconQuote } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';

type Testimonial = {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
};

interface TestimonialFormData {
  name: string;
  role: string;
  content: string;
  avatar?: string;
}

const initialFormData: TestimonialFormData = {
  name: '',
  role: '',
  content: '',
  avatar: '',
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(initialFormData);
  const [opened, { open, close }] = useDisclosure(false);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/testimonials');
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }
      const data = await response.json();
      setTestimonials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Validate form data
      if (!formData.name.trim() || !formData.role.trim() || !formData.content.trim()) {
        notifications.show({
          title: 'Error',
          message: 'Please fill in all required fields',
          color: 'red',
        });
        return;
      }

      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Only include avatar if it's not empty
          avatar: formData.avatar?.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create testimonial');
      }

      notifications.show({
        title: 'Success',
        message: 'Testimonial created successfully',
        color: 'green',
      });

      setFormData(initialFormData);
      close();
      await fetchTestimonials();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to create testimonial',
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const response = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete testimonial');

      notifications.show({
        title: 'Success',
        message: 'Testimonial deleted successfully',
        color: 'green',
      });

      fetchTestimonials();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to delete testimonial',
        color: 'red',
      });
    }
  };

  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group>
            <Avatar
              src={testimonial.avatar}
              alt={testimonial.name}
              size="xl"
              radius="xl"
              onError={(e) => {
                // Fallback to initials if avatar fails to load
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  testimonial.name
                )}&background=random`;
              }}
            />
            <div>
              <Text size="lg" fw={500}>
                {testimonial.name}
              </Text>
              <Text size="sm" c="dimmed">
                {testimonial.role}
              </Text>
            </div>
          </Group>
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => handleDelete(testimonial.id)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
        <Text size="sm" style={{ lineHeight: 1.6 }}>
          {testimonial.content}
        </Text>
      </Stack>
    </Card>
  );

  const PublicView = () => (
    <Stack gap="xl">
      <Paper p="xl" radius="md" withBorder>
        <Title order={2} ta="center" mb="xl">What Our Community Says</Title>
        <Grid>
          {testimonials.map((testimonial) => (
            <Grid.Col key={testimonial.id} span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" padding="xl" radius="md" withBorder>
                <Stack gap="lg">
                  <IconQuote
                    style={{
                      width: rem(30),
                      height: rem(30),
                      color: 'var(--mantine-color-blue-filled)'
                    }}
                  />
                  <Blockquote color="blue">
                    {testimonial.content}
                  </Blockquote>
                  <Group>
                    <Avatar
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      size="lg"
                      radius="xl"
                      onError={(e) => {
                        // Fallback to initials if avatar fails to load
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          testimonial.name
                        )}&background=random`;
                      }}
                    />
                    <div>
                      <Text size="sm" fw={500}>
                        {testimonial.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {testimonial.role}
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Paper>
    </Stack>
  );

  const AdminView = () => (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Manage Testimonials</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={open}
        >
          Add Testimonial
        </Button>
      </Group>

      <Grid>
        {testimonials.map((testimonial) => (
          <Grid.Col key={testimonial.id} span={{ base: 12, md: 6, lg: 4 }}>
            <TestimonialCard testimonial={testimonial} />
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Title order={1} mb="xl">Testimonials</Title>
        <Grid>
          {[1, 2, 3].map((index) => (
            <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Skeleton height={64} circle mb="md" />
                <Skeleton height={20} width="40%" mb="sm" />
                <Skeleton height={15} width="30%" mb="lg" />
                <Skeleton height={50} mb="sm" />
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="filled"
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Testimonials</Title>

      <Tabs defaultValue="public">
        <Tabs.List mb="xl">
          <Tabs.Tab value="public">Public View</Tabs.Tab>
          <Tabs.Tab value="admin">Admin View</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="public">
          <PublicView />
        </Tabs.Panel>

        <Tabs.Panel value="admin">
          <AdminView />
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={opened}
        onClose={() => {
          setFormData(initialFormData);
          close();
        }}
        title="Add New Testimonial"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              error={formData.name.trim() === '' ? 'Name is required' : null}
            />
            <TextInput
              label="Role"
              required
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              error={formData.role.trim() === '' ? 'Role is required' : null}
            />
            <TextInput
              label="Avatar URL (optional)"
              value={formData.avatar || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              placeholder="https://example.com/avatar.jpg"
            />
            <Textarea
              label="Content"
              required
              minRows={4}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              error={formData.content.trim() === '' ? 'Content is required' : null}
            />
            <Group justify="flex-end">
              <Button variant="light" onClick={close}>Cancel</Button>
              <Button type="submit">Create</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}