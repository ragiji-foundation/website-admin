'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Table,
  Button,
  Group,
  Text,
  Modal,
  TextInput,
  Select,
  ActionIcon,
  Badge,
  Loader,
  Alert,
  Pagination,
  Grid,
  Card,
  Stack
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconLanguage, IconSearch } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { BilingualInput } from '@/components/BilingualInput';
import { showNotification } from '@mantine/notifications';

interface Translation {
  id: string;
  key: string;
  valueEn: string;
  valueHi?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'homepage', label: 'Homepage' },
  { value: 'about', label: 'About Us' },
  { value: 'initiatives', label: 'Initiatives' },
  { value: 'media', label: 'Media' },
  { value: 'forms', label: 'Forms' },
  { value: 'buttons', label: 'Buttons' },
  { value: 'errors', label: 'Error Messages' },
  { value: 'success', label: 'Success Messages' }
];

export default function TranslationsPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    key: '',
    valueEn: '',
    valueHi: '',
    category: 'general'
  });

  const fetchTranslations = async (page = 1, category = '', search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        ...(category && { category }),
        ...(search && { search })
      });
      
      const response = await fetch(`/api/translations?${params}`);
      const data = await response.json();
      
      setTranslations(data.translations);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching translations:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to fetch translations',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations(currentPage, selectedCategory, searchQuery);
  }, [currentPage, selectedCategory, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTranslation 
        ? `/api/translations/${editingTranslation.id}`
        : '/api/translations';
      
      const method = editingTranslation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: editingTranslation 
            ? 'Translation updated successfully' 
            : 'Translation created successfully',
          color: 'green'
        });
        
        fetchTranslations(currentPage, selectedCategory, searchQuery);
        handleCloseModal();
      } else {
        throw new Error('Failed to save translation');
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to save translation',
        color: 'red'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this translation?')) return;
    
    try {
      const response = await fetch(`/api/translations/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: 'Translation deleted successfully',
          color: 'green'
        });
        
        fetchTranslations(currentPage, selectedCategory, searchQuery);
      } else {
        throw new Error('Failed to delete translation');
      }
    } catch (error) {
      console.error('Error deleting translation:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to delete translation',
        color: 'red'
      });
    }
  };

  const handleEdit = (translation: Translation) => {
    setEditingTranslation(translation);
    setFormData({
      key: translation.key,
      valueEn: translation.valueEn,
      valueHi: translation.valueHi || '',
      category: translation.category
    });
    open();
  };

  const handleCloseModal = () => {
    setEditingTranslation(null);
    setFormData({
      key: '',
      valueEn: '',
      valueHi: '',
      category: 'general'
    });
    close();
  };

  const handleBulkImport = async () => {
    // TODO: Implement bulk import functionality
    showNotification({
      title: 'Coming Soon',
      message: 'Bulk import functionality will be available soon',
      color: 'blue'
    });
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/translations/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'translations.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting translations:', error);
      showNotification({
        title: 'Error',
        message: 'Failed to export translations',
        color: 'red'
      });
    }
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Translation Management</Title>
        <Group>
          <Button variant="light" onClick={handleBulkImport}>
            Bulk Import
          </Button>
          <Button variant="light" onClick={handleExport}>
            Export
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Add Translation
          </Button>
        </Group>
      </Group>

      {/* Statistics Cards */}
      <Grid mb="lg">
        <Grid.Col span={3}>
          <Card withBorder>
            <Stack align="center">
              <Text size="xl" fw={700}>{translations.length}</Text>
              <Text c="dimmed" size="sm">Total Translations</Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card withBorder>
            <Stack align="center">
              <Text size="xl" fw={700} c="green">
                {translations.filter(t => t.valueHi).length}
              </Text>
              <Text c="dimmed" size="sm">Hindi Translations</Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card withBorder>
            <Stack align="center">
              <Text size="xl" fw={700} c="orange">
                {translations.filter(t => !t.valueHi).length}
              </Text>
              <Text c="dimmed" size="sm">Missing Hindi</Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card withBorder>
            <Stack align="center">
              <Text size="xl" fw={700} c="blue">
                {CATEGORIES.length}
              </Text>
              <Text c="dimmed" size="sm">Categories</Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Filters */}
      <Paper withBorder p="md" mb="lg">
        <Group>
          <TextInput
            placeholder="Search translations..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by category"
            data={[{ value: '', label: 'All Categories' }, ...CATEGORIES]}
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value || '')}
            w={200}
          />
        </Group>
      </Paper>

      {/* Translations Table */}
      <Paper withBorder>
        {loading ? (
          <Group justify="center" p="xl">
            <Loader />
          </Group>
        ) : translations.length === 0 ? (
          <Alert color="blue" p="xl">
            <Text ta="center">No translations found. Add your first translation to get started!</Text>
          </Alert>
        ) : (
          <>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Key</Table.Th>
                  <Table.Th>English</Table.Th>
                  <Table.Th>Hindi</Table.Th>
                  <Table.Th>Category</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {translations.map((translation) => (
                  <Table.Tr key={translation.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{translation.key}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={2}>{translation.valueEn}</Text>
                    </Table.Td>
                    <Table.Td>
                      {translation.valueHi ? (
                        <Text size="sm" lineClamp={2} style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                          {translation.valueHi}
                        </Text>
                      ) : (
                        <Text c="dimmed" size="sm" fs="italic">Not translated</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" size="sm">
                        {CATEGORIES.find(c => c.value === translation.category)?.label || translation.category}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {translation.valueHi ? (
                        <Badge color="green" size="sm">Complete</Badge>
                      ) : (
                        <Badge color="orange" size="sm">Incomplete</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon 
                          variant="light" 
                          color="blue" 
                          size="sm"
                          onClick={() => handleEdit(translation)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon 
                          variant="light" 
                          color="red" 
                          size="sm"
                          onClick={() => handleDelete(translation.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            
            {totalPages > 1 && (
              <Group justify="center" p="md">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                />
              </Group>
            )}
          </>
        )}
      </Paper>

      {/* Add/Edit Modal */}
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={editingTranslation ? 'Edit Translation' : 'Add Translation'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Translation Key"
              placeholder="e.g., nav.home, button.submit"
              required
              value={formData.key}
              onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
              description="Use dot notation for nested keys (e.g., nav.home, forms.contact.title)"
            />

            <Select
              label="Category"
              required
              data={CATEGORIES}
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value || 'general' }))}
            />

            <BilingualInput
              label="Translation Value"
              required
              valueEn={formData.valueEn}
              valueHi={formData.valueHi}
              onChangeEn={(value) => setFormData(prev => ({ ...prev, valueEn: value }))}
              onChangeHi={(value) => setFormData(prev => ({ ...prev, valueHi: value }))}
              placeholder="Enter English text"
              placeholderHi="हिंदी अनुवाद दर्ज करें"
              multiline
              rows={3}
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" leftSection={<IconLanguage size={16} />}>
                {editingTranslation ? 'Update' : 'Create'} Translation
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}