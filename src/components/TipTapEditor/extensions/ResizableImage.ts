import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ResizableImageComponent } from '../components/ResizableImageComponent';

export interface ResizableImageOptions {
  src: string;
  width?: string;
  alignment?: 'left' | 'center' | 'right';
  alt?: string;
  title?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      /**
       * Add an image with resize and alignment capabilities
       */
      setResizableImage: (options: ResizableImageOptions) => ReturnType;
    };
  }
}

export const ResizableImage = Image.extend({
  name: 'resizableImage',

  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      allowBase64: true,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
          };
        },
      },
      alignment: {
        default: 'center',
        renderHTML: (attributes) => {
          return {
            style: `display: block; text-align: ${attributes.alignment}`,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setResizableImage: (options: ResizableImageOptions) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options
        });
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

export default ResizableImage;
