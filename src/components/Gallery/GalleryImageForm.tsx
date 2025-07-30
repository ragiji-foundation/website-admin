import { useState } from 'react';
import { Stack, TextInput, Textarea, Button, Group, Box } from '@mantine/core';

interface GalleryImageFormValues {
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  imageUrl?: string;
  category?: string;
  categoryHi?: string;
}

interface GalleryImageFormProps {
  initialValues?: Partial<GalleryImageFormValues>;
  onSubmit: (values: GalleryImageFormValues) => void;
  loading?: boolean;
}

export function GalleryImageForm({ initialValues = {}, onSubmit, loading }: GalleryImageFormProps) {
  const [values, setValues] = useState<GalleryImageFormValues>({
    title: initialValues.title || '',
    titleHi: initialValues.titleHi || '',
    description: initialValues.description || '',
    descriptionHi: initialValues.descriptionHi || '',
    imageUrl: initialValues.imageUrl || '',
    category: initialValues.category || '',
    categoryHi: initialValues.categoryHi || '',
  });

  const handleChange = (field: keyof GalleryImageFormValues, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack>
        <Group grow>
          <TextInput
            label="Title (English)"
            value={values.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
          <TextInput
            label="Title (Hindi)"
            value={values.titleHi}
            onChange={(e) => handleChange('titleHi', e.target.value)}
          />
        </Group>

        <Group grow>
          <Textarea
            label="Description (English)"
            value={values.description}
            onChange={(e) => handleChange('description', e.target.value)}
            minRows={3}
          />
          <Textarea
            label="Description (Hindi)"
            value={values.descriptionHi}
            onChange={(e) => handleChange('descriptionHi', e.target.value)}
            minRows={3}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Category (English)"
            value={values.category}
            onChange={(e) => handleChange('category', e.target.value)}
          />
          <TextInput
            label="Category (Hindi)"
            value={values.categoryHi}
            onChange={(e) => handleChange('categoryHi', e.target.value)}
          />
        </Group>

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Box>
  );
}

export default GalleryImageForm;