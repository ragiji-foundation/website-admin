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
  Modal,
  TextInput,
  Button,
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
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

interface EditorProps {
  editor: TiptapEditor | null;
}

interface LinkModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  initialUrl?: string;
}

type Level = 1 | 2 | 3;

const LinkModal = ({ opened, onClose, onSubmit, initialUrl = '' }: LinkModalProps) => {
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
    onClose();
    setUrl('');
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Insert Link" size="sm">
      <form onSubmit={handleSubmit}>
        <TextInput
          label="URL"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          data-autofocus
        />
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Modal>
  );
};

export function Editor({ editor }: EditorProps) {
  const [linkModalOpened, setLinkModalOpened] = useState(false);
  const [imageUrlModalOpened, setImageUrlModalOpened] = useState(false);

  if (!editor) return null;

  const addImage = async (file: File | null) => {
    if (!file) return;

    const notificationId = notifications.show({
      id: 'upload',
      title: 'Uploading',
      message: 'Uploading image...',
      loading: true,
      autoClose: false,
      withCloseButton: false,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      editor.chain().focus().setImage({ src: data.url }).run();

      notifications.update({
        id: notificationId,
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green',
        loading: false,
        autoClose: 2000,
      });
    } catch (error) {
      notifications.update({
        id: notificationId,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to upload image',
        color: 'red',
        loading: false,
        autoClose: 2000,
      });
    }
  };

  const handleSetLink = (url: string) => {
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const handleSetImageUrl = (url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const renderToolbarButton = (
    label: string,
    icon: React.ReactNode,
    action: () => void,
    isActive?: boolean
  ) => (
    <Tooltip label={label}>
      <ActionIcon
        variant={isActive ? 'filled' : 'subtle'}
        onClick={action}
      >
        {icon}
      </ActionIcon>
    </Tooltip>
  );

  return (
    <Stack gap="sm">
      <Paper shadow="sm" p="xs">
        <Group gap="xs" mb="xs">
          {/* Headings */}
          <Group gap={2}>
            {([1, 2, 3] as Level[]).map((level) => (
              <Tooltip key={level} label={`Heading ${level}`}>
                <ActionIcon
                  variant={editor.isActive('heading', { level }) ? 'filled' : 'subtle'}
                  onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                >
                  {level === 1 ? <IconH1 size={16} /> : level === 2 ? <IconH2 size={16} /> : <IconH3 size={16} />}
                </ActionIcon>
              </Tooltip>
            ))}
          </Group>

          <Divider orientation="vertical" />

          {/* Text formatting */}
          <Group gap={2}>
            {renderToolbarButton('Bold', <IconBold size={16} />,
              () => editor.chain().focus().toggleBold().run(),
              editor.isActive('bold')
            )}
            {renderToolbarButton('Italic', <IconItalic size={16} />,
              () => editor.chain().focus().toggleItalic().run(),
              editor.isActive('italic')
            )}
            {renderToolbarButton('Underline', <IconUnderline size={16} />,
              () => editor.chain().focus().toggleUnderline().run(),
              editor.isActive('underline')
            )}
            {renderToolbarButton('Strike', <IconStrikethrough size={16} />,
              () => editor.chain().focus().toggleStrike().run(),
              editor.isActive('strike')
            )}
            {renderToolbarButton('Subscript', <IconSubscript size={16} />,
              () => editor.chain().focus().toggleSubscript().run(),
              editor.isActive('subscript')
            )}
            {renderToolbarButton('Superscript', <IconSuperscript size={16} />,
              () => editor.chain().focus().toggleSuperscript().run(),
              editor.isActive('superscript')
            )}
          </Group>

          <Divider orientation="vertical" />

          {/* Alignment */}
          <Group gap={2}>
            {['left', 'center', 'right', 'justify'].map((align) => (
              <Tooltip key={align} label={`Align ${align}`}>
                <ActionIcon
                  variant={editor.isActive({ textAlign: align }) ? 'filled' : 'subtle'}
                  onClick={() => editor.chain().focus().setTextAlign(align as any).run()}
                >
                  {align === 'left' ? <IconAlignLeft size={16} /> :
                    align === 'center' ? <IconAlignCenter size={16} /> :
                      align === 'right' ? <IconAlignRight size={16} /> :
                        <IconAlignJustified size={16} />}
                </ActionIcon>
              </Tooltip>
            ))}
          </Group>

          <Divider orientation="vertical" />

          {/* Lists */}
          <Group gap={2}>
            {renderToolbarButton('Bullet List', <IconList size={16} />,
              () => editor.chain().focus().toggleBulletList().run(),
              editor.isActive('bulletList')
            )}
            {renderToolbarButton('Numbered List', <IconListNumbers size={16} />,
              () => editor.chain().focus().toggleOrderedList().run(),
              editor.isActive('orderedList')
            )}
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
                <FileButton onChange={addImage} accept="image/png,image/jpeg,image/gif,image/webp">
                  {(props) => (
                    <Menu.Item leftSection={<IconPhotoUp size={14} />} {...props}>
                      Upload Image
                    </Menu.Item>
                  )}
                </FileButton>
                <Menu.Item
                  leftSection={<IconExternalLink size={14} />}
                  onClick={() => setImageUrlModalOpened(true)}
                >
                  Insert from URL
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {renderToolbarButton(
              editor.isActive('link') ? 'Unlink' : 'Add Link',
              editor.isActive('link') ? <IconUnlink size={16} /> : <IconLink size={16} />,
              () => editor.isActive('link') ?
                editor.chain().focus().unsetLink().run() :
                setLinkModalOpened(true),
              editor.isActive('link')
            )}
          </Group>

          <Divider orientation="vertical" />

          {/* Misc */}
          <Group gap={2}>
            {renderToolbarButton('Blockquote', <IconQuote size={16} />,
              () => editor.chain().focus().toggleBlockquote().run(),
              editor.isActive('blockquote')
            )}
            {renderToolbarButton('Horizontal Rule', <IconSeparator size={16} />,
              () => editor.chain().focus().setHorizontalRule().run()
            )}
            {renderToolbarButton('Clear Formatting', <IconClearFormatting size={16} />,
              () => editor.chain().focus().clearNodes().unsetAllMarks().run()
            )}
          </Group>
        </Group>
      </Paper>

      <EditorContent editor={editor} className="min-h-[200px] prose max-w-none" />

      <LinkModal
        opened={linkModalOpened}
        onClose={() => setLinkModalOpened(false)}
        onSubmit={handleSetLink}
        initialUrl={editor.getAttributes('link').href}
      />

      <LinkModal
        opened={imageUrlModalOpened}
        onClose={() => setImageUrlModalOpened(false)}
        onSubmit={handleSetImageUrl}
        initialUrl=""
      />
    </Stack>
  );
}