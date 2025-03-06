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

import { Metadata } from 'next';
import { Container, Title, Text, Box } from '@mantine/core';
import { SuccessStoryForm } from '@/components/SuccessStories/SuccessStoryForm';

export const metadata: Metadata = {
  title: 'Add Success Story | Admin Dashboard',
  description: 'Create a new success story',
};

export default function NewSuccessStoryPage() {
  return (
    <Container size="xl" py="xl">
      <Box mb="lg">
        <Title order={1}>Add New Success Story</Title>
        <Text c="dimmed">
          Create a new client success story to showcase on your website
        </Text>
      </Box>

      <Box>
        <SuccessStoryForm />
      </Box>
    </Container>
  );
}
