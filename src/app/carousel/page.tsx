import { CarouselManager } from '@/components/Pages/CarouselManager';
import { Stack, Title } from '@mantine/core';

export default function CarouselPage() {
  return (
    <Stack>
      <Title order={2}>Manage Carousel</Title>
      <CarouselManager />
    </Stack>
  );
}
