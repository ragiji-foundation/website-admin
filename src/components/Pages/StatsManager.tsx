"use client";
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Card,
  Text,
  Button,
  Group,
  Modal,
  TextInput,
  Stack,
  ActionIcon,
  LoadingOverlay,
  Badge,
  Container,
  Paper,
  Title,
  Tabs,
  SimpleGrid,
  Divider,
  Alert,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { 
  IconGripVertical, 
  IconPlus, 
  IconTrash, 
  IconEdit, 
  IconChartBar,
  IconUsers,
  IconSearch,
  IconEye,
  IconCopy,
  IconRefresh,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconCalendar,
  IconSettings,
  IconBulb,
  IconDeviceFloppy,
  IconStar,
} from '@tabler/icons-react';

interface Stat {
  id: string;
  label: string;
  labelHi?: string;
  value: string;
  icon?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export function StatsManager() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState<string | null>('manage');

  // Templates for quick creation
  const templates = [
    {
      label: 'Students Empowered',
      value: '10,000+',
      icon: '🎓',
      labelHi: 'सशक्त छात्र',
      category: 'Education',
      description: 'Track the number of students who have benefited from your programs',
    },
    {
      label: 'Success Rate',
      value: '95%',
      icon: '📈',
      labelHi: 'सफलता दर',
      category: 'Performance',
      description: 'Showcase your program effectiveness and success metrics',
    },
    {
      label: 'Communities Served',
      value: '150+',
      icon: '🏘️',
      labelHi: 'सेवित समुदाय',
      category: 'Outreach',
      description: 'Highlight the geographical reach of your initiatives',
    },
    {
      label: 'Years of Impact',
      value: '25+',
      icon: '🏆',
      labelHi: 'प्रभाव के वर्ष',
      category: 'Experience',
      description: 'Demonstrate your organization\'s long-standing commitment',
    },
    {
      label: 'Awards Received',
      value: '50+',
      icon: '🥇',
      labelHi: 'प्राप्त पुरस्कार',
      category: 'Recognition',
      description: 'Display recognition and accolades your organization has earned',
    },
    {
      label: 'Lives Transformed',
      value: '25,000+',
      icon: '❤️',
      labelHi: 'परिवर्तित जीवन',
      category: 'Impact',
      description: 'Show the human impact of your work and programs',
    },
  ];

  // Simple BilingualInput component
  const BilingualInput = ({ label, placeholder, description, ...props }: any) => (
    <TextInput
      label={label}
      placeholder={placeholder}
      description={description}
      style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
      {...props}
    />
  );

  const form = useForm({
    initialValues: {
      value: '',
      label: '',
      labelHi: '',
      icon: '',
    },
    validate: {
      value: (value) => (!value ? 'Value is required' : null),
      label: (value) => (!value ? 'Label is required' : null),
    },
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch stats',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleTemplateSelect = (template: typeof templates[0]) => {
    form.setValues({
      value: template.value,
      label: template.label,
      labelHi: template.labelHi || '',
      icon: template.icon,
    });
    setEditingStat(null);
    setModalOpen(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      const method = editingStat ? 'PATCH' : 'POST';
      const url = editingStat ? `/api/stats/${editingStat.id}` : '/api/stats';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Failed to save stat');

      await fetchStats();
      setModalOpen(false);
      form.reset();
      setEditingStat(null);

      notifications.show({
        title: 'Success',
        message: `Stat ${editingStat ? 'updated' : 'created'} successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save stat',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(stats);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);

    const updated = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setStats(updated);

    try {
      await Promise.all(
        updated.map((item) =>
          fetch(`/api/stats/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: item.order }),
          })
        )
      );
      
      notifications.show({
        title: 'Success',
        message: 'Statistics order updated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update order',
        color: 'red',
      });
      await fetchStats(); // Revert on error
    }
  };

  const handleDelete = async (statId: string) => {
    modals.openConfirmModal({
      title: 'Delete Statistic',
      children: (
        <Text size="sm">
          Are you sure you want to delete this statistic? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          setLoading(true);
          await fetch(`/api/stats/${statId}`, {
            method: 'DELETE',
          });
          await fetchStats();
          notifications.show({
            title: 'Success',
            message: 'Statistic deleted successfully',
            color: 'green',
          });
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete statistic',
            color: 'red',
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDuplicate = async (stat: Stat) => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...stat,
          label: `${stat.label} (Copy)`,
          value: stat.value,
        }),
      });

      if (!response.ok) throw new Error('Failed to duplicate stat');

      await fetchStats();
      notifications.show({
        title: 'Success',
        message: 'Statistic duplicated successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to duplicate statistic',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStats = stats
    .filter(stat => 
      stat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stat.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stat.labelHi && stat.labelHi.includes(searchQuery))
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.order - b.order;
      }
      return b.order - a.order;
    });

  return (
    <Container size="xl" p="md">
      <LoadingOverlay visible={loading} />

      {/* Header */}
      <Paper shadow="sm" p="lg" mb="xl" radius="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={1} c="blue.7" mb="xs">
              <Group gap="xs">
                <ThemeIcon size="lg" variant="light" color="blue">
                  <IconChartBar size={24} />
                </ThemeIcon>
                Statistics Dashboard
              </Group>
            </Title>
            <Text c="dimmed" size="sm">
              Manage and showcase your organization&apos;s key achievements and metrics
            </Text>
          </div>
          <Group>
            <Tooltip label="Refresh data">
              <ActionIcon 
                variant="light" 
                size="lg" 
                onClick={fetchStats}
                loading={loading}
              >
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>
            <Button
              leftSection={<IconEye size={16} />}
              variant={previewMode ? "filled" : "light"}
              onClick={() => setPreviewMode(!previewMode)}
              color={previewMode ? "green" : "blue"}
            >
              {previewMode ? 'Exit Preview' : 'Preview Mode'}
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
                Total Statistics
              </Text>
              <Text fw={700} size="xl" c="blue.6">
                {stats.length}
              </Text>
            </div>
            <ThemeIcon size="lg" variant="light" color="blue">
              <IconChartBar size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" radius="md" style={{ border: '1px solid #e9ecef' }}>
          <Group justify="space-between">
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Last Updated
              </Text>
              <Text fw={700} size="xl" c="green.6">
                {stats.length > 0 ? new Date(Math.max(...stats.map(s => new Date(s.updatedAt).getTime()))).toLocaleDateString() : 'N/A'}
              </Text>
            </div>
            <ThemeIcon size="lg" variant="light" color="green">
              <IconCalendar size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" radius="md" style={{ border: '1px solid #e9ecef' }}>
          <Group justify="space-between">
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                With Icons
              </Text>
              <Text fw={700} size="xl" c="orange.6">
                {stats.filter(s => s.icon).length}
              </Text>
            </div>
            <ThemeIcon size="lg" variant="light" color="orange">
              <IconStar size={20} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper shadow="sm" p="md" radius="md" style={{ border: '1px solid #e9ecef' }}>
          <Group justify="space-between">
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Bilingual
              </Text>
              <Text fw={700} size="xl" c="purple.6">
                {stats.filter(s => s.labelHi).length}
              </Text>
            </div>
            <ThemeIcon size="lg" variant="light" color="purple">
              <IconUsers size={20} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Main Content */}
      <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
        <Tabs.List grow mb="lg">
          <Tabs.Tab value="manage" leftSection={<IconSettings size={16} />}>
            Manage Statistics
          </Tabs.Tab>
          <Tabs.Tab value="preview" leftSection={<IconEye size={16} />}>
            Live Preview
          </Tabs.Tab>
          <Tabs.Tab value="templates" leftSection={<IconBulb size={16} />}>
            Quick Templates
          </Tabs.Tab>
        </Tabs.List>

        {/* Manage Tab */}
        <Tabs.Panel value="manage">
          <Stack gap="lg">
            {/* Controls */}
            <Paper shadow="sm" p="md" radius="md">
              <Group justify="space-between" align="flex-end" mb="md">
                <div style={{ flex: 1 }}>
                  <TextInput
                    placeholder="Search statistics..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    style={{ maxWidth: 300 }}
                  />
                </div>
                <Group>
                  <Tooltip label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}>
                    <ActionIcon
                      variant="light"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? <IconSortAscending size={16} /> : <IconSortDescending size={16} />}
                    </ActionIcon>
                  </Tooltip>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => {
                      form.reset();
                      setEditingStat(null);
                      setModalOpen(true);
                    }}
                  >
                    Add Statistic
                  </Button>
                </Group>
              </Group>

              {searchQuery && (
                <Alert icon={<IconFilter size={16} />} color="blue" variant="light" mb="md">
                  Showing {filteredStats.length} of {stats.length} statistics matching &quot;{searchQuery}&quot;
                </Alert>
              )}
            </Paper>

            {/* Statistics List */}
            {filteredStats.length === 0 ? (
              <Paper shadow="sm" p="xl" radius="md" ta="center">
                <ThemeIcon size="xl" variant="light" color="gray" mx="auto" mb="md">
                  <IconChartBar size={32} />
                </ThemeIcon>
                <Title order={4} c="dimmed" mb="xs">
                  {searchQuery ? 'No statistics found' : 'No statistics yet'}
                </Title>
                <Text c="dimmed" size="sm" mb="lg">
                  {searchQuery 
                    ? 'Try adjusting your search terms or clear the filter.'
                    : 'Get started by adding your first statistic or using a template.'
                  }
                </Text>
                {!searchQuery && (
                  <Button
                    variant="light"
                    leftSection={<IconPlus size={16} />}
                    onClick={() => {
                      form.reset();
                      setEditingStat(null);
                      setModalOpen(true);
                    }}
                  >
                    Add Your First Statistic
                  </Button>
                )}
              </Paper>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="stats">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <Stack gap="sm">
                        {filteredStats.map((stat, index) => (
                          <Draggable key={stat.id} draggableId={String(stat.id)} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                shadow="sm"
                                radius="md"
                                style={{
                                  ...provided.draggableProps.style,
                                  transform: snapshot.isDragging 
                                    ? `${provided.draggableProps.style?.transform} rotate(2deg)`
                                    : provided.draggableProps.style?.transform,
                                  border: snapshot.isDragging ? '2px dashed #228be6' : '1px solid #e9ecef',
                                }}
                              >
                                <Group gap="md" align="flex-start">
                                  <div {...provided.dragHandleProps}>
                                    <ThemeIcon
                                      variant="light"
                                      color="gray"
                                      style={{ cursor: 'grab' }}
                                      size="sm"
                                    >
                                      <IconGripVertical size={14} />
                                    </ThemeIcon>
                                  </div>

                                  <div style={{ flex: 1 }}>
                                    <Group gap="lg" align="flex-start">
                                      {/* Stat Display */}
                                      <div style={{ flex: 1 }}>
                                        <Group gap="md" align="center" mb="xs">
                                          {stat.icon && (
                                            <Text size="2xl" style={{ lineHeight: 1 }}>
                                              {stat.icon}
                                            </Text>
                                          )}
                                          <div>
                                            <Text fw={700} size="2xl" c="blue.7" lh={1.2}>
                                              {stat.value}
                                            </Text>
                                            <Badge size="xs" color="blue" variant="light">
                                              #{stat.order + 1}
                                            </Badge>
                                          </div>
                                        </Group>
                                        
                                        <div>
                                          <Text fw={600} size="lg" mb={2}>
                                            {stat.label}
                                          </Text>
                                          {stat.labelHi && (
                                            <Text 
                                              size="sm" 
                                              c="dimmed" 
                                              style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                                            >
                                              {stat.labelHi}
                                            </Text>
                                          )}
                                        </div>
                                      </div>

                                      {/* Actions */}
                                      <Group gap="xs">
                                        <Tooltip label="Edit">
                                          <ActionIcon
                                            variant="light"
                                            color="blue"
                                            onClick={() => {
                                              setEditingStat(stat);
                                              form.setValues({
                                                value: stat.value,
                                                label: stat.label,
                                                labelHi: stat.labelHi || '',
                                                icon: stat.icon || '',
                                              });
                                              setModalOpen(true);
                                            }}
                                          >
                                            <IconEdit size={16} />
                                          </ActionIcon>
                                        </Tooltip>
                                        
                                        <Tooltip label="Duplicate">
                                          <ActionIcon
                                            variant="light"
                                            color="green"
                                            onClick={() => handleDuplicate(stat)}
                                          >
                                            <IconCopy size={16} />
                                          </ActionIcon>
                                        </Tooltip>
                                        
                                        <Tooltip label="Delete">
                                          <ActionIcon
                                            variant="light"
                                            color="red"
                                            onClick={() => handleDelete(stat.id)}
                                          >
                                            <IconTrash size={16} />
                                          </ActionIcon>
                                        </Tooltip>
                                      </Group>
                                    </Group>
                                  </div>
                                </Group>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      </Stack>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Stack>
        </Tabs.Panel>

        {/* Preview Tab */}
        <Tabs.Panel value="preview">
          <Paper shadow="sm" p="xl" radius="md">
            <Title order={2} mb="xl" ta="center" c="blue.7">
              Statistics Preview
            </Title>
            
            {stats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <ThemeIcon size="xl" variant="light" color="gray" mx="auto" mb="md">
                  <IconChartBar size={32} />
                </ThemeIcon>
                <Title order={4} c="dimmed" mb="xs">
                  No statistics to preview
                </Title>
                <Text c="dimmed" size="sm">
                  Add some statistics to see how they&apos;ll look on your website.
                </Text>
              </div>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
                {stats.map((stat) => (
                  <Paper
                    key={stat.id}
                    p="xl"
                    radius="lg"
                    ta="center"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.1)',
                        zIndex: 0,
                      }}
                    />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      {stat.icon && (
                        <Text size="3xl" mb="md" style={{ lineHeight: 1 }}>
                          {stat.icon}
                        </Text>
                      )}
                      <Text fw={900} size="3xl" mb="sm" lh={1}>
                        {stat.value}
                      </Text>
                      <Text fw={600} size="lg" lh={1.3}>
                        {stat.label}
                      </Text>
                      {stat.labelHi && (
                        <Text 
                          size="sm" 
                          opacity={0.9}
                          mt="xs"
                          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                        >
                          {stat.labelHi}
                        </Text>
                      )}
                    </div>
                  </Paper>
                ))}
              </SimpleGrid>
            )}
          </Paper>
        </Tabs.Panel>

        {/* Templates Tab */}
        <Tabs.Panel value="templates">
          <Paper shadow="sm" p="lg" radius="md">
            <Title order={2} mb="lg" c="blue.7">
              Quick Templates
            </Title>
            <Text c="dimmed" mb="xl">
              Get started quickly with these pre-made statistic templates. Click to add them to your dashboard.
            </Text>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {templates.map((template, index) => (
                <Card key={index} shadow="sm" radius="md" p="lg" style={{ cursor: 'pointer' }}>
                  <Group gap="md" mb="md">
                    <ThemeIcon size="lg" variant="light" color="blue">
                      <Text size="lg">{template.icon}</Text>
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="lg">
                        {template.label}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {template.category}
                      </Text>
                    </div>
                  </Group>
                  
                  <Text c="dimmed" size="sm" mb="md">
                    {template.description}
                  </Text>
                  
                  <Button
                    variant="light"
                    fullWidth
                    leftSection={<IconPlus size={16} />}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    Use This Template
                  </Button>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Add/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <Group gap="sm">
            <ThemeIcon variant="light" color="blue" size="sm">
              {editingStat ? <IconEdit size={16} /> : <IconPlus size={16} />}
            </ThemeIcon>
            <Text fw={600}>
              {editingStat ? 'Edit Statistic' : 'Add New Statistic'}
            </Text>
          </Group>
        }
        size="md"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Value"
              placeholder="e.g., 1000+, 95%, $2.5M"
              {...form.getInputProps('value')}
              required
              description="The main number or value to display"
            />
            
            <TextInput
              label="Label (English)"
              placeholder="e.g., Students Empowered, Success Rate"
              {...form.getInputProps('label')}
              required
              description="The description of what this statistic represents"
            />
            
            <BilingualInput
              label="Label (Hindi)"
              placeholder="हिंदी में लेबल"
              {...form.getInputProps('labelHi')}
              description="Optional Hindi translation for bilingual support"
            />
            
            <TextInput
              label="Icon (Emoji)"
              placeholder="e.g., 🎓, �, 💡, ⭐"
              {...form.getInputProps('icon')}
              description="Use emoji characters to make your statistic more visual"
            />

            <Divider my="xs" />
            
            <Group justify="flex-end" gap="sm">
              <Button 
                variant="light" 
                onClick={() => setModalOpen(false)}
                color="gray"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={loading}
                leftSection={editingStat ? <IconDeviceFloppy size={16} /> : <IconPlus size={16} />}
              >
                {editingStat ? 'Update Statistic' : 'Add Statistic'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
