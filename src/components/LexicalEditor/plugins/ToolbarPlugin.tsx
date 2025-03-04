import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ActionIcon, Group, Modal, Stack, TextInput, Button } from '@mantine/core';
import {
  IconBold, IconItalic, IconUnderline, IconList, IconListNumbers,
  IconClearFormatting, IconLink, IconH1, IconH2, IconH3, IconH4,
  IconAlignLeft, IconAlignCenter, IconAlignRight, IconAlignJustified,
  IconSeparator,
} from '@tabler/icons-react';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  CLEAR_EDITOR_COMMAND,
  LexicalNode
} from 'lexical';
import {
  $getSelection,
  $isRangeSelection,
} from 'lexical';
import { $createHeadingNode as createHeadingNode } from '@lexical/rich-text'

import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';

import { useState, useCallback } from 'react';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showURLDialog, setShowURLDialog] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  const formatHeading = (tag: 'h1' | 'h2' | 'h3' | 'h4') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.extract();
        nodes.forEach((node) => {
          const headingNode = createHeadingNode(tag);
          headingNode.append(...node.getChildren());
          node.replace(headingNode as unknown as LexicalNode);
        });
      }
    });
  };

  const formatAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor.update(() => {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment);
    });
  };

  const formatBulletList = () => {
    editor.update(() => {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    });
  };

  const formatNumberedList = () => {
    editor.update(() => {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    });
  };

  const formatBold = () => {
    editor.update(() => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
    });
  };

  const formatItalic = () => {
    editor.update(() => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
    });
  };

  const formatUnderline = () => {
    editor.update(() => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
    });
  };

  const clearFormatting = () => {
    editor.update(() => {
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
    });
  };

  const toggleLink = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setShowURLDialog(true);
      }
    });
  }, [editor]);

  const handleURLSubmit = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (urlInputValue) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, urlInputValue);
        }
      }
    });
    setShowURLDialog(false);
    setUrlInputValue('');
  }, [editor, urlInputValue]);

  const insertHorizontalRule = () => {
    editor.update(() => {
      editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
    });
  };

  return (
    <>
      <Group gap="xs" mb="xs">
        <ActionIcon variant="light" onClick={() => formatHeading('h1')}>
          <IconH1 size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={() => formatHeading('h2')}>
          <IconH2 size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={() => formatHeading('h3')}>
          <IconH3 size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={() => formatHeading('h4')}>
          <IconH4 size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={() => formatAlignment('left')}>
          <IconAlignLeft size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={() => formatAlignment('center')}>
          <IconAlignCenter size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={() => formatAlignment('right')}>
          <IconAlignRight size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={() => formatAlignment('justify')}>
          <IconAlignJustified size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={formatBold}>
          <IconBold size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={formatItalic}>
          <IconItalic size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={formatUnderline}>
          <IconUnderline size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={formatBulletList}>
          <IconList size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={formatNumberedList}>
          <IconListNumbers size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={insertHorizontalRule}>
          <IconSeparator size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={toggleLink}>
          <IconLink size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={clearFormatting}>
          <IconClearFormatting size={16} />
        </ActionIcon>
      </Group>
      {showURLDialog && (
        <Modal
          opened={showURLDialog}
          onClose={() => setShowURLDialog(false)}
          title="Insert Link"
          size="sm"
        >
          <Stack>
            <TextInput
              label="URL"
              value={urlInputValue}
              onChange={(e) => setUrlInputValue(e.target.value)}
              placeholder="https://example.com"
            />
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setShowURLDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleURLSubmit}>
                Insert
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </>
  );
}