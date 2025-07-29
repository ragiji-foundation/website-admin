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
  Stack,
  Container,
  Paper,
  ThemeIcon,
  SimpleGrid,
  Tooltip,
  Divider,
  Flex,
  Image,
  Progress,
  Tabs,
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
  IconSortDescending,
  IconFilter,
  IconGridDots,
  IconList,
  IconEye,
  IconSettings,
  IconStar,
  IconCalendar,
  IconPhoto,
  IconVideo,
  IconRefresh,
  IconDownload,
  IconBulb,
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
  const [itemsPerPage] = useState(12);
  const [sortState, setSortState] = useState<SortState>({ column: 'order', direction: 'asc' });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<string | null>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
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

  // Filter features based on search query and category
  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (feature.category && feature.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !categoryFilter || feature.category === categoryFilter;
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'video' && feature.mediaItem?.type === 'video') ||
      (activeTab === 'image' && feature.mediaItem?.type === 'image') ||
      (activeTab === 'recent' && new Date(feature.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(features.map(f => f.category).filter(Boolean)));

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

  // Render feature card for grid view
  const renderFeatureCard = (feature: Feature) => (
    <Card key={feature.id} shadow="sm" radius="md" withBorder style={{ height: '100%' }}>
      <Card.Section>
        {feature.mediaItem?.type === 'image' ? (
          <Box style={{ position: 'relative', height: 200 }}>
            <Image
              src={feature.mediaItem.url || feature.mediaItem.thumbnail}
              height={200}
              fit="cover"
              alt={feature.title}
            />
            <ThemeIcon
              size="sm"
              color="blue"
              variant="filled"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              <IconPhoto size={12} />
            </ThemeIcon>
          </Box>
        ) : feature.mediaItem?.type === 'video' ? (
          <Box style={{ position: 'relative', height: 200, backgroundColor: '#f8f9fa' }}>
            <Center h={200}>
              <ThemeIcon size="xl" color="red" variant="light">
                <IconVideo size={32} />
              </ThemeIcon>
            </Center>
            <ThemeIcon
              size="sm"
              color="red"
              variant="filled"
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              <IconVideo size={12} />
            </ThemeIcon>
          </Box>
        ) : (
          <Box style={{ height: 200, backgroundColor: '#f8f9fa' }}>
            <Center h={200}>
              <ThemeIcon size="xl" color="gray" variant="light">
                <IconBulb size={32} />
              </ThemeIcon>
            </Center>
          </Box>
        )}
      </Card.Section>

      <Stack gap="sm" p="md">
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Text fw={600} size="lg" lineClamp={2} mb="xs">
              {feature.title}
            </Text>
            {feature.category && (
              <Badge color="blue" variant="light" size="sm">
                {feature.category}
              </Badge>
            )}
          </Box>
          <Checkbox
            checked={selectedFeatures.includes(feature.id)}
            onChange={() => toggleFeatureSelection(feature.id)}
          />
        </Group>

        <Text size="sm" c="dimmed" lineClamp={3}>
          {typeof feature.description === 'string' 
            ? feature.description 
            : 'Feature description...'}
        </Text>

        <Divider />

        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon size="xs" color="gray" variant="light">
              <IconCalendar size={10} />
            </ThemeIcon>
            <Text size="xs" c="dimmed">
              {new Date(feature.createdAt).toLocaleDateString()}
            </Text>
          </Group>

          <Group gap="xs">
            <Tooltip label="Edit">
              <ActionIcon
                variant="light"
                color="blue"
                size="sm"
                onClick={() => router.push(`/features/${feature.id}`)}
              >
                <IconEdit size={14} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Delete">
              <ActionIcon
                variant="light"
                color="red"
                size="sm"
                onClick={() => {
                  setFeatureToDelete(feature);
                  openConfirmDelete();
                }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>

            <Menu position="bottom-end" shadow="md">
              <Menu.Target>
                <ActionIcon variant="light" size="sm">
                  <IconDots size={14} />
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
                <Menu.Item
                  leftSection={<IconEye size={14} />}
                  onClick={() => router.push(`/features/${feature.id}`)}
                >
                  View Details
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Stack>
    </Card>
  );

  return (
    <Container size="xl" p="md">
      {/* Loading Overlay */}
      {loading && (
        <Box 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <Stack align="center" gap="md">
            <Progress value={75} size="lg" radius="xl" style={{ width: 200 }} />
            <Text fw={500}>Loading features...</Text>
          </Stack>
        </Box>
      )}

      {/* Header */}
      <Paper shadow="sm" p="lg" mb="xl" radius="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={1} c="blue.7" mb="xs">
              <Group gap="xs">
                <ThemeIcon size="lg" variant="light" color="blue">
                  <IconBulb size={24} />
                </ThemeIcon>
                Features Management
              </Group>
            </Title>
            <Text c="dimmed" size="sm">
              Manage and showcase your organization's key features and capabilities
            </Text>
          </div>
          <Group>
            <Tooltip label="Refresh data">
              <ActionIcon 
                variant="light" 
                size="lg" 
                onClick={fetchFeatures}
                loading={loading}
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
            <Button
              component={Link}
              href="/features/new"
              leftSection={<IconPlus size={16} />}
              size="md"
            >
              Add New Feature
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Stats Summary Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="xl" spacing="md">
        <Paper shadow="sm" p="md" radius="md" style={{ border: '1px solid #e9ecef' }}>
          <Group justify="space-between">
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Total Features
              </Text>
              <Text fw={700} size="xl" c="blue.6">
                {features.length}
              </Text>
            </div>
            <ThemeIcon size="lg" variant="light" color="blue">
              <IconBulb size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" radius="md" style={{ border: '1px solid #e9ecef' }}>
          <Group justify="space-between">
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Video Features
              </Text>
              <Text fw={700} size="xl" c="red.6">
                {features.filter(f => f.mediaItem?.type === 'video').length}
              </Text>
            </div>
            <ThemeIcon size="lg" variant="light" color="red">
              <IconVideo size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" radius="md" style={{ border: '1px solid #e9ecef' }}>
          <Group justify="space-between">
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Image Features
              </Text>
              <Text fw={700} size="xl" c="green.6">
                {features.filter(f => f.mediaItem?.type === 'image').length}
              </Text>
            </div>
            <ThemeIcon size="lg" variant="light" color="green">
              <IconPhoto size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" radius="md" style={{ border: '1px solid #e9ecef' }}>
          <Group justify="space-between">
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Categories
              </Text>
              <Text fw={700} size="xl" c="purple.6">
                {categories.length}
              </Text>
            </div>
            <ThemeIcon size="lg" variant="light" color="purple">
              <IconStar size={20} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {error ? (
        <Alert color="red" mb="lg" icon={<IconTrash size={16} />}>
          {error.message || 'An error occurred while loading features'}
        </Alert>
      ) : (
        <>
          {/* Tabs and Filters */}
          <Paper shadow="sm" p="md" mb="lg" radius="md">
            <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
              <Tabs.List mb="md">
                <Tabs.Tab value="all" leftSection={<IconList size={16} />}>
                  All Features ({features.length})
                </Tabs.Tab>
                <Tabs.Tab value="video" leftSection={<IconVideo size={16} />}>
                  Video ({features.filter(f => f.mediaItem?.type === 'video').length})
                </Tabs.Tab>
                <Tabs.Tab value="image" leftSection={<IconPhoto size={16} />}>
                  Image ({features.filter(f => f.mediaItem?.type === 'image').length})
                </Tabs.Tab>
                <Tabs.Tab value="recent" leftSection={<IconCalendar size={16} />}>
                  Recent
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            <Group justify="space-between" align="flex-end">
              <Group style={{ flex: 1 }} gap="md">
                <TextInput
                  placeholder="Search features..."
                  leftSection={<IconSearch size={16} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  style={{ flex: 1, maxWidth: 400 }}
                />
                
                {categories.length > 0 && (
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: theme.radius.sm,
                      border: `1px solid ${theme.colors.gray[3]}`,
                      backgroundColor: 'white',
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                )}
              </Group>

              <Group gap="xs">
                <Tooltip label={`Sort ${sortState.direction === 'asc' ? 'descending' : 'ascending'}`}>
                  <ActionIcon
                    variant="light"
                    onClick={() => setSortState(prev => ({
                      ...prev,
                      direction: prev.direction === 'asc' ? 'desc' : 'asc'
                    }))}
                  >
                    {sortState.direction === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                  </ActionIcon>
                </Tooltip>

                <Tooltip label={viewMode === 'grid' ? 'Switch to table view' : 'Switch to grid view'}>
                  <ActionIcon
                    variant={viewMode === 'grid' ? 'filled' : 'light'}
                    onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                  >
                    {viewMode === 'grid' ? <IconGridDots size={16} /> : <IconList size={16} />}
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>

            {(searchQuery || categoryFilter) && (
              <Alert icon={<IconFilter size={16} />} color="blue" variant="light" mt="md">
                Showing {filteredFeatures.length} of {features.length} features
                {searchQuery && ` matching "${searchQuery}"`}
                {categoryFilter && ` in "${categoryFilter}" category`}
              </Alert>
            )}
          </Paper>

          {/* Content Area */}
          {filteredFeatures.length === 0 ? (
            <Paper shadow="sm" p="xl" radius="md" ta="center">
              <ThemeIcon size="xl" variant="light" color="gray" mx="auto" mb="md">
                <IconBulb size={32} />
              </ThemeIcon>
              <Title order={4} c="dimmed" mb="xs">
                {searchQuery || categoryFilter ? 'No features found' : 'No features yet'}
              </Title>
              <Text c="dimmed" size="sm" mb="lg">
                {searchQuery || categoryFilter 
                  ? 'Try adjusting your search terms or filters.'
                  : 'Get started by adding your first feature.'
                }
              </Text>
              {!searchQuery && !categoryFilter && (
                <Button
                  component={Link}
                  href="/features/new"
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                >
                  Add Your First Feature
                </Button>
              )}
            </Paper>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' ? (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md" mb="lg">
                  {paginatedData.map(renderFeatureCard)}
                </SimpleGrid>
              ) : (
                /* Table View */
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
                        <Table.Th style={{ width: 100 }}>Type</Table.Th>
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
                          <Table.Td colSpan={7}>
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
                              <Group gap="xs">
                                <ThemeIcon 
                                  size="sm" 
                                  variant="light" 
                                  color={feature.mediaItem?.type === 'video' ? 'red' : 'green'}
                                >
                                  {feature.mediaItem?.type === 'video' ? 
                                    <IconVideo size={12} /> : 
                                    <IconPhoto size={12} />
                                  }
                                </ThemeIcon>
                                <Text size="sm" tt="capitalize">
                                  {feature.mediaItem?.type || 'None'}
                                </Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              {feature.category ? (
                                <Badge color="blue" variant="light" size="sm">
                                  {feature.category}
                                </Badge>
                              ) : '-'}
                            </Table.Td>
                            <Table.Td>{new Date(feature.createdAt).toLocaleDateString()}</Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <Tooltip label="Edit">
                                  <ActionIcon
                                    variant="light"
                                    color="blue"
                                    size="sm"
                                    onClick={() => router.push(`/features/${feature.id}`)}
                                  >
                                    <IconEdit size={14} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Delete">
                                  <ActionIcon
                                    variant="light"
                                    color="red"
                                    size="sm"
                                    onClick={() => {
                                      setFeatureToDelete(feature);
                                      openConfirmDelete();
                                    }}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Tooltip>
                                <Menu position="bottom-end" shadow="md">
                                  <Menu.Target>
                                    <ActionIcon variant="light" size="sm">
                                      <IconDots size={14} />
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
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Group justify="center" mt="lg">
                  <Pagination
                    total={totalPages}
                    value={page}
                    onChange={setPage}
                    size="md"
                    radius="md"
                  />
                </Group>
              )}
            </>
          )}

          {/* Bulk Actions Bar */}
          {selectedFeatures.length > 0 && (
            <Paper
              shadow="lg"
              p="md"
              radius="md"
              style={{
                position: 'fixed',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                backgroundColor: theme.colors.blue[6],
                color: 'white',
                minWidth: 300,
              }}
            >
              <Group justify="space-between">
                <Text fw={500}>
                  {selectedFeatures.length} feature(s) selected
                </Text>
                <Group gap="xs">
                  <Button
                    variant="white"
                    color="blue"
                    size="sm"
                    leftSection={<IconDownload size={14} />}
                    onClick={() => {
                      notifications.show({
                        title: 'Export Started',
                        message: 'Selected features are being exported...',
                        color: 'blue'
                      });
                    }}
                  >
                    Export
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    size="sm"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => {
                      notifications.show({
                        title: 'Bulk Delete',
                        message: 'Bulk delete functionality would be implemented here',
                        color: 'orange'
                      });
                    }}
                  >
                    Delete
                  </Button>
                </Group>
              </Group>
            </Paper>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        opened={confirmDeleteOpened}
        onClose={closeConfirmDelete}
        title={
          <Group gap="sm">
            <ThemeIcon variant="light" color="red" size="sm">
              <IconTrash size={16} />
            </ThemeIcon>
            <Text fw={600}>Confirm Deletion</Text>
          </Group>
        }
        centered
        radius="md"
      >
        <Text mb="lg">
          Are you sure you want to delete the feature <strong>&quot;{featureToDelete?.title}&quot;</strong>?
          This action cannot be undone and will permanently remove all associated data.
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={closeConfirmDelete} color="gray">
            Cancel
          </Button>
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => featureToDelete && handleDelete(featureToDelete)}
          >
            Delete Feature
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
