'use client';
import { useMemo, useCallback } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { Klass } from 'lexical';
import { ListNode, ListItemNode } from '@lexical/list';
import { ParagraphNode, TextNode, LexicalNode } from 'lexical';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { Card } from '@mantine/core';
import EditorToolbar from './EditorToolbar';
import './styles.css';

interface LexicalEditorProps {
  initialValue?: any;
  onChange?: (value: any) => void;
}

const DEFAULT_EDITOR_STATE = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  }
};

export function LexicalEditor({ initialValue, onChange }: LexicalEditorProps) {
  const initialConfig = useMemo(() => ({
    namespace: 'RagiEditor',
    nodes: [
      HeadingNode as unknown as Klass<LexicalNode>,
      ListNode as unknown as Klass<LexicalNode>,
      ListItemNode as unknown as Klass<LexicalNode>,
      QuoteNode as unknown as Klass<LexicalNode>,
      ParagraphNode as Klass<LexicalNode>,
      TextNode as Klass<LexicalNode>
    ],
    editorState: initialValue
      ? typeof initialValue === 'string'
        ? initialValue
        : JSON.stringify(initialValue)
      : JSON.stringify(DEFAULT_EDITOR_STATE),
    theme: {
      paragraph: 'editor-paragraph',
      heading: {
        h1: 'editor-heading-h1',
        h2: 'editor-heading-h2',
        h3: 'editor-heading-h3',
      },
      list: {
        ul: 'editor-list-ul',
        ol: 'editor-list-ol',
        listitem: 'editor-listitem',
      },
      text: {
        bold: 'editor-text-bold',
        italic: 'editor-text-italic',
        underline: 'editor-text-underline',
      },
      quote: 'editor-quote',
    },
    onError: (error: Error) => {
      console.error('Lexical Editor Error:', error?.message || 'Unknown error');
    },
  }), [initialValue]);

  const handleChange = useCallback((editorState: any) => {
    try {
      if (!editorState || typeof editorState.read !== 'function') return;

      editorState.read(() => {
        try {
          const jsonContent = editorState.toJSON();
          if (onChange && jsonContent && Object.keys(jsonContent).length > 0) {
            onChange(jsonContent);
          }
        } catch (err) {
          console.error('JSON serialization error:', err);
        }
      });
    } catch (error) {
      console.error('Editor change error:', error);
    }
  }, [onChange]);

  return (
    <Card withBorder p="xs">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <EditorToolbar />
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" />}
              placeholder={<div className="editor-placeholder">Start typing...</div>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <OnChangePlugin onChange={handleChange} />
          </div>
        </div>
      </LexicalComposer>
    </Card>
  );
}
