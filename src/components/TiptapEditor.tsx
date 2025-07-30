import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useCallback, useEffect, useState } from 'react';

import {
  ActionIcon,
  Group,
  Paper,
  Divider,
  Tooltip,
  TextInput,
  Button,
  Select,
  Popover,
  FileInput,
  Stack,
  Text,
  Modal,
} from '@mantine/core';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconLink,
  IconUnlink,
  IconPhoto,
  IconCode,
  IconBlockquote,
  IconClearFormatting,
  IconSuperscript,
  IconSubscript,
  IconUpload,
  IconResize,
} from '@tabler/icons-react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  label?: string;
  required?: boolean;
  minHeight?: number | string;
  error?: string;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder,
  onImageUpload,
  label,
  required = false,
  minHeight = '400px',
  error
}: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkMenuOpen, setLinkMenuOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageMenuOpen, setImageMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageOptions, setImageOptions] = useState({
    src: '',
    width: '100%',
    alignment: 'center',
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Subscript,
      Superscript,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none p-4',
        style: `min-height: ${typeof minHeight === 'number' ? `${minHeight}px` : minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Helper function to add image from URL with options
  const addImageFromUrl = () => {
    if (editor && imageUrl) {
      // Use the basic image command
      editor.chain().focus().setImage({
        src: imageUrl,
        alt: '',
      }).run();
      setImageUrl('');
      setImageMenuOpen(false);
    }
  };

  // Helper function to upload and insert image
  const handleImageUpload = useCallback(async () => {
    if (!selectedFile || !onImageUpload || !editor) return;

    setUploadLoading(true);
    try {
      const url = await onImageUpload(selectedFile);
      // Use the basic image command
      editor.chain().focus().setImage({
        src: url,
        alt: '',
      }).run();
      setSelectedFile(null);
      setImageMenuOpen(false);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploadLoading(false);
    }
  }, [selectedFile, onImageUpload, editor, imageOptions]);

  // Helper function to set link
  const setLink = () => {
    if (editor && linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setLinkMenuOpen(false);
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor">
      {/* Add label if provided */}
      {label && (
        <Text component="label" htmlFor="tiptap-editor" size="sm" fw={500} mb={4} display="block">
          {label} {required && <Text component="span" c="red">*</Text>}
        </Text>
      )}

      <Paper p="xs" withBorder mb="xs">
        <Group>
          <Tooltip label="Bold">
            <ActionIcon
              variant={editor.isActive('bold') ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <IconBold size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Italic">
            <ActionIcon
              variant={editor.isActive('italic') ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <IconItalic size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Underline">
            <ActionIcon
              variant={editor.isActive('underline') ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <IconUnderline size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Strike">
            <ActionIcon
              variant={editor.isActive('strike') ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <IconStrikethrough size={16} />
            </ActionIcon>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip label="Heading 1">
            <ActionIcon
              variant={editor.isActive('heading', { level: 1 }) ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <IconH1 size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Heading 2">
            <ActionIcon
              variant={editor.isActive('heading', { level: 2 }) ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <IconH2 size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Heading 3">
            <ActionIcon
              variant={editor.isActive('heading', { level: 3 }) ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <IconH3 size={16} />
            </ActionIcon>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip label="Bullet List">
            <ActionIcon
              variant={editor.isActive('bulletList') ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <IconList size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Ordered List">
            <ActionIcon
              variant={editor.isActive('orderedList') ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <IconListNumbers size={16} />
            </ActionIcon>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip label="Align Left">
            <ActionIcon
              variant={editor.isActive({ textAlign: 'left' }) ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <IconAlignLeft size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Align Center">
            <ActionIcon
              variant={editor.isActive({ textAlign: 'center' }) ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <IconAlignCenter size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Align Right">
            <ActionIcon
              variant={editor.isActive({ textAlign: 'right' }) ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <IconAlignRight size={16} />
            </ActionIcon>
          </Tooltip>

          <Divider orientation="vertical" />

          <Popover
            opened={imageMenuOpen}
            onChange={setImageMenuOpen}
            position="bottom"
            width={300}
          >
            <Popover.Target>
              <ActionIcon
                variant="subtle"
                onClick={() => setImageMenuOpen(true)}
              >
                <IconPhoto size={16} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap="xs">
                <Text size="sm" fw={500}>Add Image</Text>

                {/* Image options */}
                <Select
                  label="Alignment"
                  size="xs"
                  value={imageOptions.alignment}
                  onChange={(value) =>
                    setImageOptions({ ...imageOptions, alignment: value as 'left' | 'center' | 'right' || 'center' })}
                  data={[
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                  ]}
                />

                <TextInput
                  label="Width"
                  size="xs"
                  placeholder="e.g. 300px or 50%"
                  value={imageOptions.width}
                  onChange={(e) => setImageOptions({ ...imageOptions, width: e.target.value })}
                />

                <Divider my="xs" />

                {/* URL Input */}
                <TextInput
                  placeholder="https://example.com/image.jpg"
                  label="Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  rightSection={
                    <Button size="xs" onClick={addImageFromUrl}>Add</Button>
                  }
                />

                {/* File Upload - Only show if onImageUpload is provided */}
                {onImageUpload && (
                  <>
                    <Divider label="OR" labelPosition="center" my="xs" />
                    <FileInput
                      label="Upload Image"
                      placeholder="Choose file"
                      accept="image/*"
                      value={selectedFile}
                      onChange={setSelectedFile}
                      clearable
                    />
                    <Button
                      onClick={handleImageUpload}
                      loading={uploadLoading}
                      disabled={!selectedFile}
                      leftSection={<IconUpload size={14} />}
                      size="sm"
                    >
                      Upload & Insert
                    </Button>
                  </>
                )}
              </Stack>
            </Popover.Dropdown>
          </Popover>

          <Divider orientation="vertical" />

          <Tooltip label="Code">
            <ActionIcon
              variant={editor.isActive('code') ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <IconCode size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Blockquote">
            <ActionIcon
              variant={editor.isActive('blockquote') ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <IconBlockquote size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Superscript">
            <ActionIcon
              variant={editor.isActive('superscript') ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
            >
              <IconSuperscript size={16} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Subscript">
            <ActionIcon
              variant={editor.isActive('subscript') ? "filled" : "subtle"}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
            >
              <IconSubscript size={16} />
            </ActionIcon>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip label="Clear formatting">
            <ActionIcon
              variant="subtle"
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            >
              <IconClearFormatting size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Paper>

      <Paper
        withBorder
        className={error ? 'tiptap-error' : ''}
        style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
      >
        <EditorContent editor={editor} placeholder={placeholder} />
      </Paper>

      {/* Show error message if provided */}
      {error && (
        <Text size="xs" c="red" mt={4}>{error}</Text>
      )}

      {/* Floating menu for selected image */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={({ editor }) => editor.isActive('image')}
        >
          <Paper p="xs" withBorder>
            <Group gap="xs">
              <Button
                size="xs"
                leftSection={<IconResize size={14} />}
                onClick={() => {
                  const width = prompt('Enter image width (e.g., 300px or 50%):');
                  if (width && editor.view.state.selection) {
                    // For basic image, we'll use CSS styling
                    const { from } = editor.view.state.selection;
                    editor.view.dispatch(
                      editor.view.state.tr.setNodeMarkup(from, undefined, {
                        ...editor.getAttributes('image'),
                        style: `width: ${width}; max-width: 100%;`,
                      })
                    );
                  }
                }}
              >
                Resize
              </Button>
            </Group>
          </Paper>
        </BubbleMenu>
      )}

      {/* Regular bubble menu for text formatting */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={({ editor, state }) => {
            // Only show for text selections, not for images
            return !editor.isActive('image') && !state.selection.empty;
          }}
        >
          <Group gap={0} bg="white" style={{ border: '1px solid #ddd', borderRadius: 4 }}>
            <ActionIcon size="sm" onClick={() => editor.chain().focus().toggleBold().run()}>
              <IconBold size={14} />
            </ActionIcon>
            <ActionIcon size="sm" onClick={() => editor.chain().focus().toggleItalic().run()}>
              <IconItalic size={14} />
            </ActionIcon>
            <ActionIcon size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <IconUnderline size={14} />
            </ActionIcon>
          </Group>
        </BubbleMenu>
      )}

      <style jsx global>{`
        .tiptap-editor .ProseMirror {
          min-height: ${typeof minHeight === 'number' ? `${minHeight}px` : minHeight};
          outline: none;
        }
        
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        .tiptap-editor .tiptap-error {
          border-color: red;
        }
        
        .tiptap-editor .image-container img {
          border-radius: 4px;
          transition: all 0.2s ease;
          max-width: 100%;
          height: auto;
        }
        
        .tiptap-editor img.ProseMirror-selectednode {
          box-shadow: 0 0 0 3px #0096ff;
        }
        
        .tiptap-editor .image-controls {
          display: flex;
          gap: 4px;
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .tiptap-editor .image-container {
          position: relative;
        }
      `}</style>
    </div>
  );
}
