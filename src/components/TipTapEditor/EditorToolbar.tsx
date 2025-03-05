'use client';
import { Editor } from '@tiptap/react';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconQuote,
  IconLink,
  IconUnlink,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconAlignJustified,
  IconPhoto,
  IconClearFormatting,
  IconDeviceFloppy,
  IconHighlight,
  IconTable,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Group,
  FileButton,
  Tooltip,
  Divider,
  Button,
  Modal,
  TextInput,
  Menu,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import classes from './TipTapEditor.module.css';

interface EditorToolbarProps {
  editor: Editor | null;
  onImageUpload: (file: File) => Promise<string | null>;
  uploading: boolean;
  onSave?: () => Promise<void>;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onImageUpload,
  uploading,
  onSave
}) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [saving, setSaving] = useState(false);

  if (!editor) {
    return null;
  }

  const handleSetLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl, target: '_blank' })
        .run();
      setLinkUrl('');
      close();
    }
  };

  const handleUnsetLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const handleImageChange = async (file: File | null) => {
    if (file) {
      await onImageUpload(file);
    }
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        setSaving(true);
        await onSave();
      } catch (error) {
        console.error('Failed to save:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <>
      <div className={classes.toolbar}>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Bold">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? classes.active : ''}
                aria-label="Bold"
              >
                <IconBold size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
          <Tooltip label="Italic">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? classes.active : ''}
                aria-label="Italic"
              >
                <IconItalic size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
          <Tooltip label="Underline">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? classes.active : ''}
                aria-label="Underline"
              >
                <IconUnderline size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
          <Tooltip label="Highlight">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={editor.isActive('highlight') ? classes.active : ''}
                aria-label="Highlight"
              >
                <IconHighlight size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip label="Heading 1">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? classes.active : ''}
                aria-label="Heading 1"
              >
                <IconH1 size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
          <Tooltip label="Heading 2">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? classes.active : ''}
                aria-label="Heading 2"
              >
                <IconH2 size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
          <Tooltip label="Heading 3">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive('heading', { level: 3 }) ? classes.active : ''}
                aria-label="Heading 3"
              >
                <IconH3 size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip label="Bullet List">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? classes.active : ''}
                aria-label="Bullet List"
              >
                <IconList size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
          <Tooltip label="Numbered List">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? classes.active : ''}
                aria-label="Numbered List"
              >
                <IconListNumbers size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
          <Tooltip label="Blockquote">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? classes.active : ''}
                aria-label="Blockquote"
              >
                <IconQuote size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip label="Align Left">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? classes.active : ''}
                aria-label="Align Left"
              >
                <IconAlignLeft size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
          <Tooltip label="Align Center">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? classes.active : ''}
                aria-label="Align Center"
              >
                <IconAlignCenter size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
          <Tooltip label="Align Right">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? classes.active : ''}
                aria-label="Align Right"
              >
                <IconAlignRight size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
          <Tooltip label="Justify">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={editor.isActive({ textAlign: 'justify' }) ? classes.active : ''}
                aria-label="Justify"
              >
                <IconAlignJustified size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>

          <Divider orientation="vertical" />

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Tooltip label="Table">
                <Box>
                  <ActionIcon
                    variant="light"
                    className={editor.isActive('table') ? classes.active : ''}
                    aria-label="Table"
                  >
                    <IconTable size={16} />
                  </ActionIcon>
                </Box>
              </Tooltip>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                Insert Table
              </Menu.Item>
              <Menu.Item onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.isActive('table')}>
                Add Column Before
              </Menu.Item>
              <Menu.Item onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.isActive('table')}>
                Add Column After
              </Menu.Item>
              <Menu.Item onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.isActive('table')}>
                Delete Column
              </Menu.Item>
              <Menu.Item onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.isActive('table')}>
                Add Row Before
              </Menu.Item>
              <Menu.Item onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.isActive('table')}>
                Add Row After
              </Menu.Item>
              <Menu.Item onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.isActive('table')}>
                Delete Row
              </Menu.Item>
              <Menu.Item onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.isActive('table')}>
                Delete Table
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Divider orientation="vertical" />

          <Tooltip label="Add Link">
            <Box>
              <ActionIcon
                variant="light"
                onClick={open}
                className={editor.isActive('link') ? classes.active : ''}
                aria-label="Add Link"
              >
                <IconLink size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
          <Tooltip label="Remove Link">
            <Box>
              <ActionIcon
                variant="light"
                onClick={handleUnsetLink}
                disabled={!editor.isActive('link')}
                aria-label="Remove Link"
              >
                <IconUnlink size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>

          <Divider orientation="vertical" />

          <Tooltip label="Upload Image">
            <Box>
              <FileButton onChange={handleImageChange} accept="image/png,image/jpeg,image/gif,image/webp">
                {(props) => (
                  <ActionIcon
                    variant="light"
                    loading={uploading}
                    {...props}
                    aria-label="Upload Image"
                  >
                    <IconPhoto size={16} />
                  </ActionIcon>
                )}
              </FileButton>
            </Box>
          </Tooltip>

          <Tooltip label="Clear Formatting">
            <Box>
              <ActionIcon
                variant="light"
                onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                aria-label="Clear Formatting"
              >
                <IconClearFormatting size={16} />
              </ActionIcon>
            </Box>
          </Tooltip>
        </Group>

        {onSave && (
          <Group ml="auto">
            <Button
              size="xs"
              onClick={handleSave}
              loading={saving}
              leftSection={<IconDeviceFloppy size={16} />}
            >
              Save
            </Button>
          </Group>
        )}
      </div>

      <Modal opened={opened} onClose={close} title="Add Link" size="sm">
        <TextInput
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.currentTarget.value)}
          placeholder="https://example.com"
          label="URL"
          required
        />
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={close}>Cancel</Button>
          <Button onClick={handleSetLink}>Add Link</Button>
        </Group>
      </Modal>
    </>
  );
};

export default EditorToolbar;
