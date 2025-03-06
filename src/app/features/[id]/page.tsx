'use client';

import { useEffect, useState } from 'react';
import { FeatureForm } from '@/components/Features/FeatureForm';
import { Center, Loader, Alert, Button, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Feature } from '@/types/feature';
import { useRouter } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';

export default function EditFeaturePage( 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any) {
  const [feature, setFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = context.params;
  const router = useRouter();

  useEffect(() => {
    async function fetchFeature() {
      try {
        setLoading(true);
        const response = await fetch(`/api/features/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch feature');
        }

        const data = await response.json();
        setFeature(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        notifications.show({
          title: 'Error',
          message: 'Failed to load feature',
          color: 'red'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchFeature();
  }, [id]);

  if (loading) {
    return (
      <Center style={{ height: 300 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !feature) {
    return (
      <Alert color="red" title="Error" mb="lg">
        <Text mb="md">{error || 'Feature not found'}</Text>
        <Button
          component={Link}
          href="/features"
          variant="outline"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Features
        </Button>
      </Alert>
    );
  }

  return <FeatureForm initialData={feature} isEditing />;
}
