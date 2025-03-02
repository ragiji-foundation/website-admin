import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ActionIcon, Group, Modal, Stack, TextInput, Button } from '@mantine/core';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconList,
  IconListNumbers,
  IconClearFormatting,
  IconLink,
  IconH1,
  IconH2,
  IconQuote,
  IconSeparator,
  IconCode,
} from '@tabler/icons-react';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $getSelection, $isRangeSelection } from 'lexical';
import { createPortal } from 'react-dom';
import { useState, useCallback } from 'react';

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [showURLDialog, setShowURLDialog] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  const formatBulletList = () => {
    editor.dispatchCommand('INSERT_UNORDERED_LIST', undefined);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand('INSERT_ORDERED_LIST', undefined);
  };

  const formatBold = () => {
    editor.dispatchCommand('FORMAT_TEXT_COMMAND', 'bold');
  };

  const formatItalic = () => {
    editor.dispatchCommand('FORMAT_TEXT_COMMAND', 'italic');
  };

  const formatUnderline = () => {
    editor.dispatchCommand('FORMAT_TEXT_COMMAND', 'underline');
  };

  const clearFormatting = () => {
    editor.dispatchCommand('CLEAR_FORMATTING_COMMAND', undefined);
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

  const formatHeading = (level: 1 | 2) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        editor.dispatchCommand('FORMAT_HEADING_COMMAND', level);
      }
    });
  };

  const formatQuote = () => {
    editor.dispatchCommand('FORMAT_QUOTE_COMMAND', undefined);
  };

  const insertHorizontalRule = () => {
    editor.dispatchCommand('INSERT_HORIZONTAL_RULE_COMMAND', undefined);
  };

  const formatCode = () => {
    editor.dispatchCommand('FORMAT_CODE_COMMAND', undefined);
  };

  return (
    <>
      <Group gap="xs" mb="xs">
        <ActionIcon variant="light" onClick={() => formatHeading(1)}>
          <IconH1 size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={() => formatHeading(2)}>
          <IconH2 size={16} />
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
        <ActionIcon variant="light" onClick={formatCode}>
          <IconCode size={16} />
        </ActionIcon>
        <ActionIcon variant="light" onClick={formatQuote}>
          <IconQuote size={16} />
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

      {showURLDialog && createPortal(
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
        </Modal>,
        document.body
      )}
    </>
  );
}
