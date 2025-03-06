import Image from '@tiptap/extension-image';
import { CommandProps } from '@tiptap/core';

export interface CustomImageOptions {
  src: string; //  Adjust these types based on the actual attributes you expect
  alt?: string;
  title?: string;
  width?: string;
  alignment?: 'left' | 'center' | 'right'; // Or use a more specific type
  [key: string]: any; // Allow other attributes (optional, but useful for flexibility)
}

export const CustomImage = Image.extend({
  name: 'customImage',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
      },
      alignment: {
        default: 'center',
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setCustomImage: (options: CustomImageOptions) => ({ commands }: CommandProps) => {
        return commands.insertContent({
          type: this.name,
          attrs: options
        });
      },
    };
  },
});