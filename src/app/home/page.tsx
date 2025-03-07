import React from 'react';
import { Stack, Title, SimpleGrid, Card, Text, Group, ActionIcon, UnstyledButton } from '@mantine/core';
import { IconPhotoPause, IconLayoutCollage, IconSettings, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

import { CardsCarousel } from '@/components/Pages/CardsCarousel';
import { CarouselManager } from '@/components/Pages/CarouselManager';
import { Initiatives } from '@/components/Pages/Initiatives';

function App() {
  console.log('App rendered.');
  return (
    <div className="app-container">
      <CardsCarousel />
      <CarouselManager />
      {/* //TODO FEATURE */}
      <Initiatives />
      {/* // TODO STATS */}

      {/* // TODO SUCCESS STORIES */}
    </div>
  );
}

export default function HomeManagementPage() {
  const sections = [
    {
      title: 'Carousel',
      description: 'Configure homepage carousel slides',
      icon: <IconPhotoPause size={24} />,
      link: '/home/carousel'
    },
    {
      title: 'Banners',
      description: 'Manage site banners and headers',
      icon: <IconLayoutCollage size={24} />,
      link: '/banners'
    },
    {
      title: 'Settings',
      description: 'Configure homepage settings',
      icon: <IconSettings size={24} />,
      link: '/settings'
    }
  ];

  return (
    <Stack gap="xl">
      <Title order={1}>Home Page Management</Title>
      <Text size="lg" c="dimmed">
        Configure and manage components displayed on the homepage
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mt="md">
        {sections.map((section) => (
          <Card
            key={section.title}
            component={Link}
            href={section.link}
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <Group justify="apart" mb="xs">
              <Group gap="sm">
                {section.icon}
                <Title order={4}>{section.title}</Title>
              </Group>
              <ActionIcon variant="subtle">
                <IconChevronRight size={18} />
              </ActionIcon>
            </Group>
            <Text size="sm" color="dimmed">
              {section.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}