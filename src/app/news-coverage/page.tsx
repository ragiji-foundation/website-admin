'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Button,
  Group,
  Stack,
  Paper,
  Table,
  Modal,
  ActionIcon,
  Badge,
  Text,
  Card,
  Image,
  Select,
  LoadingOverlay,
  Alert
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconNews, IconExternalLink, IconCalendar, IconExclamationCircle, IconEye } from '@tabler/icons-react';
import { BilingualInput } from '@/components/BilingualInput';
import { MediaUpload } from '@/components/MediaUpload';
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import Link from 'next/link';

interface NewsArticle {
  id: number;
  title: string;
  titleHi?: string;
  source: string;
  date: string;
  imageUrl?: string;
  link?: string;
  description?: string;
  descriptionHi?: string;
  createdAt: string;
}

const NEWS_SOURCES = [
  'The Hindu',
  'Times of India',
  'Indian Express',
  'Hindustan Times',
  'Dainik Jagran',
  'Amar Ujala',
  'Dainik Bhaskar',
  'Local Newspaper',
  'Online Portal',
  'Press Release'
];

export default function NewsArticlesPage() {
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [opened, { open, close }] = useDisclosure(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);

  // ✅ MIGRATED: Using centralized hooks instead of manual API calls
  const { data: apiResponse, loading, error, refetch } = useApiData<any>(
    '/api/news-coverage',
    [],
    { 
      showNotifications: true
    }
  );

  // Extract articles from the API response
  const articles: NewsArticle[] = apiResponse?.success ? apiResponse.data : apiResponse || [];

  // ✅ MIGRATED: Using centralized CRUD operations
  const { create, update, remove, loading: crudLoading } = useCrudOperations<NewsArticle>('/api/news-coverage', {
    showNotifications: true,
    onSuccess: () => {
      refetch();
      handleCloseModal();
    }
  });

  const form = useForm({
    initialValues: {
      title: '',
      titleHi: '',
      source: '',
      date: new Date(),
      imageUrl: '',
      link: '',
      description: '',
      descriptionHi: ''
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
      source: (value) => (!value ? 'Source is required' : null),
      date: (value) => (!value ? 'Date is required' : null),
    },
  });

  // Filter articles by source and get unique sources from data
  const availableSources = Array.from(new Set(articles.map(article => article.source)));
  const filteredArticles = selectedSource 
    ? articles.filter(article => article.source === selectedSource)
    : articles;

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const formattedValues = {
        ...values,
        date: values.date.toISOString()
      };

      if (editingArticle) {
        await update(editingArticle.id, formattedValues);
      } else {
        await create(formattedValues);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save news article',
        color: 'red'
      });
    }
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    form.setValues({
      title: article.title,
      titleHi: article.titleHi || '',
      source: article.source,
      date: new Date(article.date),
      imageUrl: article.imageUrl || '',
      link: article.link || '',
      description: article.description || '',
      descriptionHi: article.descriptionHi || ''
    });
    open();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;
    
    try {
      await remove(id);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete news article',
        color: 'red'
      });
    }
  };

  const handleCloseModal = () => {
    setEditingArticle(null);
    form.reset();
    close();
  };

  const getTranslationStatus = (article: NewsArticle) => {
    const hasHindi = article.titleHi && (article.description ? article.descriptionHi : true);
    return hasHindi ? 'complete' : 'partial';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container size="xl" py="md">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="md">
        <Alert icon={<IconExclamationCircle size={16} />} color="red" variant="light">
          {typeof error === 'string' ? error : 'Failed to load news articles'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>News & Media Coverage</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={open}>
          Add News Article
        </Button>
      </Group>

      {/* Statistics & Filters */}
      <Group mb="lg">
        <Card withBorder>
          <Text size="lg" fw={700}>{filteredArticles.length}</Text>
          <Text size="sm" c="dimmed">Total Articles</Text>
        </Card>
        <Card withBorder>
          <Text size="lg" fw={700} c="blue">
            {filteredArticles.filter(a => getTranslationStatus(a) === 'complete').length}
          </Text>
          <Text size="sm" c="dimmed">Fully Translated</Text>
        </Card>
        <Card withBorder>
          <Text size="lg" fw={700} c="green">
            {filteredArticles.filter(a => a.link).length}
          </Text>
          <Text size="sm" c="dimmed">With Links</Text>
        </Card>
        <Select
          placeholder="Filter by source"
          data={[
            { value: '', label: 'All Sources' },
            ...Array.from(new Set([...NEWS_SOURCES, ...availableSources])).map(source => ({ 
              value: source, 
              label: source 
            }))
          ]}
          value={selectedSource}
          onChange={(value) => setSelectedSource(value || '')}
          w={200}
        />
      </Group>

      {/* Articles Table */}
      <Paper withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Article</Table.Th>
              <Table.Th>Source</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Translation</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredArticles.map((article) => (
              <Table.Tr key={article.id}>
                <Table.Td>
                  <Group>
                    {article.imageUrl ? (
                      <Image 
                        src={article.imageUrl} 
                        alt={article.title}
                        w={60} 
                        h={60} 
                        radius="md"
                        fallbackSrc="/placeholder-news.jpg"
                      />
                    ) : (
                      <div style={{ 
                        width: 60, 
                        height: 60, 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <IconNews size={24} color="#adb5bd" />
                      </div>
                    )}
                    <div style={{ maxWidth: 250 }}>
                      <Text fw={500} lineClamp={2}>{article.title}</Text>
                      {article.titleHi && (
                        <Text size="sm" c="dimmed" lineClamp={1} style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                          {article.titleHi}
                        </Text>
                      )}
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" size="sm">
                    {article.source}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <IconCalendar size={16} color="#adb5bd" />
                    <Text size="sm">{formatDate(article.date)}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  {article.description ? (
                    <div>
                      <Text size="sm" lineClamp={2} maw={200}>
                        {article.description}
                      </Text>
                      {article.descriptionHi && (
                        <Text size="xs" c="dimmed" lineClamp={1} style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                          {article.descriptionHi}
                        </Text>
                      )}
                    </div>
                  ) : (
                    <Text c="dimmed" size="sm" fs="italic">
                      No description
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Badge 
                    color={getTranslationStatus(article) === 'complete' ? 'green' : 'orange'}
                    size="sm"
                  >
                    {getTranslationStatus(article) === 'complete' ? 'Complete' : 'Partial'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Link href={`/news-coverage/${article.id}`}>
                      <ActionIcon variant="light" color="blue">
                        <IconEye size={16} />
                      </ActionIcon>
                    </Link>
                    {article.link && (
                      <ActionIcon 
                        variant="light" 
                        color="blue"
                        component="a"
                        href={article.link}
                        target="_blank"
                      >
                        <IconExternalLink size={16} />
                      </ActionIcon>
                    )}
                    <ActionIcon variant="light" color="green" onClick={() => handleEdit(article)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="red" onClick={() => handleDelete(article.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {filteredArticles.length === 0 && (
        <Paper withBorder p="xl">
          <Stack align="center" gap="md">
            <IconNews size={48} color="#adb5bd" />
            <Text c="dimmed" ta="center">
              {selectedSource 
                ? `No news articles found for source: ${selectedSource}`
                : 'No news articles found. Add your first media coverage!'
              }
            </Text>
          </Stack>
        </Paper>
      )}

      {/* Add/Edit Modal */}
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={
          <Group gap="sm">
            <IconNews size={20} />
            <div>
              <Text size="lg" fw={600}>
                {editingArticle ? 'Edit News Article' : 'Add News Article'}
              </Text>
              <Text size="xs" c="dimmed">
                {editingArticle ? 'Update news article information' : 'Create a new news article entry'}
              </Text>
            </div>
          </Group>
        }
        size="xl"
        radius="lg"
        centered
        padding="xl"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg">
            {/* Header Section */}
            <Paper withBorder p="md" radius="md">
              <Text fw={500} size="sm" mb="md" c="blue">
                Article Information
              </Text>
              <Stack gap="md">
                <BilingualInput
                  label="Article Title"
                  required
                  valueEn={form.values.title}
                  valueHi={form.values.titleHi}
                  onChangeEn={(value) => form.setFieldValue('title', value)}
                  onChangeHi={(value) => form.setFieldValue('titleHi', value)}
                  placeholder="Enter article headline"
                  placeholderHi="लेख का शीर्षक दर्ज करें"
                  error={form.errors.title as string}
                />

                <Group grow>
                  <Select
                    label="News Source"
                    placeholder="Select source"
                    required
                    data={NEWS_SOURCES}
                    value={form.values.source}
                    onChange={(value) => form.setFieldValue('source', value || '')}
                    error={form.errors.source as string}
                    searchable
                    allowDeselect
                    leftSection={<IconNews size={16} />}
                    onOptionSubmit={(value) => {
                      if (!NEWS_SOURCES.includes(value)) {
                        NEWS_SOURCES.push(value);
                      }
                      form.setFieldValue('source', value);
                    }}
                  />
                  <DatePickerInput
                    label="Publication Date"
                    placeholder="Pick date"
                    required
                    value={form.values.date}
                    onChange={(value) => form.setFieldValue('date', value || new Date())}
                    error={form.errors.date as string}
                    leftSection={<IconCalendar size={16} />}
                  />
                </Group>
              </Stack>
            </Paper>

            {/* Content Section */}
            <Paper withBorder p="md" radius="md">
              <Text fw={500} size="sm" mb="md" c="green">
                Article Content
              </Text>
              <Stack gap="md">
                <BilingualInput
                  label="Description"
                  valueEn={form.values.description}
                  valueHi={form.values.descriptionHi}
                  onChangeEn={(value) => form.setFieldValue('description', value)}
                  onChangeHi={(value) => form.setFieldValue('descriptionHi', value)}
                  placeholder="Brief description or excerpt (optional)"
                  placeholderHi="संक्षिप्त विवरण या अंश (वैकल्पिक)"
                  multiline
                  rows={4}
                />
              </Stack>
            </Paper>

            {/* Media & Links Section */}
            <Paper withBorder p="md" radius="md">
              <Text fw={500} size="sm" mb="md" c="orange">
                Media & Links
              </Text>
              <Stack gap="md">
                <BilingualInput
                  label="Article Link"
                  valueEn={form.values.link}
                  valueHi=""
                  onChangeEn={(value) => form.setFieldValue('link', value)}
                  onChangeHi={() => {}}
                  placeholder="https://example.com/article"
                  description="Link to the full article (optional)"
                />

                <Stack gap="xs">
                  <MediaUpload
                    label="Article Image"
                    value={form.values.imageUrl || ''}
                    onChange={(url) => form.setFieldValue('imageUrl', url)}
                    folder="news-articles"
                  />
                  <Text size="xs" c="dimmed">
                    Featured image for the article (optional)
                  </Text>
                </Stack>

                {/* Image Preview */}
                {form.values.imageUrl && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">Image Preview</Text>
                    <Image
                      src={form.values.imageUrl}
                      height={200}
                      fit="contain"
                      radius="md"
                      fallbackSrc="/placeholder-news.jpg"
                      alt="Article preview"
                    />
                  </div>
                )}
              </Stack>
            </Paper>

            {/* Translation Status */}
            <Paper withBorder p="md" radius="md" bg="gray.0">
              <Text fw={500} size="sm" mb="md">
                Translation Status
              </Text>
              <Group gap="md">
                <Group gap="xs">
                  <Text size="sm">English Content:</Text>
                  <Badge 
                    color={form.values.title && (form.values.description || !form.values.description) ? 'green' : 'red'}
                    size="sm"
                  >
                    {form.values.title ? 'Complete' : 'Incomplete'}
                  </Badge>
                </Group>
                <Group gap="xs">
                  <Text size="sm">Hindi Content:</Text>
                  <Badge 
                    color={form.values.titleHi && (form.values.descriptionHi || !form.values.description) ? 'green' : 'orange'}
                    size="sm"
                  >
                    {form.values.titleHi ? 'Complete' : 'Partial'}
                  </Badge>
                </Group>
                <Group gap="xs">
                  <Text size="sm">Media:</Text>
                  <Badge 
                    color={form.values.imageUrl || form.values.link ? 'green' : 'yellow'}
                    size="sm"
                  >
                    {form.values.imageUrl || form.values.link ? 'Available' : 'Missing'}
                  </Badge>
                </Group>
              </Group>
            </Paper>

            {/* Action Buttons */}
            <Group justify="space-between" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
              <Button 
                variant="light" 
                color="gray"
                onClick={handleCloseModal}
                leftSection={<IconExclamationCircle size={16} />}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                leftSection={<IconNews size={16} />}
                loading={crudLoading}
                gradient={{ from: 'blue', to: 'cyan' }}
                variant="gradient"
              >
                {editingArticle ? 'Update Article' : 'Create Article'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}