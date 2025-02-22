"use client";
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconGripVertical, IconPlus, IconUpload, IconTrash, IconEdit } from '@tabler/icons-react';

interface CarouselItem {
  id: number;
  title: string;
  imageUrl: string;
  link: string;
  active: boolean;
  order: number;
}

export function CarouselManager() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarouselItem | null>(null);

  const form = useForm({
    initialValues: {
      title: '',
      link: '#',
      image: null as File | null,
      active: true,
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
    },
  });

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/carousel');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch carousel items',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('link', values.link);
      if (values.image) {
        formData.append('image', values.image);
      }
      formData.append('active', String(values.active));

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
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save carousel item',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      setLoading(true);
      await fetch(`/api/carousel/${id}`, { method: 'DELETE' });
      await fetchItems();
      notifications.show({
        title: 'Success',
        message: 'Carousel item deleted successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete carousel item',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
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
    <div style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />

      <Group justify="flex-end" mb="md">
        <Button
          leftSection={<IconPlus size={rem(16)} />}
          onClick={() => {
            form.reset();
            setEditingItem(null);
            setModalOpen(true);
          }}
        >
          Add Carousel Item
        </Button>
      </Group>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="carousel-items">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      withBorder
                      mb="sm"
                    >
                      <Group>
                        <div {...provided.dragHandleProps}>
                          <IconGripVertical style={{ cursor: 'grab' }} />
                        </div>
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          w={100}
                          h={60}
                          fit="cover"
                        />
                        <Stack style={{ flex: 1 }}>
                          <Text fw={500}>{item.title}</Text>
                          <Text size="sm" c="dimmed">{item.link}</Text>
                        </Stack>
                        <Switch
                          checked={item.active}
                          onChange={async () => {
                            try {
                              await fetch(`/api/carousel/${item.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ active: !item.active }),
                              });
                              await fetchItems();
                            } catch (error) {
                              notifications.show({
                                title: 'Error',
                                message: 'Failed to update status',
                                color: 'red',
                              });
                            }
                          }}
                        />
                        <Group>
                          <ActionIcon
                            variant="subtle"
                            onClick={() => {
                              setEditingItem(item);
                              form.setValues({
                                title: item.title,
                                link: item.link,
                                active: item.active,
                                image: null,
                              });
                              setModalOpen(true);
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDelete(item.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
          form.reset();
        }}
        title={editingItem ? 'Edit Carousel Item' : 'Add Carousel Item'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Title"
              required
              {...form.getInputProps('title')}
            />
            <TextInput
              label="Link"
              {...form.getInputProps('link')}
            />
            <FileInput
              label="Image"
              accept="image/*"
              leftSection={<IconUpload size={rem(14)} />}
              {...form.getInputProps('image')}
              required={!editingItem}
            />
            <Switch
              label="Active"
              {...form.getInputProps('active', { type: 'checkbox' })}
            />
            <Button type="submit">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </div>
  );
}
