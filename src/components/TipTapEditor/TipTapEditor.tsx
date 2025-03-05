'use client';
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Paper, Text } from '@mantine/core';
import EditorToolbar from './EditorToolbar';
import { useImageUpload } from './useImageUpload';
import getExtensions from './extensions';
import classes from './TipTapEditor.module.css';

// Define a proper type for the JSON output instead of using 'any'
interface JSONOutput {
  type: string;
  content?: JSONOutput[];
  text?: string;
  [key: string]: unknown;
}

export interface TipTapEditorProps {
  content?: string;
  onChange?: (html: string, json?: JSONOutput) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  minHeight?: number;
  // Add underscore prefix to indicate it's an unused prop
  _id?: string;
  onSave?: () => Promise<void>;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  label,
  error,
  required = false,
  readOnly = false,
  minHeight = 200,
  // Remove the unused id parameter
  onSave
}) => {
  const [html, setHtml] = useState(content);
  const { uploadImage, uploading } = useImageUpload();
  const [mounted, setMounted] = useState(false);

  // Use the extensions module
  const editor = useEditor({
    extensions: getExtensions(placeholder, classes.link, classes.image),
    content: html,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const newHtml = editor.getHTML();
      setHtml(newHtml);
      // Use optional chaining and proper function call
      onChange?.(newHtml, editor.getJSON() as JSONOutput);
    },
    editorProps: {
      attributes: {
        class: classes.editor,
      },
    },
    immediatelyRender: false,
  });

  // Handle mounting effects for SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (content !== html && editor && !editor.isFocused) {
      editor.commands.setContent(content);
    }
  }, [content, editor, html]);

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImage(file);
      if (imageUrl && editor) {
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
      return imageUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      return null;
    }
  };

  // Show nothing until client-side rendering is complete
  if (!mounted) {
    return null;
  }

  return (
    <div>
      {label && (
        <Text component="label" size="sm" fw={500} mb={3} display="block">
          {label} {required && <span style={{ color: 'var(--mantine-color-red-filled)' }}>*</span>}
        </Text>
      )}
      <Paper
        withBorder
        className={`${classes.editorWrapper} ${error ? classes.errorBorder : ''}`}
        style={{ minHeight }}
      >
        <EditorToolbar
          editor={editor}
          onImageUpload={handleImageUpload}
          uploading={uploading}
          onSave={onSave}
        />
        <EditorContent editor={editor} className={classes.editorContent} />
      </Paper>
      {error && (
        <Text size="sm" c="red" mt={4}>
          {error}
        </Text>
      )}
    </div>
  );
};

export default TipTapEditor;
