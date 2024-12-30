import { Extension } from '@tiptap/core';
import Image from '@tiptap/extension-image';

export const CustomImage = Image.configure({
  HTMLAttributes: {
    class: 'blog-image',
  },
});

export const ImageUpload = Extension.create({
  name: 'imageUpload',

  addCommands() {
    return {
      setImage: (attrs: { src: string }) => ({ commands }) => {
        return commands.insertContent({
          type: 'image',
          attrs: attrs,
        });
      },
    };
  },
}); 