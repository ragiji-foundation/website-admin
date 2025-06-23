// Summary of the Solution
// I've created a comprehensive system for managing Success Stories with the following components:

// Main Listing Page (/success-stories/page.tsx):

// Displays all success stories in a grid layout
// Shows featured status with star icons
// Allows adding, editing, and deleting stories
// Includes confirmation modal for deletions
// Create Page (/success-stories/new/page.tsx):

// Simple wrapper for the form component
// Provides a clean UI for adding new stories
// Edit Page (/success-stories/[slug]/edit/page.tsx):

// Loads existing story data
// Handles error states and loading states
// Passes data to the form component
// Form Component (/components/SuccessStories/SuccessStoryForm.tsx):

// Reusable for both create and edit operations
// Uses TiptapEditor for rich text content
// Handles image uploads via Cloudinary
// Supports automatic slug generation
// Provides form validation

'use client';
import { Metadata } from 'next';
import { Container, Title, Text, Box } from '@mantine/core';
import { SuccessStoryForm } from '@/components/SuccessStories/SuccessStoryFormUpdated';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

interface SuccessStoryFormData {
  slug: string;
  title: string;
  titleHi?: string;
  content: Record<string, any>;
  contentHi?: Record<string, any>;
  personName: string;
  personNameHi?: string;
  location: string;
  locationHi?: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
}

export default function NewSuccessStoryPage() {
  const router = useRouter();

  const handleSubmit = async (data: SuccessStoryFormData) => {
    try {
      const response = await fetch('/api/success-stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create success story');
      }

      notifications.show({
        title: 'Success',
        message: 'Success story created successfully',
        color: 'green',
      });

      router.push('/success-stories');
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    }
  };

  const handleCancel = () => {
    router.push('/success-stories');
  };

  return (
    <Container size="xl" py="xl">
      <Box mb="lg">
        <Title order={1}>Add New Success Story</Title>
        <Text c="dimmed">
          Create a new client success story to showcase on your website
        </Text>
      </Box>

      <Box>
        <SuccessStoryForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Box>
    </Container>
  );
}
