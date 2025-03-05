'use client';
import { useState, useEffect } from 'react';
import { Container, Title, Button, Group, Stack, Card, Tabs, Divider } from '@mantine/core';
import TipTapEditor from '@/components/TipTapEditor/TipTapEditor';
import TipTapPreview from '@/components/TipTapEditor/TipTapPreview';
import { useTipTapDb } from '@/components/TipTapEditor/hooks/useTipTapDb';
import { notifications } from '@mantine/notifications';

export default function TipTapExamplePage() {
  const [content, setContent] = useState('');
  const [html, setHtml] = useState('');
  const [contentId, setContentId] = useState<string | null>(null);
  const { saveContent, fetchContent, loading } = useTipTapDb();

  useEffect(() => {
    // Example: Load existing content if needed
    const loadContent = async () => {
      if (contentId) {
        try {
          const loadedContent = await fetchContent(contentId);
          setContent(loadedContent);
          setHtml(loadedContent);
        } catch (error) {
          console.error('Failed to load content:', error);
        }
      }
    };

    loadContent();
  }, [contentId, fetchContent]);

  const handleSave = async () => {
    try {
      // Make sure we have all required fields
      if (!html) {
        notifications.show({
          title: 'Error',
          message: 'Content is required',
          color: 'red'
        });
        return;
      }

      const id = await saveContent({
        content: html,
        modelName: 'ExampleContent', // This must be provided
        fieldName: 'body',          // This must be provided
        recordId: contentId || undefined
      });

      setContentId(id);

      notifications.show({
        title: 'Success',
        message: 'Content saved successfully',
        color: 'green'
      });
    } catch (error) {
      console.error('Failed to save content:', error);

      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save content',
        color: 'red'
      });
    }
  };

  const handleEditorChange = (htmlContent: string) => {
    setHtml(htmlContent);
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">TipTap Rich Text Editor Example</Title>

      <Tabs defaultValue="editor">
        <Tabs.List mb="md">
          <Tabs.Tab value="editor">Editor</Tabs.Tab>
          <Tabs.Tab value="preview">Preview</Tabs.Tab>
          <Tabs.Tab value="both">Split View</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="editor">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={2} mb="md">Editor</Title>
            <TipTapEditor
              content={content}
              onChange={(htmlContent) => handleEditorChange(htmlContent)}
              label="Content"
              required
              placeholder="Start typing to test the editor..."
              minHeight={300}
              onSave={handleSave}
            />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="preview">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={2} mb="md">Preview</Title>
            <TipTapPreview content={html} />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="both">
          <Group grow align="flex-start">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={2} mb="md">Editor</Title>
              <TipTapEditor
                content={content}
                onChange={(htmlContent) => handleEditorChange(htmlContent)}
                label="Content"
                required
                placeholder="Start typing to test the editor..."
                minHeight={300}
              />
              <Group justify="flex-end" mt="md">
                <Button onClick={handleSave} loading={loading}>Save Content</Button>
              </Group>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={2} mb="md">Preview</Title>
              <TipTapPreview content={html} />
            </Card>
          </Group>
        </Tabs.Panel>
      </Tabs>

      <Divider my="xl" />

      <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
        <Title order={2} mb="md">Saved Content ID</Title>
        <pre>{contentId || 'No content saved yet'}</pre>
      </Card>
    </Container>
  );
}