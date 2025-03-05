'use client';
import { useState } from 'react';
import { FileButton, Button, Group, Text, Image, Card, Container, Title, Divider, Code, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function TestCloudinaryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadToCloudinary = async () => {
    if (!file) {
      notifications.show({
        title: 'No file selected',
        message: 'Please select an image to upload',
        color: 'yellow',
      });
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ragiji'); // Changed to use the correct preset name
      formData.append('folder', 'ragiji-foundation/test');

      // For debugging
      console.log('Using upload preset: ragiji');

      const response = await fetch(`https://api.cloudinary.com/v1_1/dhyetvc2r/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Non-JSON response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
      }

      setResponseData(data);
      setUploadedUrl(data.secure_url);

      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green',
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');

      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to upload image',
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Title order={1} mb="lg">Cloudinary Upload Test</Title>

      <Card withBorder p="lg" radius="md" mb="xl">
        <Group mb="md">
          <FileButton onChange={setFile} accept="image/png,image/jpeg,image/gif,image/webp">
            {(props) => <Button {...props}>Select Image</Button>}
          </FileButton>
          <Button
            onClick={uploadToCloudinary}
            disabled={!file || uploading}
            loading={uploading}
          >
            Upload to Cloudinary
          </Button>
        </Group>

        {file && (
          <Text size="sm" ta="center">
            Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
          </Text>
        )}
      </Card>

      {error && (
        <Card withBorder p="lg" radius="md" mb="xl">
          <Title order={3} mb="md" c="red">Error</Title>
          <Text c="red">{error}</Text>
        </Card>
      )}

      {uploadedUrl && (
        <Card withBorder p="lg" radius="md" mb="xl">
          <Title order={3} mb="md">Uploaded Image</Title>
          <Stack align="center">
            <Image
              src={uploadedUrl}
              alt="Uploaded image"
              fit="contain"
              maw={400}
              radius="md"
            />
            <Text size="sm" ta="center" fw={500}>
              {uploadedUrl}
            </Text>
          </Stack>
        </Card>
      )}

      {responseData && (
        <Card withBorder p="lg" radius="md">
          <Title order={3} mb="md">Response Data</Title>
          <Divider mb="md" />
          <Code block>
            {JSON.stringify(responseData, null, 2)}
          </Code>
        </Card>
      )}
    </Container>
  );
}
