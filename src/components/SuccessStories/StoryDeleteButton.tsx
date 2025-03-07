'use client';

import { useState } from 'react';
import { Button, Modal, Text, Group } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { deleteSuccessStory } from '@/actions/story-actions';
import { useRouter } from 'next/navigation';

interface StoryDeleteButtonProps {
  storyId: string;
}

export function StoryDeleteButton({ storyId }: StoryDeleteButtonProps) {
  const [opened, setOpened] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteSuccessStory(storyId);

      if (result.success) {
        setOpened(false);
        // Refresh the current route
        router.refresh();
      } else {
        console.error('Failed to delete the story');
      }
    } catch (error) {
      console.error('Error during deletion:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        color="red"
        variant="outline"
        leftSection={<IconTrash size="1rem" />}
        onClick={() => setOpened(true)}
      >
        Delete
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Confirm Deletion"
      >
        <Text mb="lg">Are you sure you want to delete this success story? This action cannot be undone.</Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setOpened(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleDelete}
            loading={isDeleting}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}
