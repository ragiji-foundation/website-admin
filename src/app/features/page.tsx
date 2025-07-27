'use client';

import { useState } from 'react';
import {
  Title,
  Group,
  Button,
  Text,
  Card,
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

// ✅ ADDED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

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
  // ✅ MIGRATED: Using centralized hooks instead of manual state management
  const { data: features, loading, error, refetch: fetchFeatures } = useApiData<Feature[]>(
    '/api/features', 
    [],
    { showNotifications: true }
  );

  // ✅ MIGRATED: Using centralized CRUD operations
  const { remove, update } = useCrudOperations<Feature>('/api/features', {
    showNotifications: true,
    onSuccess: () => {
      fetchFeatures(); // Refresh data after operations
      closeConfirmDelete();
    }
  });

  const [featureToDelete, setFeatureToDelete] = useState<Feature | null>(null);
  const [confirmDeleteOpened, { open: openConfirmDelete, close: closeConfirmDelete }] = useDisclosure(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortState, setSortState] = useState<SortState>({ column: 'order', direction: 'asc' });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const theme = useMantineTheme();

  // ✅ MIGRATED: Removed manual fetchFeatures function - now using centralized hook

  async function handleDelete(feature: Feature) {
    try {
      await remove(feature.id);
      // Success handling is done by the centralized hook
    } catch (err) {
      // Error handling is done by the centralized hook
      console.error('Delete failed:', err);
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
      await update(featureId, updatedFeature);

      // Also update the target feature's order
      const targetFeature = { ...newFeatures[targetIndex], order: currentOrder };
      await update(newFeatures[targetIndex].id, targetFeature);

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
    <Card shadow="sm" p="lg" radius="md" withBorder style={{ position: 'relative' }}>
      {loading && (
        <Box 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <Text>Loading features...</Text>
        </Box>
      )}

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
          {error.message || 'An error occurred while loading features'}
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
