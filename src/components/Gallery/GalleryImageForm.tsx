import React, { useState } from 'react';
import { TextInput, Textarea, Button, Group, Stack, Select, Box } from '@mantine/core';

export interface GalleryImageFormValues {
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  imageUrl: string;
  category: string;
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
            autosize
            minRows={2}
          />
          <Textarea
            label="Description (Hindi)"
            value={values.descriptionHi}
            onChange={(e) => handleChange('descriptionHi', e.target.value)}
            autosize
            minRows={2}
          />
        </Group>
        <Group grow>
          <TextInput
            label="Image URL"
            value={values.imageUrl}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
            required
          />
        </Group>
        <Group grow>
          <TextInput
            label="Category (English)"
            value={values.category}
            onChange={(e) => handleChange('category', e.target.value)}
            required
          />
          <TextInput
            label="Category (Hindi)"
            value={values.categoryHi}
            onChange={(e) => handleChange('categoryHi', e.target.value)}
          />
        </Group>
        <Button type="submit" loading={loading} mt="md">
          Save Image
        </Button>
      </Stack>
    </Box>
  );
}
