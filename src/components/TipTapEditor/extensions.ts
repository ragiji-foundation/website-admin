import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Highlight from '@tiptap/extension-highlight';

const getExtensions = (
  placeholder: string = 'Start writing...',
  linkClass: string = '',
  imageClass: string = ''
) => {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4]
      }
    }),
    Underline,
    Link.configure({
      HTMLAttributes: {
        class: linkClass,
        rel: 'noopener noreferrer',
        target: '_blank'
      },
      openOnClick: false,
    }),
    Image.configure({
      HTMLAttributes: {
        class: imageClass,
      },
    }),
    Highlight,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder,
    }),
  ];
};

export default getExtensions;
