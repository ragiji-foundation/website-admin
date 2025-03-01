'use client';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ActionIcon, FileButton, Tooltip, LoadingOverlay } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { $createParagraphNode, $createTextNode, $getSelection } from 'lexical';
import { useState } from 'react';

export function ImageUploadPlugin() {
  const [editor] = useLexicalComposerContext();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();

      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          const paragraphNode = $createParagraphNode();
          const textNode = $createTextNode(`![${file.name}](${data.url})`);
          paragraphNode.append(textNode);
          selection.insertNodes([paragraphNode]);
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={uploading} />
      <FileButton onChange={handleUpload} accept="image/png,image/jpeg,image/gif">
        {(props) => (
          <Tooltip label="Upload Image">
            <ActionIcon variant="light" {...props}>
              <IconPhoto size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </FileButton>
    </>
  );
}
