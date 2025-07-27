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
  Select
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconNews, IconExternalLink, IconCalendar } from '@tabler/icons-react';
import { BilingualInput } from '@/components/BilingualInput';

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
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [opened, { open, close }] = useDisclosure(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);

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

  const fetchArticles = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSource) params.append('source', selectedSource);
      
      const response = await fetch(`/api/news-articles?${params}`);
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Error fetching news articles:', error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedSource]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const formattedValues = {
        ...values,
        date: values.date.toISOString()
      };

      const url = editingArticle 
        ? `/api/news-articles/${editingArticle.id}`
        : '/api/news-articles';
      
      const method = editingArticle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedValues),
      });

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: editingArticle 
            ? 'News article updated successfully' 
            : 'News article added successfully',
          color: 'green'
        });
        fetchArticles();
        handleCloseModal();
      }
    } catch (error) {
      showNotification({
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
      const response = await fetch(`/api/news-articles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification({
          title: 'Success',
          message: 'News article deleted successfully',
          color: 'green'
        });
        fetchArticles();
      }
    } catch (error) {
      showNotification({
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
          <Text size="lg" fw={700}>{articles.length}</Text>
          <Text size="sm" c="dimmed">Total Articles</Text>
        </Card>
        <Card withBorder>
          <Text size="lg" fw={700} c="blue">
            {articles.filter(a => getTranslationStatus(a) === 'complete').length}
          </Text>
          <Text size="sm" c="dimmed">Fully Translated</Text>
        </Card>
        <Card withBorder>
          <Text size="lg" fw={700} c="green">
            {articles.filter(a => a.link).length}
          </Text>
          <Text size="sm" c="dimmed">With Links</Text>
        </Card>
        <Select
          placeholder="Filter by source"
          data={[
            { value: '', label: 'All Sources' },
            ...NEWS_SOURCES.map(source => ({ value: source, label: source }))
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
            {articles.map((article) => (
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

      {articles.length === 0 && (
        <Paper withBorder p="xl">
          <Stack align="center" gap="md">
            <IconNews size={48} color="#adb5bd" />
            <Text c="dimmed" ta="center">
              No news articles found. Add your first media coverage!
            </Text>
          </Stack>
        </Paper>
      )}

      {/* Add/Edit Modal */}
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title={editingArticle ? 'Edit News Article' : 'Add News Article'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
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
              />
            </Group>

            <BilingualInput
              label="Description"
              valueEn={form.values.description}
              valueHi={form.values.descriptionHi}
              onChangeEn={(value) => form.setFieldValue('description', value)}
              onChangeHi={(value) => form.setFieldValue('descriptionHi', value)}
              placeholder="Brief description or excerpt (optional)"
              placeholderHi="संक्षिप्त विवरण या अंश (वैकल्पिक)"
              multiline
              rows={3}
            />

            <BilingualInput
              label="Article Link"
              valueEn={form.values.link}
              valueHi=""
              onChangeEn={(value) => form.setFieldValue('link', value)}
              onChangeHi={() => {}}
              placeholder="https://example.com/article"
              description="Link to the full article (optional)"
            />

            <BilingualInput
              label="Article Image URL"
              valueEn={form.values.imageUrl}
              valueHi=""
              onChangeEn={(value) => form.setFieldValue('imageUrl', value)}
              onChangeHi={() => {}}
              placeholder="https://example.com/article-image.jpg"
              description="Featured image for the article (optional)"
            />

            <Group justify="flex-end">
              <Button variant="light" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" leftSection={<IconNews size={16} />}>
                {editingArticle ? 'Update' : 'Add'} Article
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}