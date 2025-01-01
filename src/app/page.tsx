"use client";

import { useEffect, useState } from 'react';
import { Container, Grid, Card, Text, Progress, Button, Title, Group, Badge, Skeleton } from '@mantine/core';
import { IconArticle, IconFileText, IconBuilding, IconBulb, IconUser, IconChartBar } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface DashboardData {
  totalBlogs: number;
  totalCenters: number;
  totalInitiatives: number;
  totalCareers: number;
  activeUsers: number;
  monthlyVisitors: number;
  pageViews: number;
  progress: number;
}

function DashboardSkeleton() {
  return (
    <Container my="lg">
      <Skeleton height={40} mb="xl" />
      <Grid gutter="xl">
        {[...Array(6)].map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
            <Skeleton height={120} radius="md" />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}

function StatsGrid({ data }: { data: DashboardData }) {
  return (
    <>
      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text>Total Blogs</Text>
            <IconArticle size={40} />
          </Group>
          <Text size="xl" fw={700} ta="center">{data.totalBlogs}</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text>Total Centers</Text>
            <IconBuilding size={40} />
          </Group>
          <Text size="xl" fw={700} ta="center">{data.totalCenters}</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text>Total Initiatives</Text>
            <IconBulb size={40} />
          </Group>
          <Text size="xl" fw={700} ta="center">{data.totalInitiatives}</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text>Active Users</Text>
            <IconUser size={40} />
          </Group>
          <Text size="xl" fw={700} ta="center">{data.activeUsers}</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <Text>Page Views</Text>
            <IconChartBar size={40} />
          </Group>
          <Text size="xl" fw={700} ta="center">{data.pageViews}</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Text mb="sm">Content Progress</Text>
          <Progress value={data.progress} size="lg" color="teal" mb="xs" />
          <Text ta="center" fw={700}>{data.progress}% Completed</Text>
        </Card>
      </Grid.Col>
    </>
  );
}

function AnalyticsOverview({ data }: { data: DashboardData }) {
  return (
    <>
      <Grid.Col span={12}>
        <Title order={3} ta="center" mt="xl" mb="sm">
          Analytics Overview
        </Title>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Text size="lg" mb="sm">Website Traffic</Text>
          <Text size="xl" fw={700} color="blue">{data.monthlyVisitors.toLocaleString()} Monthly Visitors</Text>
          <Text size="sm" c="dimmed" mt="xs">{data.pageViews.toLocaleString()} Page Views</Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Card shadow="md" padding="lg" radius="md" withBorder>
          <Text size="lg" mb="sm">User Engagement</Text>
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch dashboard data',
          color: 'red'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return <Text>Failed to load dashboard data</Text>;
  }

  return (
    <Container my="lg">
      <Title order={2} ta="center" mb="xl">Admin Dashboard</Title>

      <Grid gutter="xl">
        <StatsGrid data={data} />
        <AnalyticsOverview data={data} />
      </Grid>
    </Container>
  );
}