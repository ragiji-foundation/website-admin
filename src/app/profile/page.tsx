'use client';

import { useState } from 'react';
import {
  Paper,
  Avatar,
  Text,
  Group,
  Button,
  Stack,
  TextInput,
  Textarea,
  Container,
  Title,
  FileButton,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AdminPageLayout } from '@/components/Layout/AdminPageLayout';
import { handleImageUpload } from '@/utils/imageUpload';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  image: string;
  role: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Ragiji Foundation',
    email: 'admin@ragijifoundation.com',
    bio: 'Official administrator account for Ragiji Foundation',
    image: '/ragiji-logo.png', // Default image
    role: 'Administrator'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = async (file: File | null) => {
    if (!file) return;

    try {
      const url = await handleImageUpload(file);
      if (url) {
        setProfile(prev => ({ ...prev, image: url }));
        notifications.show({
          title: 'Success',
          message: 'Profile image updated successfully',
          color: 'green'
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile image',
        color: 'red'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically update the profile in your backend
      // await fetch('/api/profile', {
      //   method: 'PUT',
      //   body: JSON.stringify(profile)
      // });

      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green'
      });
      setIsEditing(false);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <AdminPageLayout>
        <Container size="md" py="xl">
          <Title order={2} mb="xl">Admin Profile</Title>

          <Paper radius="md" withBorder p="xl" mb="xl">
            <Group justify="space-between" mb="xl">
              <Group>
                <Avatar
                  src={profile.image}
                  size={120}
                  radius={120}
                  alt={profile.name}
                />
                <div>
                  <Text fz="xl" fw={500}>
                    {profile.name}
                  </Text>
                  <Text c="dimmed" fz="sm">
                    {profile.role}
                  </Text>
                </div>
              </Group>
              <Button
                variant="light"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Group>

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <Stack>
                  <TextInput
                    label="Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                  <TextInput
                    label="Email"
                    value={profile.email}
                    readOnly
                    disabled
                  />
                  <Textarea
                    label="Bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    minRows={3}
                  />
                  <Group>
                    <FileButton
                      onChange={handleImageChange}
                      accept="image/png,image/jpeg,image/gif,image/webp"
                    >
                      {(props) => (
                        <Button variant="light" {...props}>
                          Change Avatar
                        </Button>
                      )}
                    </FileButton>
                  </Group>
                  <Group justify="flex-end" mt="md">
                    <Button
                      type="submit"
                      loading={isSubmitting}
                    >
                      Save Changes
                    </Button>
                  </Group>
                </Stack>
              </form>
            ) : (
              <Stack>
                <Group>
                  <Text fw={500}>Email:</Text>
                  <Text>{profile.email}</Text>
                </Group>
                <Group align="flex-start">
                  <Text fw={500}>Bio:</Text>
                  <Text>{profile.bio}</Text>
                </Group>
              </Stack>
            )}
          </Paper>

          <Paper radius="md" withBorder p="xl">
            <Title order={3} mb="md">Security Settings</Title>
            <Button
              variant="light"
              color="blue"
              onClick={() => {
                // Implement password change functionality
                notifications.show({
                  title: 'Coming Soon',
                  message: 'Password change functionality will be implemented soon',
                  color: 'blue'
                });
              }}
            >
              Change Password
            </Button>
          </Paper>
        </Container>
      </AdminPageLayout>
    </ErrorBoundary>
  );
} 