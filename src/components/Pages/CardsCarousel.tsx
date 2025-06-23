"use client";
import '@mantine/carousel/styles.css';
import { Carousel } from '@mantine/carousel';
import { Button, Paper, Title, Center, Loader, Text, Stack, Box } from '@mantine/core';
import { useEffect, useState } from 'react';

import classes from './CardsCarousel.module.css';

interface CarouselItem {
  id: number;
  title: string;
  titleHi?: string;
  imageUrl: string;
  link: string;
  active: boolean;
  order: number;
  type: 'image' | 'video';
  videoUrl?: string;
}

function Card({ imageUrl, videoUrl, title, titleHi, type }: Pick<CarouselItem, 'imageUrl' | 'title' | 'titleHi' | 'type' | 'videoUrl'>) {
  return (
    <Paper
      shadow="md"
      p="xl"
      radius="md"
      style={{
        position: 'relative',
        height: '100%',
        overflow: 'hidden'
      }}
      className={classes.card}
    >
      {type === 'image' ? (
        <div
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)), url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      ) : (
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
          }}
        >
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7))',
            }}
          />
        </Box>
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
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
      <Card
        imageUrl={item.imageUrl}
        videoUrl={item.videoUrl}
        title={item.title}
        titleHi={item.titleHi}
        type={item.type}
      />
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
          '&[dataActive]': {
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