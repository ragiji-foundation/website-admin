'use client';

import { Container, Grid, Skeleton } from '@mantine/core';

export function DashboardSkeleton() {
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
