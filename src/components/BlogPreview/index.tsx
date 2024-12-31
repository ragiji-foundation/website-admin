'use client';

import { ScrollArea, Title, Group, Badge } from '@mantine/core';

interface BlogPreviewProps {
  title: string;
  content: string;
  category?: { name: string };
  tags?: Array<{ name: string }>;
}

export function BlogPreview({ title, content, category, tags }: BlogPreviewProps) {
  return (
    <ScrollArea h={600} type="auto">
      <div className="prose max-w-none">
        <Title order={3} mb="md">{title}</Title>

        <Group mb="lg">
          {category && (
            <Badge color="blue" variant="light" size="lg">
              {category.name}
            </Badge>
          )}
          {tags?.map((tag) => (
            <Badge
              key={`preview-tag-${tag.name}`}
              color="gray"
              variant="outline"
              size="sm"
            >
              {tag.name}
            </Badge>
          ))}
        </Group>

        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </ScrollArea>
  );
} 