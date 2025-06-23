'use client';

import { useState } from 'react';
import { TextInput, Textarea, Box, Text, Card, Tabs, Badge } from '@mantine/core';
import { IconLanguage, IconGlobe } from '@tabler/icons-react';

interface BilingualInputProps {
  label: string;
  required?: boolean;
  valueEn: string;
  valueHi?: string;
  onChangeEn: (value: string) => void;
  onChangeHi: (value: string) => void;
  placeholder?: string;
  placeholderHi?: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
  description?: string;
}

export function BilingualInput({
  label,
  required = false,
  valueEn,
  valueHi = '',
  onChangeEn,
  onChangeHi,
  placeholder,
  placeholderHi,
  multiline = false,
  rows = 3,
  error,
  description
}: BilingualInputProps) {
  const [activeTab, setActiveTab] = useState<string>('en');

  const InputComponent = multiline ? Textarea : TextInput;

  return (
    <Box>
      <Text size="sm" fw={500} mb={5}>
        {label} {required && <Text span c="red">*</Text>}
      </Text>
      
      {description && (
        <Text size="xs" c="dimmed" mb="sm">
          {description}
        </Text>
      )}

      <Card withBorder p="md">
        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value ?? 'en')}
          variant="pills"
        >
          <Tabs.List>
            <Tabs.Tab value="en" leftSection={<IconGlobe size={16} />}>
              English
              {valueEn && <Badge size="xs" color="green" ml="xs">✓</Badge>}
            </Tabs.Tab>
            <Tabs.Tab value="hi" leftSection={<IconLanguage size={16} />}>
              हिंदी
              {valueHi && <Badge size="xs" color="blue" ml="xs">✓</Badge>}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="en" pt="md">
            <InputComponent
              placeholder={placeholder || `Enter ${label.toLowerCase()} in English`}
              value={valueEn}
              onChange={(e) => onChangeEn(e.target.value)}
              error={error}
              required={required}
              rows={multiline ? rows : undefined}
            />
          </Tabs.Panel>

          <Tabs.Panel value="hi" pt="md">
            <InputComponent
              placeholder={placeholderHi || `${label.toLowerCase()} हिंदी में दर्ज करें`}
              value={valueHi}
              onChange={(e) => onChangeHi(e.target.value)}
              rows={multiline ? rows : undefined}
              dir="auto"
              style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
            />
            <Text size="xs" c="dimmed" mt="xs">
              Optional: Hindi translation for better user experience
            </Text>
          </Tabs.Panel>
        </Tabs>
      </Card>
    </Box>
  );
}

// Rich Text Editor for bilingual content
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface BilingualRichTextProps {
  label: string;
  required?: boolean;
  valueEn: string;
  valueHi?: string;
  onChangeEn: (value: string) => void;
  onChangeHi: (value: string) => void;
  error?: string;
  description?: string;
}

export function BilingualRichText({
  label,
  required = false,
  valueEn,
  valueHi = '',
  onChangeEn,
  onChangeHi,
  error,
  description
}: BilingualRichTextProps) {
  const [activeTab, setActiveTab] = useState<string>('en');

  const editorEn = useEditor({
    extensions: [StarterKit],
    content: valueEn,
    onUpdate: ({ editor }) => {
      onChangeEn(editor.getHTML());
    },
  });

  const editorHi = useEditor({
    extensions: [StarterKit],
    content: valueHi,
    onUpdate: ({ editor }) => {
      onChangeHi(editor.getHTML());
    },
  });

  return (
    <Box>
      <Text size="sm" fw={500} mb={5}>
        {label} {required && <Text span c="red">*</Text>}
      </Text>
      
      {description && (
        <Text size="xs" c="dimmed" mb="sm">
          {description}
        </Text>
      )}

      <Card withBorder p="md">
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value ?? 'en')} variant="pills">
          <Tabs.List>
            <Tabs.Tab value="en" leftSection={<IconGlobe size={16} />}>
              English
              {valueEn && <Badge size="xs" color="green" ml="xs">✓</Badge>}
            </Tabs.Tab>
            <Tabs.Tab value="hi" leftSection={<IconLanguage size={16} />}>
              हिंदी
              {valueHi && <Badge size="xs" color="blue" ml="xs">✓</Badge>}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="en" pt="md">
            <RichTextEditor editor={editorEn}>
              <RichTextEditor.Toolbar>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.Toolbar>
              <RichTextEditor.Content />
            </RichTextEditor>
          </Tabs.Panel>

          <Tabs.Panel value="hi" pt="md">
            <RichTextEditor editor={editorHi}>
              <RichTextEditor.Toolbar>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.Toolbar>
              <RichTextEditor.Content style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }} />
            </RichTextEditor>
            <Text size="xs" c="dimmed" mt="xs">
              Optional: Hindi translation for better user experience
            </Text>
          </Tabs.Panel>
        </Tabs>
      </Card>
      
      {error && (
        <Text size="xs" c="red" mt="xs">
          {error}
        </Text>
      )}
    </Box>
  );
}