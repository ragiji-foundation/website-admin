"use client";

import { useState, useEffect } from 'react';
import { Carousel } from '@mantine/carousel';
import { Paper, Title, Center, Loader, Text, Stack, Box } from '@mantine/core';

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
    <Box>
      <Paper shadow="sm" p="md" h="100%" style={{ overflow: 'hidden' }}>
        <Stack gap="sm" h="100%">
          {type === 'image' ? (
            <img
              src={imageUrl}
              alt={title}
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
          ) : (
            <video
              src={videoUrl}
              controls
              style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
          )}
          <Box>
            <Title order={4} lineClamp={2} mb="xs">
              {title}
            </Title>
            {titleHi && (
              <Text 
                size="sm" 
                c="dimmed" 
                lineClamp={2}
                style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              >
                {titleHi}
              </Text>
            )}
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export function CardsCarousel() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarouselItems = async () => {
      try {
        const response = await fetch('/api/carousel');
        if (!response.ok) {
          throw new Error('Failed to fetch carousel items');
        }
        const data = await response.json();
        setItems(data.filter((item: CarouselItem) => item.active));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselItems();
  }, []);

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h={400}>
        <Text c="red">Error loading carousel: {error}</Text>
      </Center>
    );
  }

  if (items.length === 0) {
    return (
      <Center h={400}>
        <Text c="dimmed">No carousel items available</Text>
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
      withIndicators
      height={300}
      slideSize="33.333333%"
      slideGap="md"
      loop
      align="start"
      slidesToScroll={1}
    >
      {slides}
    </Carousel>
  );
}