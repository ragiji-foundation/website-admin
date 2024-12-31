'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

interface TaxonomyItem {
  id: number;
  name: string;
  slug: string;
}

// Create a separate component for the main content
function TaxonomyContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'categories';
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', slug: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/${type}`);
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [type, fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) throw new Error(`Failed to create ${type.slice(0, -1)}`);

      notifications.show({
        title: 'Success',
        message: `${type.slice(0, -1)} created successfully`,
        color: 'green',
      });

      setNewItem({ name: '', slug: '' });
      fetchItems();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create item',
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;

    try {
      const response = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`Failed to delete ${type.slice(0, -1)}`);

      notifications.show({
        title: 'Success',
        message: `${type.slice(0, -1)} deleted successfully`,
        color: 'green',
      });

      fetchItems();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete item',
        color: 'red',
      });
    }
  };

  return (
    <Container size="lg">
      <LoadingOverlay visible={isLoading} />

      <Title order={1} mb="xl">
        Manage {type.charAt(0).toUpperCase() + type.slice(1)}
      </Title>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            required
          />
          <TextInput
            label="Slug"
            value={newItem.slug}
            onChange={(e) => setNewItem({ ...newItem, slug: e.target.value })}
            required
          />
          <Button type="submit" leftSection={<IconPlus size={16} />}>
            Add {type.slice(0, -1)}
          </Button>
        </Stack>
      </form>

      <Table mt="xl">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Slug</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>{item.name}</Table.Td>
              <Table.Td>{item.slug}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => {/* Add edit functionality */ }}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => handleDelete(item.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}

// Main component with Suspense boundary
export default function TaxonomyPage() {
  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <TaxonomyContent />
    </Suspense>
  );
} 