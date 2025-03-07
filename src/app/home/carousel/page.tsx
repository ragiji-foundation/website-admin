import { Stack, Title, Breadcrumbs, Anchor, Text, Group } from '@mantine/core';
import { IconHome2, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

// Import the existing carousel manager component
import { CarouselManager } from '@/components/Pages/CarouselManager';

export default function CarouselPage() {
  return (
    <Stack gap="md">
      <Group>
        <Breadcrumbs separator={<IconChevronRight size={14} />}>
          <Anchor component={Link} href="/">
            <Group gap="xs">
              <IconHome2 size={16} />
              <Text>Home</Text>
            </Group>
          </Anchor>
          <Text>Carousel</Text>
        </Breadcrumbs>
      </Group>

      <Title order={2}>Manage Carousel</Title>
      <Text c="dimmed">
        Configure the carousel slides that appear on the homepage
      </Text>

      <CarouselManager />
    </Stack>
  );
}
