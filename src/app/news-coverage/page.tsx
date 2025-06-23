'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Paper,
  Title,
  Grid,
  Image,
  ActionIcon,
  Text,
  FileButton,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import { formatDate } from '@/utils/formatDate';
import { handleImageUpload } from '@/utils/imageUpload';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface NewsArticle {
  id: number;
  title: string;
  titleHi?: string;
  source: string;
  date: Date;
  imageUrl?: string;
  link?: string;
  description?: string;
  descriptionHi?: string;
  createdAt: string;
  updatedAt: string;
}

export default function NewsCoverage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    titleHi: '',
    source: '',
    date: new Date(),
    imageUrl: '',
    link: '',
    description: '',
    descriptionHi: ''
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch news',
        color: 'red'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create news');
      }

      notifications.show({
        title: 'Success',
        message: 'News created successfully',
        color: 'green'
      });

      setFormData({
        title: '',
        titleHi: '',
        source: '',
        date: new Date(),
        imageUrl: '',
        link: '',
        description: '',
        descriptionHi: ''
      });

      fetchNews();
    } catch (error) {
      console.error('Error creating news:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create news',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete news');
      }

      notifications.show({
        title: 'Success',
        message: 'News deleted successfully',
        color: 'green'
      });

      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete news',
        color: 'red'
      });
    }
  };

  const onImageUpload = async (file: File | null) => {
    try {
      const url = await handleImageUpload(file);
      if (url) {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        notifications.show({
          title: 'Success',
          message: 'Image uploaded successfully',
          color: 'green'
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red'
      });
    }
  };

  return (
    <ErrorBoundary>
      <Title order={2} mb="lg">Manage News Coverage</Title>

      <Grid>
        <Grid.Col span={7}>
          <Paper shadow="sm" p="md">
            <form onSubmit={handleSubmit}>
              <Stack>
                <TextInput
                  label="Title (English)"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                
                <TextInput
                  label="Title (Hindi)"
                  value={formData.titleHi}
                  onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                  placeholder="समाचार का शीर्षक"
                  style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                />
                
                <TextInput
                  label="Source"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
                
                <DateInput
                  label="Date"
                  required
                  value={formData.date}
                  onChange={(date) => setFormData({ ...formData, date: date || new Date() })}
                />
                
                <FileButton
                  onChange={onImageUpload}
                  accept="image/png,image/jpeg,image/gif,image/webp"
                >
                  {(props) => <Button {...props}>Upload Image</Button>}
                </FileButton>
                
                <TextInput
                  label="Link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
                
                <Textarea
                  label="Description (English)"
                  required
                  minRows={4}
                  maxRows={8}
                  styles={{
                    input: {
                      height: '120px',
                      minHeight: '120px',
                      resize: 'vertical',
                    },
                  }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <Textarea
                  label="Description (Hindi)"
                  minRows={4}
                  maxRows={8}
                  styles={{
                    input: {
                      height: '120px',
                      minHeight: '120px',
                      resize: 'vertical',
                      fontFamily: 'Noto Sans Devanagari, sans-serif',
                    },
                  }}
                  value={formData.descriptionHi}
                  onChange={(e) => setFormData({ ...formData, descriptionHi: e.target.value })}
                  placeholder="समाचार का विवरण"
                />
                
                <Group justify="flex-end">
                  <Button type="submit" loading={loading}>
                    Add News
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Grid.Col>

        <Grid.Col span={5}>
          <Paper shadow="sm" p="md">
            <Title order={3} mb="md">News List</Title>
            <Stack>
              {news.map((item) => (
                <Paper key={item.id} shadow="xs" p="sm">
                  <Group justify="space-between" mb="xs">
                    <div style={{ flex: 1 }}>
                      <Title order={4} mb="xs">{item.title}</Title>
                      {item.titleHi && (
                        <Text 
                          size="sm" 
                          c="dimmed" 
                          mb="xs"
                          style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                        >
                          {item.titleHi}
                        </Text>
                      )}
                    </div>
                    <Group gap="xs">
                      <ActionIcon
                        color="blue"
                        onClick={() => {/* Implement edit */ }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        onClick={() => handleDelete(item.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  
                  <Text size="sm" c="dimmed" mb="xs">
                    {item.source} - {formatDate(new Date(item.date))}
                  </Text>
                  
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      height={120}
                      fit="cover"
                      mb="xs"
                    />
                  )}
                  
                  {item.description && (
                    <Text size="sm" lineClamp={3} mb="xs">
                      {item.description}
                    </Text>
                  )}
                  
                  {item.descriptionHi && (
                    <Text 
                      size="sm" 
                      lineClamp={3} 
                      c="dimmed"
                      style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                    >
                      {item.descriptionHi}
                    </Text>
                  )}
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </ErrorBoundary>
  );
}