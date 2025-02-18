import { Group, Title, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface GalleryHeaderProps {
  onAddNew: () => void;
}

export function GalleryHeader({ onAddNew }: GalleryHeaderProps) {
  return (
    <Group justify="space-between" mb="md">
      <Title
        order={2}
        styles={{
          root: {
            background: 'linear-gradient(45deg, indigo, cyan)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }
        }}
      >
        Content Library
      </Title>
      <Button
        leftSection={<IconPlus size={16} />}
        variant="gradient"
        gradient={{ from: 'indigo', to: 'cyan' }}
        onClick={onAddNew}
      >
        Add New
      </Button>
    </Group>
  );
}
