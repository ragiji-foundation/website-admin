import { Drawer, Stack, TextInput, Select, Box, Button, Image } from '@mantine/core';
import { FileButton } from '@mantine/core';
import { CATEGORIES } from '@/types/gallery';
import { useState } from 'react';
import { handleImageUpload } from '@/utils/imageUpload';
import { notifications } from '@mantine/notifications';

interface UploadDrawerProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
}

export function UploadDrawer({ opened, onClose, onSubmit }: UploadDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
  });

  const onImageUpload = async (file: File | null) => {
    try {
      const url = await handleImageUpload(file);
      if (url) {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        notifications.show({
          title: 'Success',
          message: 'Image uploaded successfully',
          color: 'green',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload image',
        color: 'red',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
    setFormData({ title: '', description: '', imageUrl: '', category: '' });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Add New Image"
      position="right"
      size="md"
      padding="xl"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextInput
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Select
            label="Category"
            required
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value || '' })}
            data={CATEGORIES}
          />
          <Box>
            <FileButton
              onChange={onImageUpload}
              accept="image/png,image/jpeg,image/gif,image/webp"
            >
              {(props) => (
                <Button {...props} variant="light" fullWidth>
                  Choose Image
                </Button>
              )}
            </FileButton>
            {formData.imageUrl && (
              <Image
                src={formData.imageUrl}
                alt="Preview"
                height={200}
                fit="contain"
                mt="md"
              />
            )}
          </Box>
          <Button
            type="submit"
            loading={loading}
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
          >
            Upload Image
          </Button>
        </Stack>
      </form>
    </Drawer>
  );
}
