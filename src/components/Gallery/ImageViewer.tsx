import { Modal, Stack, Image, Text, Group, Badge, Button, CopyButton } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { GalleryItem } from '@/types/gallery';

interface ImageViewerProps {
  opened: boolean;
  onClose: () => void;
  image: GalleryItem | null;
  language?: 'en' | 'hi';
}

export function ImageViewer({ opened, onClose, image, language = 'en' }: ImageViewerProps) {
  if (!image) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      padding="xl"
      title={language === 'hi' ? image.titleHi || image.title : image.title}
    >
      <Stack>
        <Image
          src={image.imageUrl}
          alt={language === 'hi' ? image.titleHi || image.title : image.title}
          fit="contain"
          height={400}
        />
        {(image.description || image.descriptionHi) && (
          <Text size="sm" c="dimmed">
            {language === 'hi' ? image.descriptionHi || image.description : image.description}
          </Text>
        )}
        <Group>
          <Badge size="lg">{image.category}</Badge>
          <CopyButton value={image.imageUrl || ''}>
            {({ copied, copy }) => (
              <Button
                variant="light"
                color={copied ? 'teal' : 'blue'}
                onClick={copy}
                leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              >
                {copied ? 'Copied!' : 'Copy URL'}
              </Button>
            )}
          </CopyButton>
        </Group>
      </Stack>
    </Modal>
  );
}
