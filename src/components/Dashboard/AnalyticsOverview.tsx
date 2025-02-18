'use client';

import { Grid, Card, Text, Button, Title, Group } from '@mantine/core';
import { DashboardData } from '@/types/dashboard';

export function AnalyticsOverview({ data }: { data: DashboardData }) {
  return (
    <>
      <Grid.Col span={12}>
        <Title order={2} ta="center" mt="xl" mb="lg">
          Analytics Overview
        </Title>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Card shadow="sm" padding="xl" radius="md" withBorder h="100%"
          style={{ transition: 'transform 0.2s ease', '&:hover': { transform: 'translateY(-5px)' } }}>
          <Text size="xl" fw={600} mb="lg" variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}>
            Website Traffic
          </Text>
          <Text size="xl" fw={700} color="blue">{data.monthlyVisitors.toLocaleString()} Monthly Visitors</Text>
          <Text size="sm" c="dimmed" mt="xs">{data.pageViews.toLocaleString()} Page Views</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Card shadow="sm" padding="xl" radius="md" withBorder h="100%"
          style={{ transition: 'transform 0.2s ease', '&:hover': { transform: 'translateY(-5px)' } }}>
          <Text size="xl" fw={600} mb="lg" variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}>
            User Engagement
          </Text>
          <Text size="xl" fw={700} color="green">{data.activeUsers.toLocaleString()} Active Users</Text>
          <Text size="sm" c="dimmed" mt="xs">Last 30 Days</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={12}>
        <Group justify="center" mt="xl">
          <Button
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
            size="lg"
            component="a"
            href="/blogs/create"
          >
            Create New Content
          </Button>
        </Group>
      </Grid.Col>
    </>
  );
}
