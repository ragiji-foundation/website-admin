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
    <Container size="xl" py="xl">
      <Skeleton height={50} width="70%" mx="auto" mb="xl" radius="md" />
      <Grid gutter="xl">
        {[...Array(6)].map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
            <Skeleton height={180} radius="md" />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}

function StatsGrid({ data }: { data: DashboardData }) {
  const cardStyle = {
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    },
  };

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
            <Text fw="600" size="lg">Page Views</Text>
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

function AnalyticsOverview({ data }: { data: DashboardData }) {
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data) throw new Error('No data received');
        setData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch dashboard data. Please try again later.',
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
    <Container size="xl" py={{ base: 'xl', sm: '2xl' }}>
      <Title
        order={1}
        ta="center"
        mb={{ base: 'xl', sm: '2xl' }}
        styles={(theme) => ({
          root: {
            background: `linear-gradient(45deg, #4263eb, #00b5d8)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }
        })}
      >
        Admin Dashboard
      </Title>

      <Grid gutter="xl">
        <StatsGrid data={data} />
        <AnalyticsOverview data={data} />
      </Grid>
    </Container>
  );
}