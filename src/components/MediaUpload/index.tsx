import { useState } from 'react';
import { FileButton, Button, Group, Text, Stack, Image, Loader, Paper } from '@mantine/core';
import { handleImageUpload, handleVideoUpload } from '@/utils/imageUpload';
import { IconPhoto, IconVideo, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface MediaUploadProps {
  onChange: (url: string) => void;
  value?: string;
  accept?: string;
  mediaType?: 'image' | 'video';
  folder?: string;
  label?: string;
  buttonLabel?: string;
  withPreview?: boolean;
  buttonProps?: any;
}

export function MediaUpload({
  onChange,
  value = '',
  accept = 'image/png,image/jpeg,image/gif,image/webp',
  mediaType = 'image',
  folder,
  label = 'Upload Media',
  buttonLabel,
  withPreview = true,
  buttonProps = {},
}: MediaUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File | null) => {
    if (!file) return;

    setLoading(true);
    try {
      let url;
      if (mediaType === 'video') {
        url = await handleVideoUpload(file, folder || 'videos');
      } else {
        url = await handleImageUpload(file, folder || 'images');
      }

      onChange(url);

      // Add success notification
      notifications.show({
        title: 'Success',
        message: 'File uploaded successfully',
        color: 'green',
      });
    } catch (error) {
      // Fix: Better error handling for display
      console.error('Upload failed:', error instanceof Error ? error.message : String(error));

      // Add explicit error notification here instead of relying on utility
      notifications.show({
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Could not upload file',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearMedia = () => {
    onChange('');
  };

  return (
    <Stack gap="sm">
      {label && <Text size="sm" fw={500}>{label}</Text>}

      <Group align="center">
        <FileButton
          onChange={handleUpload}
          accept={accept}
          disabled={loading}
        >
          {(props) => (
            <Button
              leftSection={mediaType === 'video' ? <IconVideo size={16} /> : <IconPhoto size={16} />}
              variant="light"
              loading={loading}
              {...props}
              {...buttonProps}
            >
              {buttonLabel || (mediaType === 'video' ? 'Upload Video' : 'Upload Image')}
            </Button>
          )}
        </FileButton>

        {value && (
          <Button
            variant="subtle"
            color="red"
            onClick={clearMedia}
            leftSection={<IconX size={16} />}
            size="xs"
          >
            Remove
          </Button>
        )}
      </Group>

      {withPreview && value && (
        <Paper withBorder p="xs" mt="xs">
          {loading ? (
            <Loader size="sm" />
          ) : (
            mediaType === 'image' ? (
              <Image
                src={value}
                alt="Uploaded media"
                fit="contain"
                height={150}
              />
            ) : (
              <video
                src={value}
                controls
                style={{ maxHeight: '150px', maxWidth: '100%' }}
              />
            )
          )}
        </Paper>
      )}
    </Stack>
  );
}
