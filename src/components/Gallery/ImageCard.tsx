import { Card, Image, Stack, Text, Badge, Group, ActionIcon, Tooltip, CopyButton } from '@mantine/core';
import { IconCheck, IconCopy, IconTrash, IconEdit } from '@tabler/icons-react';
import { GalleryItem } from '@/types/gallery';

interface ImageCardProps {
  item: GalleryItem;
  onDelete: (id: number | string) => void;
  onEdit?: (item: GalleryItem) => void;
  onClick: () => void;
  language?: 'en' | 'hi';
}

export function ImageCard({ item, onDelete, onEdit, onClick, language = 'en' }: ImageCardProps) {
  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      style={{
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        },
      }}
      onClick={onClick}
    >
      <Card.Section>
        <Image
          src={item.imageUrl}
          alt={language === 'hi' ? item.titleHi || item.title : item.title}
          height={200}
          fit="cover"
        />
      </Card.Section>

      <Stack gap="xs" mt="md">
        <Text fw={500} lineClamp={1}>{language === 'hi' ? item.titleHi || item.title : item.title}</Text>
        <Badge size="sm" variant="light" color="blue">
          {item.category}
        </Badge>
        <Group justify="space-between" mt="xs">
          <CopyButton value={item.imageUrl ?? ''}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied!' : 'Copy URL'}>
                <ActionIcon
                  variant="light"
                  color={copied ? 'teal' : 'blue'}
                  onClick={(e) => {
                    e.stopPropagation();
                    copy();
                  }}
                >
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
          <Group gap="xs">
            {onEdit && (
              <Tooltip label="Edit">
                <ActionIcon
                  variant="light"
                  color="blue"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="Delete">
              <ActionIcon
                variant="light"
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(Number(item.id));
                }}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
