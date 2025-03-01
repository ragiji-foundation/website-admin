'use client';
import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Table,
  Group,
  Button,
  Card,
  Image,
  Text,
  Modal,
  TextInput,
  Stack,
  FileInput,
  Textarea,
  ActionIcon,
  LoadingOverlay,
  ScrollArea,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconUpload } from '@tabler/icons-react';

interface Award {
  id: string;
  title: string;
  year: string;
  description: string;
  imageUrl: string;
  organization: string;
  createdAt: string;
}

export default function AwardsManagementPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm({
    initialValues: {
      title: '',
      year: new Date().getFullYear().toString(),
      description: '',
      organization: '',
      imageUrl: '',
    },
    validate: {
      title: (value) => !value.trim() && 'Title is required',
      year: (value) => !value && 'Year is required',
      organization: (value) => !value.trim() && 'Organization is required',
      description: (value) => !value.trim() && 'Description is required',
      imageUrl: (value) => !value && 'Image is required',
    },
  });

  const fetchAwards = async () => {
    try {
      const response = await fetch('/api/awards');
      if (!response.ok) throw new Error('Failed to fetch awards');
      const data = await response.json();
      setAwards(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch awards',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      form.setFieldValue('imageUrl', data.url);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const url = editingAward
        ? `/api/awards/${editingAward.id}`
        : '/api/awards';

      const method = editingAward ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Failed to save award');

      await fetchAwards();
      setModalOpened(false);
      form.reset();
      setEditingAward(null);

      notifications.show({
        title: 'Success',
        message: `Award ${editingAward ? 'updated' : 'created'} successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save award',
        color: 'red',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this award?')) return;

    try {
      const response = await fetch(`/api/awards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete award');

      await fetchAwards();
      notifications.show({
        title: 'Success',
        message: 'Award deleted successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete award',
        color: 'red',
      });
    }
  };

  const handleEdit = (award: Award) => {
    setEditingAward(award);
    form.setValues(award);
    setModalOpened(true);
  };

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title>Awards Management</Title>
        <Button
          leftSection={<IconPlus size={14} />}
          onClick={() => setModalOpened(true)}
        >
          Add Award
        </Button>
      </Group>

      <Card withBorder>
        <LoadingOverlay visible={loading} />
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Year</Table.Th>
                <Table.Th>Organization</Table.Th>
                <Table.Th style={{ width: rem(120) }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {awards.map((award) => (
                <Table.Tr key={award.id}>
                  <Table.Td>{award.title}</Table.Td>
                  <Table.Td>{award.year}</Table.Td>
                  <Table.Td>{award.organization}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleEdit(award)}
                      >
                        <IconEdit style={{ width: rem(16), height: rem(16) }} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDelete(award.id)}
                      >
                        <IconTrash style={{ width: rem(16), height: rem(16) }} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingAward(null);
          form.reset();
        }}
        title={editingAward ? 'Edit Award' : 'Add New Award'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Title"
              placeholder="Award title"
              required
              {...form.getInputProps('title')}
            />
            <TextInput
              label="Year"
              placeholder="2024"
              required
              {...form.getInputProps('year')}
            />
            <TextInput
              label="Organization"
              placeholder="Awarding organization"
              required
              {...form.getInputProps('organization')}
            />
            <Textarea
              label="Description"
              placeholder="Award description"
              required
              minRows={3}
              {...form.getInputProps('description')}
            />
            <FileInput
              label="Award Image"
              placeholder="Upload image"
              accept="image/*"
              leftSection={<IconUpload size={14} />}
              onChange={(file) => file && handleImageUpload(file)}
            />
            {form.values.imageUrl && (
              <Image
                src={form.values.imageUrl}
                height={200}
                fit="contain"
                alt="Award preview"
              />
            )}
            <Button type="submit">
              {editingAward ? 'Update Award' : 'Create Award'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}