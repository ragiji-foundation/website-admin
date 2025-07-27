import { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Stack,
  Image,
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { GalleryItem } from '@/types/gallery';

interface EditImageModalProps {
  opened: boolean;
  onClose: () => void;
  image: GalleryItem | null;
  onUpdate: (updatedImage: GalleryItem) => void;
  language?: 'en' | 'hi';
}

const categories = [
  'Achievements',
  'Events',
  'Team',
  'Projects',
  'News',
  'Awards',
  'Conferences',
  'Workshops',
  'Other',
];

export function EditImageModal({ 
  opened, 
  onClose, 
  image, 
  onUpdate,
  language = 'en' 
}: EditImageModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: '',
      titleHi: '',
      description: '',
      descriptionHi: '',
      category: '',
    },
  });

  useEffect(() => {
    if (image && opened) {
      form.setValues({
        title: image.title || '',
        titleHi: image.titleHi || '',
        description: image.description || '',
        descriptionHi: image.descriptionHi || '',
        category: image.category || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    if (!image) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/gallery/${image.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          titleHi: values.titleHi || null,
          description: values.description || null,
          descriptionHi: values.descriptionHi || null,
          category: values.category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update image');
      }

      const updatedImage = await response.json();
      onUpdate(updatedImage);
      onClose();
      
      notifications.show({
        title: language === 'hi' ? 'सफलता' : 'Success',
        message: language === 'hi' 
          ? 'चित्र सफलतापूर्वक अपडेट हो गया।' 
          : 'Image updated successfully.',
        color: 'green',
      });
    } catch (error) {
      console.error('Error updating image:', error);
      notifications.show({
        title: language === 'hi' ? 'त्रुटि' : 'Error',
        message: language === 'hi' 
          ? 'चित्र अपडेट करने में त्रुटि।' 
          : 'Error updating image.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    en: {
      title: 'Edit Image',
      titleField: 'Title',
      titleHiField: 'Title (Hindi)',
      description: 'Description',
      descriptionHi: 'Description (Hindi)',
      category: 'Category',
      cancel: 'Cancel',
      save: 'Save Changes',
    },
    hi: {
      title: 'चित्र संपादित करें',
      titleField: 'शीर्षक',
      titleHiField: 'शीर्षक (हिंदी)',
      description: 'विवरण',
      descriptionHi: 'विवरण (हिंदी)',
      category: 'श्रेणी',
      cancel: 'रद्द करें',
      save: 'परिवर्तन सहेजें',
    },
  };

  const t = labels[language];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t.title}
      size="lg"
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <LoadingOverlay visible={loading} />
      
      {image && (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Image
              src={image.imageUrl}
              alt={image.title}
              height={200}
              fit="cover"
              radius="md"
            />

            <TextInput
              label={t.titleField}
              placeholder="Enter title..."
              required
              {...form.getInputProps('title')}
            />

            <TextInput
              label={t.titleHiField}
              placeholder="हिंदी में शीर्षक दर्ज करें..."
              {...form.getInputProps('titleHi')}
            />

            <Textarea
              label={t.description}
              placeholder="Enter description..."
              rows={3}
              {...form.getInputProps('description')}
            />

            <Textarea
              label={t.descriptionHi}
              placeholder="हिंदी में विवरण दर्ज करें..."
              rows={3}
              {...form.getInputProps('descriptionHi')}
            />

            <Select
              label={t.category}
              placeholder="Select category"
              data={categories}
              required
              {...form.getInputProps('category')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                {t.cancel}
              </Button>
              <Button type="submit" loading={loading}>
                {t.save}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
