import React from 'react';
import TiptapEditorCore from '../TiptapEditor';

// Define the props interface expected by consumers
interface TiptapEditorProps {
  content: string | any;  // Accept both string and rich text object
  onChange: (content: any) => void;
  minHeight?: number;
  placeholder?: string;
  label?: string;
  required?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  minHeight = 400,
  placeholder,
  label,
  required,
  onImageUpload,
}) => {
  return (
    <TiptapEditorCore
      content={content}
      onChange={onChange}
      minHeight={minHeight}
      placeholder={placeholder}
      label={label}
      required={required}
      onImageUpload={onImageUpload}
    />
  );
};

export default TiptapEditor;



// 'use client';
// import React, { useState, useCallback } from 'react';
// import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Underline from '@tiptap/extension-underline';
// import TextAlign from '@tiptap/extension-text-align';
// import Placeholder from '@tiptap/extension-placeholder';
// import Link from '@tiptap/extension-link';
// import Image from '@tiptap/extension-image';
// import {
//   ActionIcon,
//   Tooltip,
//   Group,
//   Button,
//   Box,
//   Menu,
//   TextInput,
//   Modal,
//   FileInput,
//   Center,
//   LoadingOverlay,
//   Stack,
//   Text
// } from '@mantine/core';
// import {
//   IconBold,
//   IconItalic,
//   IconUnderline,
//   IconStrikethrough,
//   IconH1,
//   IconH2,
//   IconH3,
//   IconList,
//   IconListNumbers,
//   IconAlignLeft,
//   IconAlignCenter,
//   IconAlignRight,
//   IconAlignJustified,
//   IconLink,
//   IconLinkOff,
//   IconPhoto,
//   IconCode,
//   IconBlockquote,
//   IconClearFormatting,
//   IconUpload
// } from '@tabler/icons-react';
// import { useDisclosure } from '@mantine/hooks';
// import classes from './TiptapEditor.module.css';

// interface TiptapEditorProps {
//   content?: string | null;
//   onChange?: (content: string) => void;
//   placeholder?: string;
//   editable?: boolean;
//   onImageUpload?: (file: File) => Promise<string>; // Function to upload an image and return URL
// }

// const TiptapEditor: React.FC<TiptapEditorProps> = ({
//   content = '',
//   onChange,
//   placeholder = 'Write something...',
//   editable = true,
//   onImageUpload
// }) => {
//   const [linkUrl, setLinkUrl] = useState<string>('');
//   const [linkModalOpened, { open: openLinkModal, close: closeLinkModal }] = useDisclosure(false);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imageModalOpened, { open: openImageModal, close: closeImageModal }] = useDisclosure(false);
//   const [isUploading, setIsUploading] = useState<boolean>(false);

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Underline,
//       TextAlign.configure({
//         types: ['heading', 'paragraph'],
//       }),
//       Placeholder.configure({
//         placeholder,
//       }),
//       Link.configure({
//         openOnClick: false,
//       }),
//       Image.configure({
//         HTMLAttributes: {
//           class: classes.editorImage,
//         },
//       }),
//     ],
//     content,
//     editable,
//     onUpdate: ({ editor }) => {
//       if (onChange) {
//         const htmlContent = editor.getHTML();
//         onChange(htmlContent);
//       }
//     },
//   });

//   const setLink = useCallback(() => {
//     if (!editor) return;

//     if (linkUrl === '') {
//       editor.chain().focus().extendMarkRange('link').unsetLink().run();
//       return;
//     }

//     // Check if the URL has a protocol, add https:// if not
//     let processedUrl = linkUrl;
//     if (!/^https?:\/\//i.test(processedUrl)) {
//       processedUrl = 'https://' + processedUrl;
//     }

//     editor
//       .chain()
//       .focus()
//       .extendMarkRange('link')
//       .setLink({ href: processedUrl, target: '_blank' })
//       .run();

//     setLinkUrl('');
//     closeLinkModal();
//   }, [editor, linkUrl, closeLinkModal]);

//   const unsetLink = () => {
//     if (!editor) return;
//     editor.chain().focus().unsetLink().run();
//   };

//   const handleLinkKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       setLink();
//     }
//   };

//   const handleImageUpload = async () => {
//     if (!imageFile || !onImageUpload) return;

//     try {
//       setIsUploading(true);
//       // Upload the image using the provided function
//       const imageUrl = await onImageUpload(imageFile);

//       // Insert the image into the editor
//       if (editor) {
//         editor.chain().focus().setImage({ src: imageUrl }).run();
//       }

//       // Clean up
//       setImageFile(null);
//       closeImageModal();
//     } catch (error) {
//       console.error('Error uploading image:', error);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // Default upload method if no custom upload function is provided
//   const handleDefaultImageUpload = async (file: File): Promise<string> => {
//     const formData = new FormData();
//     formData.append('file', file);

//     const response = await fetch('/api/blogs/upload-image', {
//       method: 'POST',
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error('Image upload failed');
//     }

//     const data = await response.json();
//     return data.url;
//   };

//   // Use provided upload function or default
//   const uploadImage = async () => {
//     if (!imageFile) return;

//     try {
//       setIsUploading(true);
//       const uploadFunction = onImageUpload || handleDefaultImageUpload;
//       const imageUrl = await uploadFunction(imageFile);

//       if (editor) {
//         editor.chain().focus().setImage({ src: imageUrl }).run();
//       }

//       setImageFile(null);
//       closeImageModal();
//     } catch (error) {
//       console.error('Error uploading image:', error);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   if (!editor) {
//     return null;
//   }

//   return (
//     <div className={classes.editor}>
//       <Group mb={5} gap="xs" className={classes.toolbar}>
//         <Tooltip label="Bold">
//           <ActionIcon
//             variant={editor.isActive('bold') ? 'filled' : 'subtle'}
//             onClick={() => editor.chain().focus().toggleBold().run()}
//           >
//             <IconBold stroke={1.5} size={16} />
//           </ActionIcon>
//         </Tooltip>
//         <Tooltip label="Italic">
//           <ActionIcon
//             variant={editor.isActive('italic') ? 'filled' : 'subtle'}
//             onClick={() => editor.chain().focus().toggleItalic().run()}
//           >
//             <IconItalic stroke={1.5} size={16} />
//           </ActionIcon>
//         </Tooltip>
//         <Tooltip label="Underline">
//           <ActionIcon
//             variant={editor.isActive('underline') ? 'filled' : 'subtle'}
//             onClick={() => editor.chain().focus().toggleUnderline().run()}
//           >
//             <IconUnderline stroke={1.5} size={16} />
//           </ActionIcon>
//         </Tooltip>
//         <Tooltip label="Strike">
//           <ActionIcon
//             variant={editor.isActive('strike') ? 'filled' : 'subtle'}
//             onClick={() => editor.chain().focus().toggleStrike().run()}
//           >
//             <IconStrikethrough stroke={1.5} size={16} />
//           </ActionIcon>
//         </Tooltip>

//         <div className={classes.divider}></div>

//         <Menu shadow="md" width={200} position="bottom-start">
//           <Menu.Target>
//             <Button
//               variant="subtle"
//               size="compact-sm"
//               rightSection={editor.isActive('heading') ? null : <IconH1 size={16} />}
//             >
//               {editor.isActive('heading', { level: 1 }) && 'H1'}
//               {editor.isActive('heading', { level: 2 }) && 'H2'}
//               {editor.isActive('heading', { level: 3 }) && 'H3'}
//               {!editor.isActive('heading') && 'Heading'}
//             </Button>
//           </Menu.Target>
//           <Menu.Dropdown>
//             <Menu.Item
//               leftSection={<IconH1 size={16} />}
//               onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
//               fw={editor.isActive('heading', { level: 1 }) ? 700 : 400}
//             >
//               Heading 1
//             </Menu.Item>
//             <Menu.Item
//               leftSection={<IconH2 size={16} />}
//               onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
//               fw={editor.isActive('heading', { level: 2 }) ? 700 : 400}
//             >
//               Heading 2
//             </Menu.Item>
//             <Menu.Item
//               leftSection={<IconH3 size={16} />}
//               onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
//               fw={editor.isActive('heading', { level: 3 }) ? 700 : 400}
//             >
//               Heading 3
//             </Menu.Item>
//           </Menu.Dropdown>
//         </Menu>

//         <div className={classes.divider}></div>

//         <Group gap="xs">
//           <Tooltip label="Align Left">
//             <ActionIcon
//               variant={editor.isActive({ textAlign: 'left' }) ? 'filled' : 'subtle'}
//               onClick={() => editor.chain().focus().setTextAlign('left').run()}
//             >
//               <IconAlignLeft stroke={1.5} size={16} />
//             </ActionIcon>
//           </Tooltip>
//           <Tooltip label="Align Center">
//             <ActionIcon
//               variant={editor.isActive({ textAlign: 'center' }) ? 'filled' : 'subtle'}
//               onClick={() => editor.chain().focus().setTextAlign('center').run()}
//             >
//               <IconAlignCenter stroke={1.5} size={16} />
//             </ActionIcon>
//           </Tooltip>
//           <Tooltip label="Align Right">
//             <ActionIcon
//               variant={editor.isActive({ textAlign: 'right' }) ? 'filled' : 'subtle'}
//               onClick={() => editor.chain().focus().setTextAlign('right').run()}
//             >
//               <IconAlignRight stroke={1.5} size={16} />
//             </ActionIcon>
//           </Tooltip>
//           <Tooltip label="Justify">
//             <ActionIcon
//               variant={editor.isActive({ textAlign: 'justify' }) ? 'filled' : 'subtle'}
//               onClick={() => editor.chain().focus().setTextAlign('justify').run()}
//             >
//               <IconAlignJustified stroke={1.5} size={16} />
//             </ActionIcon>
//           </Tooltip>
//         </Group>

//         <div className={classes.divider}></div>

//         <Group gap="xs">
//           <Tooltip label="Bullet List">
//             <ActionIcon
//               variant={editor.isActive('bulletList') ? 'filled' : 'subtle'}
//               onClick={() => editor.chain().focus().toggleBulletList().run()}
//             >
//               <IconList stroke={1.5} size={16} />
//             </ActionIcon>
//           </Tooltip>
//           <Tooltip label="Ordered List">
//             <ActionIcon
//               variant={editor.isActive('orderedList') ? 'filled' : 'subtle'}
//               onClick={() => editor.chain().focus().toggleOrderedList().run()}
//             >
//               <IconListNumbers stroke={1.5} size={16} />
//             </ActionIcon>
//           </Tooltip>
//         </Group>

//         <div className={classes.divider}></div>

//         <Group gap="xs">
//           <Tooltip label="Link">
//             <ActionIcon
//               variant={editor.isActive('link') ? 'filled' : 'subtle'}
//               onClick={openLinkModal}
//             >
//               <IconLink stroke={1.5} size={16} />
//             </ActionIcon>
//           </Tooltip>
//           {editor.isActive('link') && (
//             <Tooltip label="Unlink">
//               <ActionIcon
//                 variant="subtle"
//                 color="red"
//                 onClick={unsetLink}
//               >
//                 <IconLinkOff stroke={1.5} size={16} />
//               </ActionIcon>
//             </Tooltip>
//           )}
//           <Tooltip label="Image">
//             <ActionIcon
//               variant="subtle"
//               onClick={openImageModal}
//             >
//               <IconPhoto stroke={1.5} size={16} />
//             </ActionIcon>
//           </Tooltip>
//         </Group>

//         <div className={classes.divider}></div>

//         <Group gap="xs">
//           <Tooltip label="Code">
//             <ActionIcon
//               variant={editor.isActive('code') ? 'filled' : 'subtle'}
//               onClick={() => editor.chain().focus().toggleCode().run()}
//             >
//               <IconCode stroke={1.5} size={16} />
//             </ActionIcon>
//           </Tooltip>
//           <Tooltip label="Blockquote">
//             <ActionIcon
//               variant={editor.isActive('blockquote') ? 'filled' : 'subtle'}
//               onClick={() => editor.chain().focus().toggleBlockquote().run()}
//             >
//               <IconBlockquote stroke={1.5} size={16} />
//             </ActionIcon>
//           </Tooltip>
//           <Tooltip label="Clear formatting">
//             <ActionIcon
//               variant="subtle"
//               onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
//             >
//               <IconClearFormatting stroke={1.5} size={16} />
//             </ActionIcon>
//           </Tooltip>
//         </Group>
//       </Group>

//       {/* Editor Content */}
//       <div className={classes.content}>
//         {editor.isEditable ? (
//           <EditorContent editor={editor} className={classes.editorContent} />
//         ) : (
//           <div className={classes.readOnly}>
//             <EditorContent editor={editor} className={classes.editorContent} />
//           </div>
//         )}
//       </div>

//       {/* Link Modal */}
//       <Modal
//         opened={linkModalOpened}
//         onClose={closeLinkModal}
//         title="Insert Link"
//         size="sm"
//         centered
//       >
//         <Stack>
//           <TextInput
//             value={linkUrl}
//             onChange={(e) => setLinkUrl(e.currentTarget.value)}
//             placeholder="Enter URL (e.g., https://example.com)"
//             onKeyDown={handleLinkKeyDown}
//             autoFocus
//           />
//           <Group justify="right">
//             <Button variant="default" onClick={closeLinkModal}>Cancel</Button>
//             <Button onClick={setLink}>Insert Link</Button>
//           </Group>
//         </Stack>
//       </Modal>

//       {/* Image Upload Modal */}
//       <Modal
//         opened={imageModalOpened}
//         onClose={closeImageModal}
//         title="Insert Image"
//         size="sm"
//         centered
//       >
//         <Box pos="relative">
//           <LoadingOverlay visible={isUploading} />
//           <Stack>
//             <FileInput
//               label="Upload image"
//               placeholder="Select image file"
//               accept="image/png, image/jpeg, image/gif, image/webp"
//               onChange={setImageFile}
//               value={imageFile}
//             />
//             {imageFile && (
//               <Text size="sm">Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)</Text>
//             )}
//             <Group justify="right">
//               <Button variant="default" onClick={closeImageModal}>Cancel</Button>
//               <Button onClick={uploadImage} disabled={!imageFile}>Upload & Insert</Button>
//             </Group>
//           </Stack>
//         </Box>
//       </Modal>

//       {/* Bubble Menu for quick formatting */}
//       {editor && (
//         <BubbleMenu
//           editor={editor}
//           tippyOptions={{ duration: 150 }}
//           className={classes.bubbleMenu}
//         >
//           <Group gap="xs">
//             <ActionIcon
//               variant={editor.isActive('bold') ? 'filled' : 'subtle'}
//               onClick={() => editor.chain().focus().toggleBold().run()}
//               size="sm"
//             >
//               <IconBold size={14} />
//             </ActionIcon>
//             <ActionIcon
//               variant={editor.isActive('italic') ? 'filled' : 'subtle'}
//               onClick={() => editor.chain().focus().toggleItalic().run()}
//               size="sm"
//             >
//               <IconItalic size={14} />
//             </ActionIcon>
//             <ActionIcon
//               variant={editor.isActive('underline') ? 'filled' : 'subtle'}
//               onClick={() => editor.chain().focus().toggleUnderline().run()}
//               size="sm"
//             >
//               <IconUnderline size={14} />
//             </ActionIcon>
//             <ActionIcon
//               variant={editor.isActive('link') ? 'filled' : 'subtle'}
//               onClick={openLinkModal}
//               size="sm"
//             >
//               <IconLink size={14} />
//             </ActionIcon>
//           </Group>
//         </BubbleMenu>
//       )}
//     </div>
//   );
// };

// export default TiptapEditor;
