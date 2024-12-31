'use client';

import { EditorContent, type Editor as TiptapEditor } from '@tiptap/react';
import {
  Group,
  ActionIcon,
  Stack,
  Paper,
  Tooltip,
  Divider,
  FileButton,
  Menu,
} from '@mantine/core';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconList,
  IconListNumbers,
  IconQuote,
  IconSeparator,
  IconClearFormatting,
  IconPhoto,
  IconH1,
  IconH2,
  IconH3,
  IconLink,
  IconUnlink,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconSubscript,
  IconSuperscript,
  IconPhotoUp,
  IconExternalLink,
} from '@tabler/icons-react';
import { handleImageUpload } from './ImageUpload';

interface EditorProps {
  editor: TiptapEditor | null;
}

export function Editor({ editor }: EditorProps) {
  if (!editor) return null;

  const addImage = async (file: File) => {
    try {
      await handleImageUpload(file, editor);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const addImageUrl = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };
  return (
    <Stack gap="sm">
      <Paper shadow="sm" p="xs">
        <Group gap="xs" mb="xs">
          {/* Headings */}
          <Group gap={2}>
            <Tooltip label="Heading 1">
              <ActionIcon
                variant={editor.isActive('heading', { level: 1 }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <IconH1 size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Heading 2">
              <ActionIcon
                variant={editor.isActive('heading', { level: 2 }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <IconH2 size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Heading 3">
              <ActionIcon
                variant={editor.isActive('heading', { level: 3 }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <IconH3 size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Divider orientation="vertical" />

          {/* Text formatting */}
          <Group gap={2}>
            <Tooltip label="Bold">
              <ActionIcon
                variant={editor.isActive('bold') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <IconBold size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Italic">
              <ActionIcon
                variant={editor.isActive('italic') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <IconItalic size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Underline">
              <ActionIcon
                variant={editor.isActive('underline') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <IconUnderline size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Strike">
              <ActionIcon
                variant={editor.isActive('strike') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <IconStrikethrough size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Subscript">
              <ActionIcon
                variant={editor.isActive('subscript') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleSubscript().run()}
              >
                <IconSubscript size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Superscript">
              <ActionIcon
                variant={editor.isActive('superscript') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleSuperscript().run()}
              >
                <IconSuperscript size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Divider orientation="vertical" />

          {/* Alignment */}
          <Group gap={2}>
            <Tooltip label="Align Left">
              <ActionIcon
                variant={editor.isActive({ textAlign: 'left' }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
              >
                <IconAlignLeft size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Align Center">
              <ActionIcon
                variant={editor.isActive({ textAlign: 'center' }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
              >
                <IconAlignCenter size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Align Right">
              <ActionIcon
                variant={editor.isActive({ textAlign: 'right' }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
              >
                <IconAlignRight size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Justify">
              <ActionIcon
                variant={editor.isActive({ textAlign: 'justify' }) ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              >
                <IconAlignJustified size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Divider orientation="vertical" />

          {/* Lists */}
          <Group gap={2}>
            <Tooltip label="Bullet List">
              <ActionIcon
                variant={editor.isActive('bulletList') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <IconList size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Numbered List">
              <ActionIcon
                variant={editor.isActive('orderedList') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <IconListNumbers size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <Divider orientation="vertical" />

          {/* Links and Images */}
          <Group gap={2}>
            <Menu>
              <Menu.Target>
                <Tooltip label="Insert Image">
                  <ActionIcon variant="subtle">
                    <IconPhoto size={16} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <FileButton onChange={(file) => file && addImage(file)} accept="image/*">
                  {(props) => (
                    <Menu.Item leftSection={<IconPhotoUp size={14} />} {...props}>
                      Upload Image
                    </Menu.Item>
                  )}
                </FileButton>
                <Menu.Item
                  leftSection={<IconExternalLink size={14} />}
                  onClick={addImageUrl}
                >
                  Insert from URL
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Tooltip label={editor.isActive('link') ? 'Unlink' : 'Add Link'}>
              <ActionIcon
                variant={editor.isActive('link') ? 'filled' : 'subtle'}
                onClick={() => (editor.isActive('link') ? editor.chain().focus().unsetLink().run() : setLink())}
              >
                {editor.isActive('link') ? <IconUnlink size={16} /> : <IconLink size={16} />}
              </ActionIcon>
            </Tooltip>
          </Group>

          <Divider orientation="vertical" />

          {/* Misc */}
          <Group gap={2}>
            <Tooltip label="Blockquote">
              <ActionIcon
                variant={editor.isActive('blockquote') ? 'filled' : 'subtle'}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <IconQuote size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Horizontal Rule">
              <ActionIcon
                variant="subtle"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
              >
                <IconSeparator size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Clear Formatting">
              <ActionIcon
                variant="subtle"
                onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
              >
                <IconClearFormatting size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Paper>

      <EditorContent editor={editor} className="min-h-[200px] prose max-w-none" />
    </Stack>
  );
}