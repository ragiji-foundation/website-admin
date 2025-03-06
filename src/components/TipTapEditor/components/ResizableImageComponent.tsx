import { useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import {
  ActionIcon,
  Modal,
  Stack,
  TextInput,
  Group,
  Button,
  Text
} from '@mantine/core';
import {
  IconResize,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight
} from '@tabler/icons-react';

export function ResizableImageComponent({ node, updateAttributes, selected }: NodeViewProps) {
  const [width, setWidth] = useState(node.attrs.width || '100%');
  const [showResizeModal, setShowResizeModal] = useState(false);

  const applyResize = () => {
    updateAttributes({
      width: width,
    });
    setShowResizeModal(false);
  };

  return (
    <NodeViewWrapper className="resizable-image">
      <div
        className={`image-container ${selected ? 'ProseMirror-selectednode' : ''}`}
        style={{ textAlign: node.attrs.alignment || 'center' }}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          style={{ width: node.attrs.width || 'auto', maxWidth: '100%' }}
        />

        {selected && (
          <div className="image-controls">
            <ActionIcon size="sm" onClick={() => setShowResizeModal(true)}>
              <IconResize size={16} />
            </ActionIcon>
            <ActionIcon size="sm" onClick={() => updateAttributes({ alignment: 'left' })}>
              <IconAlignLeft size={16} />
            </ActionIcon>
            <ActionIcon size="sm" onClick={() => updateAttributes({ alignment: 'center' })}>
              <IconAlignCenter size={16} />
            </ActionIcon>
            <ActionIcon size="sm" onClick={() => updateAttributes({ alignment: 'right' })}>
              <IconAlignRight size={16} />
            </ActionIcon>
          </div>
        )}
      </div>

      <Modal
        opened={showResizeModal}
        onClose={() => setShowResizeModal(false)}
        title="Resize Image"
        size="sm"
      >
        <Stack>
          <TextInput
            label="Width"
            value={width.toString()}
            onChange={(e) => setWidth(e.target.value)}
            rightSection={<Text size="xs">px or %</Text>}
            placeholder="e.g. 300px or 50%"
          />
          <Group justify="right" mt="md">
            <Button variant="outline" onClick={() => setShowResizeModal(false)}>Cancel</Button>
            <Button onClick={applyResize}>Apply</Button>
          </Group>
        </Stack>
      </Modal>
    </NodeViewWrapper>
  );
}

export default ResizableImageComponent;
