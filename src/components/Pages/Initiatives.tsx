'use client';
import { useEffect, useState } from 'react';
import { Container, Text, Card, SimpleGrid, Center, Loader, Stack, Group, ActionIcon } from '@mantine/core';
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import styles from './Initiatives.module.css';

interface Initiative {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

export function Initiatives() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        setError(null);
        const response = await fetch('/api/initiatives');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setInitiatives(data);
      } catch (error) {
        console.error('Error fetching initiatives:', error);
        setError(error instanceof Error ? error.message : 'Failed to load initiatives');
      } finally {
        setLoading(false);
      }
    };

    fetchInitiatives();
  }, []);

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`/api/initiatives/${id}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reorder');
      }

      // Refetch initiatives to get updated order
      const updatedResponse = await fetch('/api/initiatives');
      const updatedData = await updatedResponse.json();
      setInitiatives(updatedData);

      notifications.show({
        title: 'Success',
        message: 'Initiative reordered successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Error reordering:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to reorder initiative',
        color: 'red',
      });
    }
  };

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md">
          <Text c="red" size="xl" fw={700}>Error</Text>
          <Text>{error}</Text>
        </Stack>
      </Center>
    );
  }

  if (initiatives.length === 0) {
    return (
      <Center h={400}>
        <Text size="xl">No initiatives found</Text>
      </Center>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Container size="xl" className={styles.container}>
        <Text size="xl" fw={700} ta="center" mb={30} className={styles.title}>
          Our Initiatives
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} className={styles.grid}>
          {initiatives.map((initiative, index) => (
            <Card
              key={initiative.id}
              className={styles.initiativeCard}
              padding="lg"
              style={{
                backgroundImage: initiative.imageUrl ?
                  `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url(${initiative.imageUrl})` :
                  undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <Group justify="space-between" mb="xs">
                <Text fw={500} c={initiative.imageUrl ? 'white' : 'inherit'}>
                  {initiative.title}
                </Text>
                <Group gap={5}>
                  {index > 0 && (
                    <ActionIcon
                      variant="light"
                      size="sm"
                      onClick={() => handleReorder(initiative.id, 'up')}
                    >
                      <IconArrowUp size={16} />
                    </ActionIcon>
                  )}
                  {index < initiatives.length - 1 && (
                    <ActionIcon
                      variant="light"
                      size="sm"
                      onClick={() => handleReorder(initiative.id, 'down')}
                    >
                      <IconArrowDown size={16} />
                    </ActionIcon>
                  )}
                </Group>
              </Group>
              <Text
                size="sm"
                c={initiative.imageUrl ? 'white' : 'dimmed'}
                mt="sm"
              >
                {initiative.description}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </div>
  );
}