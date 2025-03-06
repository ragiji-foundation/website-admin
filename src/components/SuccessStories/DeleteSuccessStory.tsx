"use client";

import { useState } from 'react';
import { Button, Modal, Text, Group } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

interface DeleteSuccessStoryProps {
  storyId: string;
  onDelete: (id: string) => Promise<void>;
}

export function DeleteSuccessStory({ storyId, onDelete }: DeleteSuccessStoryProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(storyId);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="default"
        color="red"
        onClick={() => setIsDeleteModalOpen(true)}
        leftSection={<IconTrash size="1rem" />}
      >
        Delete
      </Button>

      <Modal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Success Story"
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete this success story? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
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
