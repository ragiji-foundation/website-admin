import { Editor } from '@tiptap/react';

export async function handleImageUpload(file: File, editor: Editor) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();

    // Insert image into editor
    editor.chain().focus().setImage({ src: data.url }).run();

    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
} 