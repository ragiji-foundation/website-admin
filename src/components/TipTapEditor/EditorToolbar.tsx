'use client';
import { Box, Button, Group, Tooltip, ActionIcon, Loader } from '@mantine/core';
import { Editor } from '@tiptap/react';
import {
  IconBold, IconItalic, IconUnderline, IconStrikethrough,
  IconCode, IconHighlight, IconH1, IconH2, IconH3, IconH4,
  IconList, IconListNumbers, IconLink, IconLinkOff,
  IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustified,
  IconPhoto, IconDeviceFloppy
} from '@tabler/icons-react';
import classes from './TipTapEditor.module.css';

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload?: (file: File) => Promise<string | null>;
  uploading?: boolean;
  onSave?: () => Promise<void>;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onImageUpload,
  uploading = false,
  onSave
}) => {
  if (!editor) return null;

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      if (!input.files?.length || !onImageUpload) return;
      await onImageUpload(input.files[0]);
    };

    input.click();
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  return (
    <Box className={classes.toolbarWrapper}>
      <div className={classes.toolbar}>
        {/* Text Style Controls */}
        <Group className={classes.controlsGroup} gap={5}>
          <Tooltip label="Bold">
            <ActionIcon
              variant={editor.isActive('bold') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
            >
              <IconBold size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Italic">
            <ActionIcon
              variant={editor.isActive('italic') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
            >
              <IconItalic size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Underline">
            <ActionIcon
              variant={editor.isActive('underline') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <IconUnderline size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Strikethrough">
            <ActionIcon
              variant={editor.isActive('strike') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <IconStrikethrough size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Code">
            <ActionIcon
              variant={editor.isActive('code') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <IconCode size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Highlight">
            <ActionIcon
              variant={editor.isActive('highlight') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <IconHighlight size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Heading Controls */}
        <Group className={classes.controlsGroup} gap={5}>
          <Tooltip label="Heading 1">
            <ActionIcon
              variant={editor.isActive('heading', { level: 1 }) ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <IconH1 size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Heading 2">
            <ActionIcon
              variant={editor.isActive('heading', { level: 2 }) ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <IconH2 size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Heading 3">
            <ActionIcon
              variant={editor.isActive('heading', { level: 3 }) ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <IconH3 size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Heading 4">
            <ActionIcon
              variant={editor.isActive('heading', { level: 4 }) ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            >
              <IconH4 size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* List Controls */}
        <Group className={classes.controlsGroup} gap={5}>
          <Tooltip label="Bullet List">
            <ActionIcon
              variant={editor.isActive('bulletList') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <IconList size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Numbered List">
            <ActionIcon
              variant={editor.isActive('orderedList') ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <IconListNumbers size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Alignment Controls (if text-align extension is used) */}
        <Group className={classes.controlsGroup} gap={5}>
          <Tooltip label="Align Left">
            <ActionIcon
              variant={editor.isActive({ textAlign: 'left' }) ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <IconAlignLeft size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Align Center">
            <ActionIcon
              variant={editor.isActive({ textAlign: 'center' }) ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <IconAlignCenter size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Align Right">
            <ActionIcon
              variant={editor.isActive({ textAlign: 'right' }) ? 'filled' : 'subtle'}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <IconAlignRight size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Link Controls */}
        <Group className={classes.controlsGroup} gap={5}>
          <Tooltip label="Add Link">
            <ActionIcon
              variant={editor.isActive('link') ? 'filled' : 'subtle'}
              onClick={() => {
                const url = window.prompt('URL');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
            >
              <IconLink size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Remove Link">
            <ActionIcon
              variant="subtle"
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive('link')}
            >
              <IconLinkOff size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Image Controls */}
        {onImageUpload && (
          <Group className={classes.controlsGroup} gap={5}>
            <Tooltip label="Insert Image">
              <ActionIcon
                variant="subtle"
                onClick={handleImageUpload}
                disabled={uploading}
              >
                {uploading ? <Loader size="xs" /> : <IconPhoto size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        )}

        {/* Save Control */}
        {onSave && (
          <Group className={classes.controlsGroup} gap={5}>
            <Tooltip label="Save">
              <ActionIcon onClick={handleSave}>
                <IconDeviceFloppy size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </div>
    </Box>
  );
};

export default EditorToolbar;
