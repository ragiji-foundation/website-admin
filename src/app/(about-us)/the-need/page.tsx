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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTheNeed } from '@/context/TheNeedContext';
import TheNeedPreview from '@/components/TheNeedPreview';
import TiptapEditor from '@/components/TiptapEditor';
import { MediaUpload } from '@/components/MediaUpload';

// ✅ MIGRATED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

// Add interface to define type for submission data
interface TheNeedSubmission {
  id?: string;
  mainText: string;
  mainTextHi?: string;
  statistics: string;
  statisticsHi?: string;
  impact: string;
  impactHi?: string;
  imageUrl: string;
  statsImageUrl: string;
  isPublished: boolean;
}

export default function TheNeedAdminPage() {
  const { data: contextData, setData } = useTheNeed();
  const [mainText, setMainText] = useState('');
  const [mainTextHi, setMainTextHi] = useState('');
  const [statistics, setStatistics] = useState('');
  const [statisticsHi, setStatisticsHi] = useState('');
  const [impact, setImpact] = useState('');
  const [impactHi, setImpactHi] = useState('');

  // ✅ MIGRATED: Use centralized data fetching
  const { data, loading: _loading, error: _error } = useApiData<TheNeedSubmission>('/api/the-need', {} as TheNeedSubmission);
  const { create, update, loading: isSubmitting } = useCrudOperations<TheNeedSubmission>('/api/the-need');

  // ✅ MIGRATED: Update context when centralized data changes
  useEffect(() => {
    if (data) {
      setData(data);
    }
  }, [data, setData]);

  useEffect(() => {
    // Initialize TipTap editors with existing content when data is loaded
    if (contextData) {
      setMainText(contextData.mainText || '');
      setMainTextHi(contextData.mainTextHi || '');
      setStatistics(contextData.statistics || '');
      setStatisticsHi(contextData.statisticsHi || '');
      setImpact(contextData.impact || '');
      setImpactHi(contextData.impactHi || '');
    }
  }, [contextData]);

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

  // ✅ MIGRATED: Centralized form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Form submission started');

      // Check if required fields are present
      if (!mainText || !statistics || !impact) {
        notifications.show({
          title: 'Error',
          message: 'All English text fields are required',
          color: 'red'
        });
        return;
      }

      // Check if images are present
      if (!contextData?.imageUrl || !contextData?.statsImageUrl) {
        notifications.show({
          title: 'Error',
          message: 'Both images are required',
          color: 'red'
        });
        return;
      }

      // Create a data object with the optional id property in the type
      const submissionData: TheNeedSubmission = {
        mainText,
        mainTextHi: mainTextHi || undefined,
        statistics,
        statisticsHi: statisticsHi || undefined,
        impact,
        impactHi: impactHi || undefined,
        imageUrl: contextData?.imageUrl || '',
        statsImageUrl: contextData?.statsImageUrl || '',
        isPublished: Boolean(contextData?.isPublished)
      };

      // Now TypeScript knows id can be added to this object
      if (contextData?.id) {
        submissionData.id = contextData.id;
      }

      console.log('Submitting data:', submissionData);

      let result;
      if (contextData?.id) {
        result = await update(contextData.id, submissionData);
      } else {
        result = await create(submissionData);
      }

      if (result) {
        console.log('Save successful, received:', result);
        notifications.show({
          title: 'Success',
          message: `Content saved successfully (ID: ${result.id})`,
          color: 'green'
        });
      }
    } catch (err) {
      console.error('Save error:', err);
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
                <Title order={3}>Main Text (English)</Title>
                <TiptapEditor
                  content={mainText}
                  onChange={setMainText}
                  minHeight={300}
                  label="Main Text (English)"
                  required
                  placeholder="Enter the main content in English..."
                />
              </Box>

              <Box>
                <Title order={3}>Main Text (Hindi)</Title>
                <TiptapEditor
                  content={mainTextHi}
                  onChange={setMainTextHi}
                  minHeight={300}
                  label="Main Text (Hindi)"
                  required={false}
                  placeholder="मुख्य सामग्री हिंदी में दर्ज करें..."
                />
              </Box>

              <Box>
                <Title order={3}>Statistics (English)</Title>
                <TiptapEditor
                  content={statistics}
                  onChange={setStatistics}
                  minHeight={250}
                  label="Statistics (English)"
                  required
                  placeholder="Enter statistics content in English..."
                />
              </Box>

              <Box>
                <Title order={3}>Statistics (Hindi)</Title>
                <TiptapEditor
                  content={statisticsHi}
                  onChange={setStatisticsHi}
                  minHeight={250}
                  label="Statistics (Hindi)"
                  required={false}
                  placeholder="आंकड़े हिंदी में दर्ज करें..."
                />
              </Box>

              <Box>
                <Title order={3}>Impact (English)</Title>
                <TiptapEditor
                  content={impact}
                  onChange={setImpact}
                  minHeight={250}
                  label="Impact (English)"
                  required
                  placeholder="Enter impact content in English..."
                />
              </Box>

              <Box>
                <Title order={3}>Impact (Hindi)</Title>
                <TiptapEditor
                  content={impactHi}
                  onChange={setImpactHi}
                  minHeight={250}
                  label="Impact (Hindi)"
                  required={false}
                  placeholder="प्रभाव हिंदी में दर्ज करें..."
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
                checked={contextData?.isPublished || false}
                onChange={(e) => {
                  // Fix: Safely handle null data
                  if (contextData) {
                    setData({ ...contextData, isPublished: e.currentTarget.checked });
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
                  loading={isSubmitting}
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
            <Text size="sm">Data loaded: {contextData ? 'Yes' : 'No'}</Text>
            <Text size="sm">Main text (EN) length: {mainText?.length || 0} chars</Text>
            <Text size="sm">Main text (HI) length: {mainTextHi?.length || 0} chars</Text>
            <Text size="sm">Statistics (EN) length: {statistics?.length || 0} chars</Text>
            <Text size="sm">Statistics (HI) length: {statisticsHi?.length || 0} chars</Text>
            <Text size="sm">Impact (EN) length: {impact?.length || 0} chars</Text>
            <Text size="sm">Impact (HI) length: {impactHi?.length || 0} chars</Text>
            <Text size="sm">Main image: {contextData?.imageUrl ? 'Present' : 'Missing'}</Text>
            <Text size="sm">Stats image: {contextData?.statsImageUrl ? 'Present' : 'Missing'}</Text>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="preview">
          <TheNeedPreview />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}