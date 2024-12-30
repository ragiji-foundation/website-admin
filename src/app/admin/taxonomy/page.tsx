'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Tabs,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Table,
  ActionIcon,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface TaxonomyItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    blogs: number;
  };
}

interface ApiError {
  message: string;
  status?: number;
}

export default function TaxonomyPage() {
  const [activeTab, setActiveTab] = useState<string | null>('categories');
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch(`/api/${activeTab}`);
      if (!response.ok) throw new Error(`Failed to fetch ${activeTab}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : `Failed to fetch ${activeTab}`,
        color: 'red',
      });
    }
  }, [activeTab]);

  useEffect(() => {
    fetchItems();
  }, [activeTab, fetchItems]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/${activeTab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(`Failed to create ${activeTab}`);

      notifications.show({
        title: 'Success',
        message: `${activeTab} created successfully`,
        color: 'green',
      });

      setFormData({ name: '', slug: '', description: '' });
      fetchItems();
    } catch (error) {
      console.error('Error creating item:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : `Failed to create ${activeTab}`,
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab?.slice(0, -1)}?`)) return;

    try {
      const response = await fetch(`/api/${activeTab}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`Failed to delete ${activeTab}`);

      notifications.show({
        title: 'Success',
        message: `${activeTab} deleted successfully`,
        color: 'green',
      });

      fetchItems();
    } catch (error) {
      const err = error as Error | ApiError;
      notifications.show({
        title: 'Error',
        message: `Failed to delete ${activeTab}: ${err.message}`,
        color: 'red',
      });
    }
  };

  return (
    <Container size="xl">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="categories">Categories</Tabs.Tab>
          <Tabs.Tab value="tags">Tags</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={activeTab || 'categories'}>
          <Stack gap="lg" mt="xl">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <Stack gap="md">
                <TextInput
                  label="Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  }))}
                />
                <TextInput
                  label="Slug"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    slug: e.target.value,
                  }))}
                />
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))}
                />
                <Button type="submit">
                  Create {activeTab?.slice(0, -1)}
                </Button>
              </Stack>
            </form>

            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Posts</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.slug}</td>
                    <td>{item._count.blogs}</td>
                    <td>
                      <Group gap="xs">
                        <ActionIcon
                          color="blue"
                          onClick={() => {/* Implement edit */ }}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
} 