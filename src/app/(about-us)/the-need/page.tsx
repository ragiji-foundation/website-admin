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
  Tabs,
  Text,
  Code,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTheNeed } from '@/context/TheNeedContext';
import TheNeedPreview from '@/components/TheNeedPreview';
import TipTapEditor from '@/components/TipTapEditor/TipTapEditor';
import { MediaUpload } from '@/components/MediaUpload';

// Add interface to define type for submission data
interface TheNeedSubmission {
  id?: string;
  mainText: string;
  statistics: string;
  impact: string;
  imageUrl: string;
  statsImageUrl: string;
  isPublished: boolean;
}

export default function TheNeedAdminPage() {
  const { data, setData } = useTheNeed();
  const [loading, setLoading] = useState(false);
  const [mainText, setMainText] = useState('');
  const [statistics, setStatistics] = useState('');
  const [impact, setImpact] = useState('');

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    // Initialize TipTap editors with existing content when data is loaded
    if (data) {
      setMainText(data.mainText || '');
      setStatistics(data.statistics || '');
      setImpact(data.impact || '');
    }
  }, [data]);

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

  // Add a debug function
  const testDatabaseConnection = async () => {
    try {
      const response = await fetch('/api/db-test');
      const data = await response.json();
      console.log('Database test result:', data);
      alert('Database test completed. Check console for details.');
    } catch (error) {
      console.error('Database test error:', error);
      alert('Database test failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Form submission started');

      // Check if required fields are present
      if (!mainText || !statistics || !impact) {
        notifications.show({
          title: 'Error',
          message: 'All text fields are required',
          color: 'red'
        });
        setLoading(false);
        return;
      }

      // Check if images are present
      if (!data?.imageUrl || !data?.statsImageUrl) {
        notifications.show({
          title: 'Error',
          message: 'Both images are required',
          color: 'red'
        });
        setLoading(false);
        return;
      }

      // Create a data object with the optional id property in the type
      const submissionData: TheNeedSubmission = {
        mainText,
        statistics,
        impact,
        imageUrl: data?.imageUrl || '',
        statsImageUrl: data?.statsImageUrl || '',
        isPublished: Boolean(data?.isPublished)
      };

      // Now TypeScript knows id can be added to this object
      if (data?.id) {
        submissionData.id = data.id;
      }

      console.log('Submitting data:', submissionData);

      // Make the API request with more detailed error handling
      const response = await fetch('/api/the-need', {
        method: data?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      // Get full response details
      const responseText = await response.text();
      console.log(`API Response (Status ${response.status}):`, responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response JSON:', responseText);
        throw new Error(`Invalid API response (Status ${response.status}): ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(responseData.error || `Server error: ${response.status}`);
      }

      // Success!
      console.log('Save successful, received:', responseData);
      notifications.show({
        title: 'Success',
        message: `Content saved successfully (ID: ${responseData.id})`,
        color: 'green'
      });

      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Save error:', err);
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : String(err),
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = (field: 'imageUrl' | 'statsImageUrl', url: string) => {
    setData(prev => ({
      ...prev!,
      [field]: url
    }));
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
                <TipTapEditor
                  content={mainText}
                  onChange={setMainText}
                  minHeight={300}
                  label="Main Text"
                  required
                  placeholder="Enter the main content here..."
                />
              </Box>

              <Box>
                <Title order={3}>Statistics</Title>
                <TipTapEditor
                  content={statistics}
                  onChange={setStatistics}
                  minHeight={250}
                  label="Statistics"
                  required
                  placeholder="Enter statistics content here..."
                />
              </Box>

              <Box>
                <Title order={3}>Impact</Title>
                <TipTapEditor
                  content={impact}
                  onChange={setImpact}
                  minHeight={250}
                  label="Impact"
                  required
                  placeholder="Enter impact content here..."
                />
              </Box>

              <Box>
                <Title order={3} mb="sm">Images</Title>
                <Group grow align="flex-start">
                  <MediaUpload
                    label="Main Image"
                    mediaType="image"
                    folder="the-need"
                    value={data?.imageUrl || ''}
                    onChange={(url) => handleImageUpdate('imageUrl', url)}
                    withPreview
                  />

                  <MediaUpload
                    label="Statistics Image"
                    mediaType="image"
                    folder="the-need/stats"
                    value={data?.statsImageUrl || ''}
                    onChange={(url) => handleImageUpdate('statsImageUrl', url)}
                    withPreview
                  />
                </Group>
              </Box>

              <Switch
                label="Published"
                checked={data?.isPublished || false}
                onChange={(e) => {
                  // Fix: Safely handle null data
                  if (data) {
                    setData({ ...data, isPublished: e.currentTarget.checked });
                  } else {
                    setData(prev => ({
                      ...prev!,
                      isPublished: e.currentTarget.checked
                    }));
                  }
                }}
                mt="md"
              />

              <Group justify="space-between" mt="xl">
                <Button
                  variant="outline"
                  color="cyan"
                  onClick={testDatabaseConnection}
                >
                  Test Database Connection
                </Button>

                <Button
                  type="submit"
                  loading={loading}
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan' }}
                  size="md"
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>

          {/* Add debugging panel (remove in production) */}
          <Box mt="xl" p="md" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
            <Text fw={500} mb="xs">Debug Information</Text>
            <Text size="sm">Data loaded: {data ? 'Yes' : 'No'}</Text>
            <Text size="sm">Main text length: {mainText?.length || 0} chars</Text>
            <Text size="sm">Statistics length: {statistics?.length || 0} chars</Text>
            <Text size="sm">Impact length: {impact?.length || 0} chars</Text>
            <Text size="sm">Main image: {data?.imageUrl ? 'Present' : 'Missing'}</Text>
            <Text size="sm">Stats image: {data?.statsImageUrl ? 'Present' : 'Missing'}</Text>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="preview">
          <TheNeedPreview />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}