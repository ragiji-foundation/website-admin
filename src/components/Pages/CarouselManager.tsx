"use client";
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Card,
  Image,
  Text,
  Button,
  Group,
  Modal,
  TextInput,
  Stack,
  Switch,
  ActionIcon,
  FileInput,
  rem,
  LoadingOverlay,
  Select,
  Box,
  Title,
  Badge,
  Paper,
  Container,
  Grid,
  ThemeIcon,
  Tooltip,
  Divider,
  Center,
  Overlay,
  Flex,
  SimpleGrid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { 
  IconGripVertical, 
  IconPlus, 
  IconUpload, 
  IconTrash, 
  IconEdit, 
  IconPhoto,
  IconVideo,
  IconEye,
  IconLink,
  IconDragDrop,
  IconSettings,
  IconX,
  IconCheck
} from '@tabler/icons-react';
import classes from './CarouselManager.module.css';

interface CarouselItem {
  id: number;
  title: string;
  titleHi?: string;
  imageUrl: string;
  link: string;
  active: boolean;
  order: number;
  type: 'image' | 'video';
  videoUrl?: string;
}

export function CarouselManager() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<CarouselItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: '',
      titleHi: '',
      link: '#',
      type: 'image' as 'image' | 'video',
      image: null as File | null,
      video: null as File | null,
      active: true,
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      type: (value) => (!value ? 'Type is required' : null),
      image: (value, values) =>
        values.type === 'image' && !value && !editingItem ? 'Image is required' : null,
      video: (value, values) =>
        values.type === 'video' && !value && !editingItem ? 'Video is required' : null,
    },
  });

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/carousel');
      const data = await response.json();

      // Fixed: Handle API response that returns an object with data inside
      if (Array.isArray(data)) {
        setItems(data);
      } else if (data && typeof data === 'object') {
        // Check common API response patterns
        if (Array.isArray(data.data)) {
          setItems(data.data);
        } else if (Array.isArray(data.items)) {
          setItems(data.items);
        } else if (Array.isArray(data.carousel)) {
          setItems(data.carousel);
        } else if (Array.isArray(data.results)) {
          setItems(data.results);
        } else {
          // If no array found, initialize as empty array
          setItems([]);
          console.error('Expected carousel data to be an array or contain an array but received:', data);
          notifications.show({
            title: 'Data Error',
            message: 'Received invalid data format for carousel',
            color: 'red'
          });
        }
      } else {
        // If data is not an object or array, initialize as empty array
        setItems([]);
        console.error('Expected carousel data to be an array but received:', data);
        notifications.show({
          title: 'Data Error',
          message: 'Received invalid data format for carousel',
          color: 'red'
        });
      }
    } catch (error) {
      console.error('Error fetching carousel data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch carousel data',
        color: 'red'
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setFormLoading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('titleHi', values.titleHi || '');
      formData.append('link', values.link);
      formData.append('type', values.type);
      formData.append('active', String(values.active));

      if (values.type === 'image' && values.image) {
        formData.append('image', values.image);
      } else if (values.type === 'video' && values.video) {
        formData.append('video', values.video);
      }

      const url = editingItem
        ? `/api/carousel/${editingItem.id}`
        : '/api/carousel';

      const method = editingItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save');

      await fetchItems();
      setModalOpen(false);
      form.reset();
      setEditingItem(null);

      notifications.show({
        title: 'Success',
        message: `Carousel item ${editingItem ? 'updated' : 'created'} successfully`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save carousel item',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    modals.openConfirmModal({
      title: 'Delete Carousel Item',
      children: (
        <Text size="sm">
          Are you sure you want to delete this carousel item? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          setLoading(true);
          
          console.log('Attempting to delete item with ID:', id);
          
          const response = await fetch(`/api/carousel/${id}`, { 
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          console.log('Delete response status:', response.status);
          
          if (!response.ok) {
            const errorData = await response.text();
            console.error('Delete failed with response:', errorData);
            throw new Error(`Failed to delete: ${response.status}`);
          }
          
          await fetchItems();
          notifications.show({
            title: 'Success',
            message: 'Carousel item deleted successfully',
            color: 'green',
            icon: <IconCheck size={16} />,
          });
        } catch (error) {
          console.error('Delete error:', error);
          notifications.show({
            title: 'Error',
            message: error instanceof Error ? error.message : 'Failed to delete carousel item',
            color: 'red',
            icon: <IconX size={16} />,
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items_copy = Array.from(items);
    const [removed] = items_copy.splice(result.source.index, 1);
    items_copy.splice(result.destination.index, 0, removed);

    const updated = items_copy.map((item, index) => ({
      ...item,
      order: index,
    }));

    setItems(updated);

    try {
      await Promise.all(
        updated.map((item) =>
          fetch(`/api/carousel/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: item.order }),
          })
        )
      );
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update order',
        color: 'red',
      });
    }
  };

  return (
    <Container size="xl" py="xl" className={classes.carouselContainer}>
      <LoadingOverlay 
        visible={loading} 
        zIndex={1000} 
        overlayProps={{ radius: "sm", blur: 2 }}
        className={classes.loadingOverlay}
      />

      {/* Header Section */}
      <Paper className={classes.headerGradient}>
        <Group justify="space-between" align="center">
          <div>
            <Title order={2} c="white" mb="xs">
              Carousel Management
            </Title>
            <Text c="white" opacity={0.9} size="lg">
              Manage your website&apos;s carousel items and their display order
            </Text>
          </div>
          <ThemeIcon size="xl" radius="xl" variant="light" color="white">
            <IconSettings size={28} />
          </ThemeIcon>
        </Group>
      </Paper>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
        <Card className={classes.statsCard} withBorder>
          <Group>
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconPhoto size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Total Items
              </Text>
              <Text fw={700} size="xl">
                {items.length}
              </Text>
            </div>
          </Group>
        </Card>

        <Card className={classes.statsCard} withBorder>
          <Group>
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <IconCheck size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Active Items
              </Text>
              <Text fw={700} size="xl">
                {items.filter(item => item.active).length}
              </Text>
            </div>
          </Group>
        </Card>

        <Card className={classes.statsCard} withBorder>
          <Group>
            <ThemeIcon size="lg" radius="md" variant="light" color="orange">
              <IconPhoto size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Images
              </Text>
              <Text fw={700} size="xl">
                {items.filter(item => item.type === 'image').length}
              </Text>
            </div>
          </Group>
        </Card>

        <Card className={classes.statsCard} withBorder>
          <Group>
            <ThemeIcon size="lg" radius="md" variant="light" color="grape">
              <IconVideo size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                Videos
              </Text>
              <Text fw={700} size="xl">
                {items.filter(item => item.type === 'video').length}
              </Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Action Bar */}
      <Paper p="md" mb="xl" withBorder radius="md" bg="gray.0">
        <Group justify="space-between">
          <Group>
            <ThemeIcon variant="light" color="blue" size="sm">
              <IconDragDrop size={14} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">
              Drag and drop to reorder items
            </Text>
          </Group>
          <Button
            leftSection={<IconPlus size={rem(16)} />}
            onClick={() => {
              form.reset();
              setEditingItem(null);
              setModalOpen(true);
            }}
            size="sm"
            radius="md"
          >
            Add New Item
          </Button>
        </Group>
      </Paper>

      {/* Carousel Items */}
      {items.length === 0 ? (
        <Paper className={classes.emptyState}>
          <Stack align="center" gap="md">
            <ThemeIcon size="xl" radius="xl" variant="light" color="gray">
              <IconPhoto size={32} />
            </ThemeIcon>
            <div style={{ textAlign: 'center' }}>
              <Text size="lg" fw={500} c="dimmed">
                No carousel items yet
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Create your first carousel item to get started
              </Text>
            </div>
            <Button
              leftSection={<IconPlus size={rem(16)} />}
              onClick={() => {
                form.reset();
                setEditingItem(null);
                setModalOpen(true);
              }}
              mt="md"
            >
              Add Your First Item
            </Button>
          </Stack>
        </Paper>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="carousel-items">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <Stack gap="md">
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${classes.carouselItem} ${snapshot.isDragging ? classes.dragging : ''}`}
                          withBorder
                          shadow={snapshot.isDragging ? "xl" : "sm"}
                        >
                          <Grid>
                            {/* Drag Handle */}
                            <Grid.Col span={1}>
                              <Center h="100%">
                                <div {...provided.dragHandleProps} className={classes.dragHandle}>
                                  <ThemeIcon
                                    variant="light"
                                    color="gray"
                                    size="lg"
                                    radius="md"
                                  >
                                    <IconGripVertical size={20} />
                                  </ThemeIcon>
                                </div>
                              </Center>
                            </Grid.Col>

                            {/* Media Preview */}
                            <Grid.Col span={2}>
                              <Box className={classes.mediaPreview} h={80}>
                                {item.type === 'image' ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    h={80}
                                    fit="cover"
                                    radius="md"
                                    fallbackSrc="/placeholder-banner.jpg"
                                  />
                                ) : (
                                  <Box h={80} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                                    <video
                                      src={item.videoUrl}
                                      loop
                                      muted
                                      autoPlay
                                      playsInline
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                    <Overlay color="#000" opacity={0.3} />
                                    <Center style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                      <ThemeIcon color="white" variant="filled" size="sm">
                                        <IconVideo size={14} />
                                      </ThemeIcon>
                                    </Center>
                                  </Box>
                                )}
                                <Badge
                                  size="xs"
                                  variant="filled"
                                  color={item.type === 'image' ? 'blue' : 'grape'}
                                  className={classes.badge}
                                  style={{ position: 'absolute', top: 4, left: 4 }}
                                >
                                  {item.type}
                                </Badge>
                              </Box>
                            </Grid.Col>

                            {/* Content */}
                            <Grid.Col span={6}>
                              <Stack gap="xs">
                                <Group gap="xs">
                                  <Text fw={600} size="lg" lineClamp={1}>
                                    {item.title}
                                  </Text>
                                  <Badge
                                    size="xs"
                                    variant="light"
                                    color={item.active ? 'green' : 'gray'}
                                    className={`${classes.badge} ${item.active ? classes.statusBadge : ''}`}
                                  >
                                    {item.active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </Group>
                                
                                {item.titleHi && (
                                  <Text size="sm" c="dimmed" fs="italic" lineClamp={1}>
                                    {item.titleHi}
                                  </Text>
                                )}
                                
                                <Group gap="xs">
                                  <ThemeIcon size="xs" variant="light" color="blue">
                                    <IconLink size={10} />
                                  </ThemeIcon>
                                  <Text size="xs" c="dimmed" lineClamp={1}>
                                    {item.link}
                                  </Text>
                                </Group>
                              </Stack>
                            </Grid.Col>

                            {/* Controls */}
                            <Grid.Col span={3}>
                              <Flex justify="flex-end" align="center" h="100%" gap="md">
                                <Switch
                                  checked={item.active}
                                  onChange={async () => {
                                    try {
                                      const response = await fetch(`/api/carousel/${item.id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ active: !item.active }),
                                      });
                                      
                                      if (!response.ok) throw new Error('Failed to update');
                                      
                                      await fetchItems();
                                      notifications.show({
                                        title: 'Success',
                                        message: `Item ${item.active ? 'deactivated' : 'activated'}`,
                                        color: 'green',
                                        icon: <IconCheck size={16} />,
                                      });
                                    } catch (error) {
                                      notifications.show({
                                        title: 'Error',
                                        message: 'Failed to update status',
                                        color: 'red',
                                        icon: <IconX size={16} />,
                                      });
                                    }
                                  }}
                                  size="md"
                                />
                                
                                <Group gap="xs">
                                  <Tooltip label="Preview">
                                    <ActionIcon
                                      variant="light"
                                      color="blue"
                                      size="lg"
                                      radius="md"
                                      className={classes.actionButton}
                                      onClick={() => {
                                        setPreviewItem(item);
                                        setPreviewModalOpen(true);
                                      }}
                                    >
                                      <IconEye size={18} />
                                    </ActionIcon>
                                  </Tooltip>
                                  
                                  <Tooltip label="Edit">
                                    <ActionIcon
                                      variant="light"
                                      color="orange"
                                      size="lg"
                                      radius="md"
                                      className={classes.actionButton}
                                      onClick={() => {
                                        setEditingItem(item);
                                        form.setValues({
                                          title: item.title,
                                          titleHi: item.titleHi || '',
                                          link: item.link,
                                          type: item.type,
                                          active: item.active,
                                          image: null,
                                          video: null,
                                        });
                                        setModalOpen(true);
                                      }}
                                    >
                                      <IconEdit size={18} />
                                    </ActionIcon>
                                  </Tooltip>
                                  
                                  <Tooltip label="Delete">
                                    <ActionIcon
                                      variant="light"
                                      color="red"
                                      size="lg"
                                      radius="md"
                                      className={classes.actionButton}
                                      onClick={() => handleDelete(item.id)}
                                    >
                                      <IconTrash size={18} />
                                    </ActionIcon>
                                  </Tooltip>
                                </Group>
                              </Flex>
                            </Grid.Col>
                          </Grid>
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

      {/* Modal for Add/Edit */}
      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
          form.reset();
        }}
        title={
          <Group className={classes.modalHeader}>
            <ThemeIcon
              variant="light"
              color={editingItem ? 'orange' : 'blue'}
              size="lg"
            >
              {editingItem ? <IconEdit size={20} /> : <IconPlus size={20} />}
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">
                {editingItem ? 'Edit Carousel Item' : 'Add New Carousel Item'}
              </Text>
              <Text size="sm" c="dimmed">
                {editingItem ? 'Update your carousel item' : 'Create a new carousel item'}
              </Text>
            </div>
          </Group>
        }
        size="lg"
        radius="lg"
        centered
        className={classes.modal}
      >
        <LoadingOverlay 
          visible={formLoading} 
          zIndex={1000} 
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            <SimpleGrid cols={2}>
              <TextInput
                label="Title (English)"
                placeholder="Enter English title"
                required
                {...form.getInputProps('title')}
                leftSection={<IconEdit size={16} />}
              />
              <TextInput
                label="Title (Hindi)"
                placeholder="हिंदी में शीर्षक"
                {...form.getInputProps('titleHi')}
                style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              />
            </SimpleGrid>

            <TextInput
              label="Link URL"
              placeholder="https://example.com or #"
              {...form.getInputProps('link')}
              leftSection={<IconLink size={16} />}
            />

            <Select
              label="Media Type"
              placeholder="Select media type"
              required
              data={[
                { 
                  value: 'image', 
                  label: '🖼️ Image',
                },
                { 
                  value: 'video', 
                  label: '🎥 Video',
                },
              ]}
              {...form.getInputProps('type')}
            />

            {form.values.type === 'image' ? (
              <FileInput
                label="Upload Image"
                placeholder="Choose image file"
                accept="image/*"
                leftSection={<IconPhoto size={16} />}
                {...form.getInputProps('image')}
                required={!editingItem}
                description="Recommended: 1920x1080px, max 5MB"
              />
            ) : (
              <FileInput
                label="Upload Video"
                placeholder="Choose video file"
                accept="video/*"
                leftSection={<IconVideo size={16} />}
                {...form.getInputProps('video')}
                required={!editingItem}
                description="Recommended: MP4 format, max 50MB"
              />
            )}

            <Paper className={classes.formSection}>
              <Group justify="space-between">
                <div>
                  <Text fw={500} size="sm">
                    Item Status
                  </Text>
                  <Text size="xs" c="dimmed">
                    Control whether this item appears in the carousel
                  </Text>
                </div>
                <Switch
                  label="Active"
                  {...form.getInputProps('active', { type: 'checkbox' })}
                  size="md"
                />
              </Group>
            </Paper>

            <Divider />

            <Group justify="space-between">
              <Button
                variant="light"
                color="gray"
                onClick={() => {
                  setModalOpen(false);
                  setEditingItem(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                leftSection={editingItem ? <IconCheck size={16} /> : <IconPlus size={16} />}
                loading={formLoading}
              >
                {editingItem ? 'Update Item' : 'Create Item'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        opened={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewItem(null);
        }}
        title={
          <Group>
            <ThemeIcon variant="light" color="blue" size="lg">
              <IconEye size={20} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="lg">
                Preview: {previewItem?.title}
              </Text>
              <Text size="sm" c="dimmed">
                {previewItem?.type === 'image' ? 'Image Preview' : 'Video Preview'}
              </Text>
            </div>
          </Group>
        }
        size="xl"
        radius="lg"
        centered
      >
        {previewItem && (
          <Stack gap="md">
            <Box style={{ textAlign: 'center' }}>
              {previewItem.type === 'image' ? (
                <Image
                  src={previewItem.imageUrl}
                  alt={previewItem.title}
                  fit="contain"
                  h={500}
                  radius="md"
                  fallbackSrc="/placeholder-banner.jpg"
                />
              ) : (
                <video
                  src={previewItem.videoUrl}
                  controls
                  style={{
                    width: '100%',
                    maxHeight: '500px',
                    borderRadius: '8px'
                  }}
                />
              )}
            </Box>
            
            <Paper p="md" withBorder>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={500}>English Title:</Text>
                  <Text>{previewItem.title}</Text>
                </Group>
                
                {previewItem.titleHi && (
                  <Group justify="space-between">
                    <Text fw={500}>Hindi Title:</Text>
                    <Text style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                      {previewItem.titleHi}
                    </Text>
                  </Group>
                )}
                
                <Group justify="space-between">
                  <Text fw={500}>Link:</Text>
                  <Text size="sm" c="blue" style={{ wordBreak: 'break-all' }}>
                    {previewItem.link}
                  </Text>
                </Group>
                
                <Group justify="space-between">
                  <Text fw={500}>Status:</Text>
                  <Badge color={previewItem.active ? 'green' : 'gray'}>
                    {previewItem.active ? 'Active' : 'Inactive'}
                  </Badge>
                </Group>
                
                <Group justify="space-between">
                  <Text fw={500}>Type:</Text>
                  <Badge color={previewItem.type === 'image' ? 'blue' : 'grape'}>
                    {previewItem.type}
                  </Badge>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}