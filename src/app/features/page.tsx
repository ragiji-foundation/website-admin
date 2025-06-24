'use client';

import { useState, useEffect } from 'react';
import {
  Title,
  Group,
  Button,
  Text,
  Card,
  LoadingOverlay,
  Alert,
  ActionIcon,
  Menu,
  Modal,
  Badge,
  TextInput,
  Table,
  Pagination,
  ScrollArea,
  useMantineTheme,
  Box,
  Center,
  Checkbox,
  Stack
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconDots,
  IconArrowUp,
  IconArrowDown,
  IconSortAscending,
  IconSortDescending
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define Feature type without external dependencies
interface MediaItem {
  type: 'video' | 'image';
  url: string;
  thumbnail?: string;
}

interface Feature {
  id: string;
  title: string;
  titleHi?: string;
  descriptionHi?: any;
  description: any;
  mediaItem: MediaItem;
  slug?: string;
  order?: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// Sorting interface
interface SortState {
  column: keyof Feature | null;
  direction: 'asc' | 'desc';
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [featureToDelete, setFeatureToDelete] = useState<Feature | null>(null);
  const [confirmDeleteOpened, { open: openConfirmDelete, close: closeConfirmDelete }] = useDisclosure(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortState, setSortState] = useState<SortState>({ column: 'order', direction: 'asc' });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const router = useRouter();
  const theme = useMantineTheme();

  useEffect(() => {
    fetchFeatures();
  }, []);

  async function fetchFeatures() {
    try {
      setLoading(true);
      const response = await fetch('/api/features');

      if (!response.ok) {
        throw new Error('Failed to fetch features');
      }

      const data = await response.json();
      setFeatures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      notifications.show({
        title: 'Error',
        message: 'Failed to load features',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(feature: Feature) {
    try {
      const response = await fetch(`/api/features/${feature.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete feature');
      }

      notifications.show({
        title: 'Success',
        message: 'Feature deleted successfully',
        color: 'green'
      });

      // Remove the deleted feature from the list
      setFeatures(features.filter(f => f.id !== feature.id));
      closeConfirmDelete();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to delete feature',
        color: 'red'
      });
    }
  }

  async function handleReorder(featureId: string, direction: 'up' | 'down') {
    try {
      const currentIndex = features.findIndex(f => f.id === featureId);
      if (
        (direction === 'up' && currentIndex === 0) ||
        (direction === 'down' && currentIndex === features.length - 1)
      ) {
        return; // Already at the top or bottom
      }

      const newFeatures = [...features];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      // Swap the order values
      const currentOrder = newFeatures[currentIndex].order || 0;
      const targetOrder = newFeatures[targetIndex].order || 0;

      // Update the feature with the new order
      const updatedFeature = { ...newFeatures[currentIndex], order: targetOrder };
      const response = await fetch(`/api/features/${featureId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFeature),
      });

      if (!response.ok) {
        throw new Error('Failed to update feature order');
      }

      // Also update the target feature's order
      const targetFeature = { ...newFeatures[targetIndex], order: currentOrder };
      const targetResponse = await fetch(`/api/features/${newFeatures[targetIndex].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetFeature),
      });

      if (!targetResponse.ok) {
        throw new Error('Failed to update feature order');
      }

      // Swap the features in the array
      [newFeatures[currentIndex], newFeatures[targetIndex]] =
        [newFeatures[targetIndex], newFeatures[currentIndex]];

      setFeatures(newFeatures);

      notifications.show({
        title: 'Success',
        message: 'Feature order updated',
        color: 'green'
      });
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to update feature order',
        color: 'red'
      });
    }
  }

  // Toggle feature selection
  const toggleFeatureSelection = (featureId: string) => {
    setSelectedFeatures(current =>
      current.includes(featureId)
        ? current.filter(id => id !== featureId)
        : [...current, featureId]
    );
  };

  // Toggle all features on current page
  const toggleAllFeatures = () => {
    if (selectedFeatures.length === paginatedData.length) {
      setSelectedFeatures([]);
    } else {
      setSelectedFeatures(paginatedData.map(feature => feature.id));
    }
  };

  // Filter features based on search query
  const filteredFeatures = features.filter(feature =>
    feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (feature.category && feature.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort features
  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    if (!sortState.column) return 0;

    const aValue = a[sortState.column];
    const bValue = b[sortState.column];

    let comparison = 0;
    if (aValue < bValue) {
      comparison = -1;
    } else if (aValue > bValue) {
      comparison = 1;
    }

    return sortState.direction === 'asc' ? comparison : -comparison;
  });

  // Handle sorting
  const handleSort = (column: keyof Feature) => {
    setSortState(current => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Pagination
  const totalPages = Math.ceil(sortedFeatures.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = sortedFeatures.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <LoadingOverlay visible={loading} />

      <Group justify="apart" mb="lg">
        <Title order={2}>Manage Features</Title>
        <Button
          component={Link}
          href="/features/new"
          rightSection={<IconPlus size={16} />}
        >
          Add New Feature
        </Button>
      </Group>

      {error ? (
        <Alert color="red" mb="lg">
          {error}
        </Alert>
      ) : (
        <>
          <Group justify="apart" mb="md">
            <TextInput
              placeholder="Search features..."
              rightSection={<IconSearch size={14} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ width: '60%' }}
            />
            <Text size="sm" color="dimmed">
              Total: {filteredFeatures.length} features
            </Text>
          </Group>

          {/* Custom table implementation */}
          <ScrollArea>
            <Table striped highlightOnHover mb="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 40 }}>
                    <Checkbox
                      checked={selectedFeatures.length === paginatedData.length && paginatedData.length > 0}
                      indeterminate={selectedFeatures.length > 0 && selectedFeatures.length < paginatedData.length}
                      onChange={toggleAllFeatures}
                    />
                  </Table.Th>
                  <Table.Th style={{ width: 80, cursor: 'pointer' }} onClick={() => handleSort('order')}>
                    <Group gap="xs" wrap="nowrap">
                      Order
                      {sortState.column === 'order' && (
                        sortState.direction === 'asc' ?
                          <IconSortAscending size={14} /> :
                          <IconSortDescending size={14} />
                      )}
                    </Group>
                  </Table.Th>
                  <Table.Th style={{ width: 250, cursor: 'pointer' }} onClick={() => handleSort('title')}>
                    <Group gap="xs" wrap="nowrap">
                      Title
                      {sortState.column === 'title' && (
                        sortState.direction === 'asc' ?
                          <IconSortAscending size={14} /> :
                          <IconSortDescending size={14} />
                      )}
                    </Group>
                  </Table.Th>
                  <Table.Th style={{ width: 150, cursor: 'pointer' }} onClick={() => handleSort('category')}>
                    <Group gap="xs" wrap="nowrap">
                      Category
                      {sortState.column === 'category' && (
                        sortState.direction === 'asc' ?
                          <IconSortAscending size={14} /> :
                          <IconSortDescending size={14} />
                      )}
                    </Group>
                  </Table.Th>
                  <Table.Th style={{ width: 150, cursor: 'pointer' }} onClick={() => handleSort('createdAt')}>
                    <Group gap="xs" wrap="nowrap">
                      Created
                      {sortState.column === 'createdAt' && (
                        sortState.direction === 'asc' ?
                          <IconSortAscending size={14} /> :
                          <IconSortDescending size={14} />
                      )}
                    </Group>
                  </Table.Th>
                  <Table.Th style={{ width: 150 }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedData.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Center py="md">
                        <Text c="dimmed">No features found</Text>
                      </Center>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  paginatedData.map((feature) => (
                    <Table.Tr key={feature.id}>
                      <Table.Td>
                        <Checkbox
                          checked={selectedFeatures.includes(feature.id)}
                          onChange={() => toggleFeatureSelection(feature.id)}
                        />
                      </Table.Td>
                      <Table.Td>{feature.order || '-'}</Table.Td>
                      <Table.Td>{feature.title}</Table.Td>
                      <Table.Td>
                        {feature.category ? (
                          <Badge color="blue" variant="light">
                            {feature.category}
                          </Badge>
                        ) : '-'}
                      </Table.Td>
                      <Table.Td>{new Date(feature.createdAt).toLocaleDateString()}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => router.push(`/features/${feature.id}`)}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => {
                              setFeatureToDelete(feature);
                              openConfirmDelete();
                            }}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                          <Menu position="bottom-end" shadow="md">
                            <Menu.Target>
                              <ActionIcon variant="light">
                                <IconDots size={18} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconArrowUp size={14} />}
                                onClick={() => handleReorder(feature.id, 'up')}
                              >
                                Move Up
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconArrowDown size={14} />}
                                onClick={() => handleReorder(feature.id, 'down')}
                              >
                                Move Down
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination
                total={totalPages}
                value={page}
                onChange={setPage}
              />
            </Group>
          )}

          {/* Bulk actions for selected features */}
          {selectedFeatures.length > 0 && (
            <Box
              style={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: theme.colors.dark[7],
                padding: theme.spacing.sm,
                borderRadius: theme.radius.sm,
                marginTop: theme.spacing.md,
              }}
            >
              <Group justify="apart">
                <Text>{selectedFeatures.length} feature(s) selected</Text>
                <Button
                  color="red"
                  variant="light"
                  onClick={() => {
                    // Implement bulk delete functionality
                    notifications.show({
                      title: 'Not Implemented',
                      message: 'Bulk delete functionality would go here',
                      color: 'blue'
                    });
                  }}
                >
                  Delete Selected
                </Button>
              </Group>
            </Box>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      <Modal
        opened={confirmDeleteOpened}
        onClose={closeConfirmDelete}
        title="Confirm Deletion"
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete the feature &quot;{featureToDelete?.title}&quot;?
          This action cannot be undone.
        </Text>
        <Group justify="right">
          <Button variant="default" onClick={closeConfirmDelete}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => featureToDelete && handleDelete(featureToDelete)}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </Card>
  );
}
