'use client';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Title,
  Button,
  Group,
  Stack,
  Switch,
  FileInput,
  Tabs,
} from '@mantine/core';
import LexicalEditor from '@/components/LexicalEditor';
import { notifications } from '@mantine/notifications';
import { uploadImage } from '@/utils/upload';
import { useTheNeed } from '@/context/TheNeedContext';
import TheNeedPreview from '@/components/TheNeedPreview';

export default function TheNeedAdminPage() {
  const { data, setData } = useTheNeed();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{ main: boolean; stats: boolean }>({ main: false, stats: false });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/the-need');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/the-need', {
        method: data?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to save');

      notifications.show({
        title: 'Success',
        message: 'Content saved successfully',
        color: 'green'
      });

      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'main' | 'stats') => {
    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      const url = await uploadImage(file);

      setData(prev => ({
        ...prev!,
        [type === 'main' ? 'imageUrl' : 'statsImageUrl']: url,
      }));

      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red'
      });
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Manage &quot;The Need&quot; Content</Title>

      <Tabs defaultValue="edit">
        <Tabs.List mb="xl">
          <Tabs.Tab value="edit">Edit Content</Tabs.Tab>
          <Tabs.Tab value="preview">Preview</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="edit">
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Box>
                <Title order={3}>Main Text</Title>
                <LexicalEditor
                  content={data?.mainText || null}
                  onChange={(value) => setData(prev => ({
                    ...prev!,
                    mainText: value ? JSON.stringify(value) : null
                  }))}
                  required
                />
              </Box>

              <Box>
                <Title order={3}>Statistics</Title>
                <LexicalEditor
                  content={data?.statistics || null}
                  onChange={(value) => setData(prev => ({
                    ...prev!,
                    statistics: value ? JSON.stringify(value) : null
                  }))}
                  required
                />
              </Box>

              <Box>
                <Title order={3}>Impact</Title>
                <LexicalEditor
                  content={data?.impact || null}
                  onChange={(value) => setData(prev => ({
                    ...prev!,
                    impact: value ? JSON.stringify(value) : null
                  }))}
                  required
                />
              </Box>

              <Box>
                {uploading.main ? (
                  <div>Loading...</div>
                ) : (
                  <FileInput
                    label="Main Image"
                    placeholder="Upload image"
                    accept="image/*"
                    onChange={(file) => file && handleImageUpload(file, 'main')}
                  />
                )}
              </Box>

              <Box>
                {uploading.stats ? (
                  <div>Loading...</div>
                ) : (
                  <FileInput
                    label="Statistics Image"
                    placeholder="Upload image"
                    accept="image/*"
                    onChange={(file) => file && handleImageUpload(file, 'stats')}
                  />
                )}
              </Box>

              <Switch
                label="Published"
                checked={data?.isPublished}
                onChange={(e) => setData(prev => ({ ...prev!, isPublished: e.currentTarget.checked }))}
              />

              <Group justify="flex-end">
                <Button type="submit" loading={loading}>
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="preview">
          <TheNeedPreview />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}