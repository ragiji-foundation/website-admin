import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';

const getExtensions = (placeholder: string, linkClass: string, imageClass: string) => [
  StarterKit.configure({
    heading: false,
  }),
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: linkClass,
      rel: 'noopener noreferrer',
      target: '_blank',
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Underline,
  Image.configure({
    HTMLAttributes: {
      class: imageClass,
    },
  }),
  Placeholder.configure({
    placeholder,
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  Highlight,
  Typography,
];

export default getExtensions;
