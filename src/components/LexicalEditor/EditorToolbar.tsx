'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Group, ActionIcon, Tooltip, Divider } from '@mantine/core';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconH1,
  IconH2,
  IconH3,
  IconList,
  IconListNumbers,
  IconArrowBackUp,
  IconArrowForwardUp,
} from '@tabler/icons-react';
import { FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND } from 'lexical';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { ImageUploadPlugin } from './ImageUploadPlugin';

export default function EditorToolbar() {
  const [editor] = useLexicalComposerContext();

  return (
    <Group gap="xs" p="xs" className="editor-toolbar">
      <Group gap="xs">
        <Tooltip label="Bold">
          <ActionIcon
            variant="light"
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          >
            <IconBold size={16} />
          </ActionIcon>
        </Tooltip>
        {/* Add more toolbar buttons here */}
      </Group>

      <Divider orientation="vertical" />

      <ImageUploadPlugin />

      <Divider orientation="vertical" />

      <Group gap="xs">
        <Tooltip label="Undo">
          <ActionIcon
            variant="light"
            onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
          >
            <IconArrowBackUp size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Redo">
          <ActionIcon
            variant="light"
            onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
          >
            <IconArrowForwardUp size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
