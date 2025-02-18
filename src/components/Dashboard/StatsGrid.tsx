'use client';

import { Grid, Card, Text, Progress, Group } from '@mantine/core';
import { IconArticle, IconBuilding, IconBulb, IconUser, IconChartBar } from '@tabler/icons-react';
import { DashboardData } from '@/types/dashboard';

const cardStyle = {
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
};

export function StatsGrid({ data }: { data: DashboardData }) {
  return (
    <>
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="xl" radius="md" withBorder h="100%" style={cardStyle}>
                <Group justify="space-between" mb="md" wrap="nowrap">
                  <Text fw={600} size="lg">Total Blogs</Text>
                  <IconArticle size={32} stroke={1.5} style={{ flexShrink: 0, color: 'var(--mantine-color-blue-6)' }} />
                </Group>
                <Text size="2.5rem" fw={700} ta="center" variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 45 }}>
                  {data.totalBlogs}
                </Text>
              </Card>
            </Grid.Col>
      
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="xl" radius="md" withBorder h="100%" style={cardStyle}>
                <Group justify="space-between" mb="md" wrap="nowrap">
                  <Text fw={600} size="lg">Total Centers</Text>
                  <IconBuilding size={32} stroke={1.5} style={{ flexShrink: 0, color: 'var(--mantine-color-green-6)' }} />
                </Group>
                <Text size="2.5rem" fw={700} ta="center" variant="gradient"
                  gradient={{ from: 'green', to: 'lime', deg: 45 }}>
                  {data.totalCenters}
                </Text>
              </Card>
            </Grid.Col>
      
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="xl" radius="md" withBorder h="100%" style={cardStyle}>
                <Group justify="space-between" mb="md" wrap="nowrap">
                  <Text fw={600} size="lg">Total Initiatives</Text>
                  <IconBulb size={32} stroke={1.5} style={{ flexShrink: 0, color: 'var(--mantine-color-yellow-6)' }} />
                </Group>
                <Text size="2.5rem" fw={700} ta="center" variant="gradient"
                  gradient={{ from: 'yellow', to: 'orange', deg: 45 }}>
                  {data.totalInitiatives}
                </Text>
              </Card>
            </Grid.Col>
      
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="xl" radius="md" withBorder h="100%" style={cardStyle}>
                <Group justify="space-between" mb="md" wrap="nowrap">
                  <Text fw={600} size="lg">Active Users</Text>
                  <IconUser size={32} stroke={1.5} style={{ flexShrink: 0, color: 'var(--mantine-color-pink-6)' }} />
                </Group>
                <Text size="2.5rem" fw={700} ta="center" variant="gradient"
                  gradient={{ from: 'pink', to: 'red', deg: 45 }}>
                  {data.activeUsers}
                </Text>
              </Card>
            </Grid.Col>
      
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="xl" radius="md" withBorder h="100%" style={cardStyle}>
                <Group justify="space-between" mb="md" wrap="nowrap">
                  <Text fw={600} size="lg">Page Views</Text>
                  <IconChartBar size={32} stroke={1.5} style={{ flexShrink: 0, color: 'var(--mantine-color-teal-6)' }} />
                </Group>
                <Text size="2.5rem" fw={700} ta="center" variant="gradient"
                  gradient={{ from: 'teal', to: 'cyan', deg: 45 }}>
                  {data.pageViews}
                </Text>
              </Card>
            </Grid.Col>
      
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="xl" radius="md" withBorder h="100%" style={cardStyle}>
                <Text mb="sm">Content Progress</Text>
                <Progress value={data.progress} size="lg" color="teal" mb="xs" />
                <Text ta="center" fw={700}>{data.progress}% Completed</Text>
              </Card>
            </Grid.Col>
    </>
  );
}
