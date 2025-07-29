'use client';
import { Card, Image, Text, Badge, Group, Button, Stack } from '@mantine/core';
import { IconEye, IconEdit } from '@tabler/icons-react';
import Link from 'next/link';

interface SuccessStoryCardProps {
  story: {
    id: string;
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
  };
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function SuccessStoryCard({
  story,
  onEdit,
  onDelete,
  showActions = true,
}: SuccessStoryCardProps) {
  // Extract text content from rich text
  const getTextContent = (content: Record<string, any>) => {
    if (!content || typeof content !== 'object') return '';
    
    const extractText = (node: any): string => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return node.map(extractText).join(' ');
      if (node && typeof node === 'object') {
        if (node.text) return node.text;
        if (node.content) return extractText(node.content);
        return Object.values(node).map(extractText).join(' ');
      }
      return '';
    };

    return extractText(content).substring(0, 150) + '...';
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
      <Card.Section>
        {story.imageUrl ? (
          <Image
            src={story.imageUrl}
            height={200}
            alt={story.title}
            fit="cover"
          />
        ) : (
          <div
            style={{
              height: 200,
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text c="dimmed">No Image</Text>
          </div>
        )}
      </Card.Section>

      <Stack gap="sm" mt="md" style={{ height: 'calc(100% - 200px)' }}>
        <div style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start" mb="xs">
            <div style={{ flex: 1 }}>
              <Text fw={600} lineClamp={2} mb="xs">
                {story.title}
              </Text>
              {story.titleHi && (
                <Text
                  size="sm"
                  c="dimmed"
                  lineClamp={2}
                  style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                  mb="xs"
                >
                  {story.titleHi}
                </Text>
              )}
            </div>
            {story.featured && (
              <Badge color="yellow" size="sm">
                Featured
              </Badge>
            )}
          </Group>

          <div style={{ marginBottom: '0.5rem' }}>
            <Text size="sm" fw={500}>
              {story.personName}
            </Text>
            {story.personNameHi && (
              <Text
                size="xs"
                c="dimmed"
                style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              >
                {story.personNameHi}
              </Text>
            )}
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <Text size="sm" c="dimmed">
              📍 {story.location}
            </Text>
            {story.locationHi && (
              <Text
                size="xs"
                c="dimmed"
                style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              >
                📍 {story.locationHi}
              </Text>
            )}
          </div>

          <Text size="sm" c="dimmed" lineClamp={3}>
            {getTextContent(story.content)}
          </Text>
        </div>

        {showActions && (
          <Group justify="space-between" mt="auto">
            <Group gap="xs">
              <Button
                size="xs"
                variant="light"
                leftSection={<IconEye size={14} />}
                component={Link}
                href={`/success-stories/${story.id}`}
                target="_blank"
              >
                View
              </Button>
              {onEdit && (
                <Button
                  size="xs"
                  variant="light"
                  color="blue"
                  leftSection={<IconEdit size={14} />}
                  onClick={onEdit}
                >
                  Edit
                </Button>
              )}
            </Group>
            <Text size="xs" c="dimmed">
              Order: {story.order}
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
}