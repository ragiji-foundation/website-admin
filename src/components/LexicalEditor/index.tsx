'use client';
import { useMemo, useCallback, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { Paper, Text } from '@mantine/core';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import styles from './styles.module.css';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { Klass } from 'lexical';
import { ListNode, ListItemNode } from '@lexical/list';
import { ParagraphNode, TextNode, LexicalNode } from 'lexical';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { LinkNode } from '@lexical/link';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { CodeNode } from '@lexical/code';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { $getRoot, createEditor, EditorState } from 'lexical';

const DEFAULT_EDITOR_STATE = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      }
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1
  }
};

const theme = {
  paragraph: 'editor-paragraph',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
  },
};

const getInitialContent = (content: string | object | null | undefined) => {
  if (!content) return DEFAULT_EDITOR_STATE;

  try {
    if (typeof content === 'string') {
      return JSON.parse(content);
    }
    return content;
  } catch (e) {
    console.error('Error parsing editor content:', e);
    return DEFAULT_EDITOR_STATE;
  }
};

interface LexicalEditorProps {
  label?: string;
  content: string | object | null;
  onChange: (content: { json: any; isEmpty: boolean; text: string }) => void;
  error?: string;
  required?: boolean;
}

export default function LexicalEditor({
  label,
  content,
  onChange,
  error,
  required
}: LexicalEditorProps) {
  const editor = useMemo(() => createEditor(), []);

  const initialConfig = useMemo(() => ({
    namespace: 'MyEditor',
    nodes: [
      HeadingNode as unknown as Klass<LexicalNode>,
      ListNode as unknown as Klass<LexicalNode>,
      ListItemNode as unknown as Klass<LexicalNode>,
      QuoteNode as unknown as Klass<LexicalNode>,
      ParagraphNode as Klass<LexicalNode>,
      TextNode as Klass<LexicalNode>,
      LinkNode as unknown as Klass<LexicalNode>,
      CodeNode as unknown as Klass<LexicalNode>,
      TableNode as unknown as Klass<LexicalNode>,
      TableCellNode as unknown as Klass<LexicalNode>,
      TableRowNode as unknown as Klass<LexicalNode>,
      HorizontalRuleNode as unknown as Klass<LexicalNode>,
    ],
    theme,
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    editor
  }), [editor]);

  const handleStateChange = useCallback((editorState: EditorState) => {
    try {
      let jsonContent;
      let textContent = '';
      let isEmpty = true;

      editorState.read(() => {
        const root = $getRoot();
        textContent = root.getTextContent();
        isEmpty = textContent.trim().length === 0;
        jsonContent = editorState.toJSON();
      });

      onChange({
        json: jsonContent,
        isEmpty,
        text: textContent
      });
    } catch (error) {
      console.error('Editor change error:', error);
      onChange({
        json: DEFAULT_EDITOR_STATE,
        isEmpty: true,
        text: ''
      });
    }
  }, [onChange]);

  useEffect(() => {
    if (!editor || !content) return;

    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    const state = editor.parseEditorState(parsedContent);
    editor.setEditorState(state);
  }, [editor, content]);

  return (
    <div>
      {label && (
        <Text component="label" size="sm" fw={500} mb={3} display="block">
          {label} {required && <span style={{ color: 'var(--mantine-color-red-filled)' }}>*</span>}
        </Text>
      )}
      <Paper withBorder p="xs" className={error ? styles.errorBorder : undefined}>
        <LexicalComposer initialConfig={initialConfig}>
          <div className={styles.editorContainer}>
            <ToolbarPlugin />
            <div className={styles.editorInner}>
              <RichTextPlugin
                contentEditable={<ContentEditable className={styles.contentEditable} />}
                placeholder={<div className={styles.placeholder}>Start typing...</div>}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              <ListPlugin />
              <LinkPlugin />
              <TabIndentationPlugin />
              <MarkdownShortcutPlugin />
              <ListMaxIndentLevelPlugin maxDepth={7} />
              <OnChangePlugin onChange={handleStateChange} />
            </div>
          </div>
        </LexicalComposer>
      </Paper>
      {error && (
        <Text size="sm" c="red" mt={4}>
          {error}
        </Text>
      )}
    </div>
  );
}
