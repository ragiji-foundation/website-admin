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
  FileInput,
  Select,
  NumberInput,
  ActionIcon,
  Modal,
  Tabs,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { LexicalEditor } from '@/components/LexicalEditor';

interface Feature {
  id: string;
  title: string;
  description: any;
  mediaType: 'video' | 'image';
  mediaUrl: string;
  thumbnail?: string;
  order: number;
  section: string;
}

interface FeatureSection {
  id: string;
  identifier: string;
  heading: string;
  ctaText: string;
  ctaUrl: string;
}

export default function FeaturesManagementPage() {
  const [sections, setSections] = useState<FeatureSection[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [activeTab, setActiveTab] = useState<string>('features');

  const form = useForm({
    initialValues: {
      title: '',
      description: {},
      mediaType: 'image' as 'image' | 'video',
      mediaUrl: '',
      thumbnail: '',
      order: 0,
      section: '',
    },
  });

  const sectionForm = useForm({
    initialValues: {
      identifier: '',
      heading: '',
      ctaText: '',
      ctaUrl: '',
    },
  });

  useEffect(() => {
    fetchSections();
    fetchFeatures();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/features/sections');
      if (!response.ok) throw new Error('Failed to fetch sections');
      const data = await response.json();
      setSections(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch sections',
        color: 'red',
      });
    }
  };

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/features');
      if (!response.ok) throw new Error('Failed to fetch features');
      const data = await response.json();
      setFeatures(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch features',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const url = editingFeature
        ? `/api/features/${editingFeature.id}`
        : '/api/features';

      const method = editingFeature ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Failed to save feature');

      await fetchFeatures();
      setModalOpened(false);
      form.reset();
      setEditingFeature(null);

      notifications.show({
        title: 'Success',
        message: `Feature ${editingFeature ? 'updated' : 'created'} successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save feature',
        color: 'red',
      });
    }
  };

  return (
    <Container size="xl" py="xl">
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as string)}>
        <Tabs.List>
          <Tabs.Tab value="features">Features</Tabs.Tab>
          <Tabs.Tab value="sections">Sections</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="features">
          <Group justify="space-between" mb="xl">
            <Title>Features Management</Title>
            <Button
              leftSection={<IconPlus size={14} />}
              onClick={() => setModalOpened(true)}
            >
              Add Feature
            </Button>
          </Group>

          <Stack gap="md">
            {features.map((feature) => (
              <Card key={feature.id} withBorder>
                <Group justify="space-between">
                  <Stack gap="xs">
                    <Text fw={500}>{feature.title}</Text>
                    <Text size="sm" c="dimmed">
                      Section: {feature.section}
                    </Text>
                  </Stack>
                  <Group>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => {
                        setEditingFeature(feature);
                        form.setValues(feature);
                        setModalOpened(true);
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={async () => {
                        if (!confirm('Are you sure?')) return;
                        try {
                          await fetch(`/api/features/${feature.id}`, {
                            method: 'DELETE',
                          });
                          await fetchFeatures();
                          notifications.show({
                            title: 'Success',
                            message: 'Feature deleted successfully',
                            color: 'green',
                          });
                        } catch (error) {
                          notifications.show({
                            title: 'Error',
                            message: 'Failed to delete feature',
                            color: 'red',
                          });
                        }
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>
        </Tabs.Panel>

        {/* Add Sections Panel implementation here */}
      </Tabs>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingFeature(null);
          form.reset();
        }}
        title={editingFeature ? 'Edit Feature' : 'Add New Feature'}
        size="xl"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Title"
              required
              {...form.getInputProps('title')}
            />
            <Select
              label="Section"
              required
              data={sections.map(s => ({ value: s.identifier, label: s.heading }))}
              {...form.getInputProps('section')}
            />
            <NumberInput
              label="Order"
              {...form.getInputProps('order')}
            />
            <Select
              label="Media Type"
              required
              data={[
                { value: 'image', label: 'Image' },
                { value: 'video', label: 'Video' },
              ]}
              {...form.getInputProps('mediaType')}
            />
            <TextInput
              label="Media URL"
              required
              {...form.getInputProps('mediaUrl')}
            />
            {form.values.mediaType === 'video' && (
              <TextInput
                label="Thumbnail URL"
                {...form.getInputProps('thumbnail')}
              />
            )}
            <Stack gap="xs">
              <Text size="sm" fw={500}>Description</Text>
              <LexicalEditor
                initialValue={form.values.description}
                onChange={(value) => form.setFieldValue('description', value)}
              />
            </Stack>
            <Button type="submit">
              {editingFeature ? 'Update Feature' : 'Create Feature'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
