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
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconGripVertical, IconPlus, IconTrash, IconEdit } from '@tabler/icons-react';
import type { Stat } from '@/types/stats';

export function StatsManager() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<Stat | null>(null);

  const form = useForm({
    initialValues: {
      value: '',
      label: '',
    },
    validate: {
      value: (value) => (!value ? 'Value is required' : null),
      label: (value) => (!value ? 'Label is required' : null),
    },
  });

  const fetchStats = async () => {
    try {
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
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update order',
        color: 'red',
      });
    }
  };

  return (
    <Box p="md">
      <LoadingOverlay visible={loading} />

      <Group justify="flex-end" mb="md">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingStat(null);
            setModalOpen(true);
          }}
        >
          Add Stat
        </Button>
      </Group>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stats">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {stats.map((stat, index) => (
                <Draggable key={stat.id} draggableId={String(stat.id)} index={index}>
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
                        <Stack gap="xs" style={{ flex: 1 }}>
                          <Text fw={700} size="xl">{stat.value}</Text>
                          <Text c="dimmed">{stat.label}</Text>
                        </Stack>
                        <Group>
                          <ActionIcon
                            variant="subtle"
                            onClick={() => {
                              setEditingStat(stat);
                              form.setValues({
                                value: stat.value,
                                label: stat.label,
                              });
                              setModalOpen(true);
                            }}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={async () => {
                              if (!confirm('Are you sure?')) return;
                              try {
                                await fetch(`/api/stats/${stat.id}`, {
                                  method: 'DELETE',
                                });
                                await fetchStats();
                              } catch (error) {
                                notifications.show({
                                  title: 'Error',
                                  message: 'Failed to delete stat',
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
          setEditingStat(null);
          form.reset();
        }}
        title={editingStat ? 'Edit Stat' : 'Add Stat'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Value"
              placeholder="e.g., 10K+"
              required
              {...form.getInputProps('value')}
            />
            <TextInput
              label="Label"
              placeholder="e.g., Lives Impacted"
              required
              {...form.getInputProps('label')}
            />
            <Button type="submit">
              {editingStat ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
