"use client";
import '@mantine/carousel/styles.css';
import { Carousel } from '@mantine/carousel';
import { Button, Paper, Title, Center, Loader, Text, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';

import classes from './CardsCarousel.module.css';

interface CarouselItem {
  id: number;
  title: string;
  imageUrl: string;
  link: string;
  active: boolean;
  order: number;
}

function Card({ imageUrl, title }: Pick<CarouselItem, 'imageUrl' | 'title'>) {
  return (
    <Paper
      shadow="md"
      p="xl"
      radius="md"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)), url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100%'
      }}
      className={classes.card}
    >
      <div>
        <Title order={3} className={classes.title} c="white">
          {title}
        </Title>
      </div>
    </Paper>
  );
}

export function CardsCarousel() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarouselItems = async () => {
      try {
        setError(null);
        const response = await fetch('/api/carousel');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Filter active items and sort by order
        const activeItems = data
          .filter((item: CarouselItem) => item.active)
          .sort((a: CarouselItem, b: CarouselItem) => a.order - b.order);

        setItems(activeItems);
      } catch (error) {
        console.error('Error fetching carousel items:', error);
        setError(error instanceof Error ? error.message : 'Failed to load carousel items');
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselItems();
  }, []);

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md">
          <Text c="red" size="xl" fw={700}>Error</Text>
          <Text>{error}</Text>
        </Stack>
      </Center>
    );
  }

  if (items.length === 0) {
    return (
      <Center h={400}>
        <Text size="xl">No active carousel items found</Text>
      </Center>
    );
  }

  const slides = items.map((item) => (
    <Carousel.Slide key={item.id}>
      <Card imageUrl={item.imageUrl} title={item.title} />
    </Carousel.Slide>
  ));

  return (
    <Carousel
      slideSize="100%"
      slideGap="xs"
      align="center"
      slidesToScroll={1}
      loop
      withControls
      withIndicators
      styles={{
        control: {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
          },
        },
        indicator: {
          width: 12,
          height: 4,
          transition: 'width 250ms ease, background-color 250ms ease',
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          '&[data-active]': {
            width: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          },
        },
      }}
    >
      {slides}
    </Carousel>
  );
}