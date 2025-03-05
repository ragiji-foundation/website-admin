'use client';
import { useState } from 'react';
import { Container, Title, Card, Tabs, Switch, NumberInput, Group } from '@mantine/core';
// Fix: Use named import instead of default import
import { RichTextContent } from '@/components/RichTextContent';
import TipTapEditor from '@/components/TipTapEditor/TipTapEditor';

const SAMPLE_HTML = `
<h1>Sample Rich Text Content</h1>
<p>This is a paragraph with <strong>bold</strong>, <em>italic</em>, and <u>underlined</u> text.</p>
<h2>Lists</h2>
<ul>
  <li>Unordered list item 1</li>
  <li>Unordered list item 2</li>
</ul>
<ol>
  <li>Ordered list item 1</li>
  <li>Ordered list item 2</li>
</ol>
<h2>Table Example</h2>
<table>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
    </tr>
    <tr>
      <td>Cell 3</td>
      <td>Cell 4</td>
    </tr>
  </tbody>
</table>
<blockquote>This is a blockquote element for highlighted quotes.</blockquote>
<p>Here's a <a href="https://example.com" target="_blank">link to an example website</a>.</p>
<p><mark>This text is highlighted</mark> for emphasis.</p>
`;

export default function ExampleRichTextDisplayPage() {
  const [content, setContent] = useState(SAMPLE_HTML);
  const [loading, setLoading] = useState(false);
  const [truncate, setTruncate] = useState(false);
  const [maxLength, setMaxLength] = useState(100);

  const handleEditorChange = (htmlContent: string) => {
    setContent(htmlContent);
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Rich Text Content Display Example</Title>

      <Tabs defaultValue="editor">
        <Tabs.List mb="md">
          <Tabs.Tab value="editor">Editor</Tabs.Tab>
          <Tabs.Tab value="display">Display</Tabs.Tab>
          <Tabs.Tab value="options">Display Options</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="editor">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={2} mb="md">Edit Content</Title>
            <TipTapEditor
              content={content}
              onChange={handleEditorChange}
              label="Content"
              minHeight={300}
            />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="display">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={2} mb="md">Content Display</Title>
            <RichTextContent
              content={content}
              truncate={truncate}
              maxLength={maxLength}
              containerClassName="rich-text-container"
            />
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="options">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={2} mb="md">Display Options</Title>

            <Group align="center" mb="md">
              <Switch
                label="Simulate loading state"
                checked={loading}
                onChange={(e) => setLoading(e.currentTarget.checked)}
              />
            </Group>

            <Group align="center" mb="md">
              <Switch
                label="Truncate content"
                checked={truncate}
                onChange={(e) => setTruncate(e.currentTarget.checked)}
              />
            </Group>

            {truncate && (
              <NumberInput
                label="Max length"
                value={maxLength}
                onChange={(value) => setMaxLength(typeof value === 'number' ? value : 100)}
                min={10}
                max={1000}
                step={10}
              />
            )}
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
