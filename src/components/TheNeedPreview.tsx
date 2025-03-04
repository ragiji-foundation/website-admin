'use client';
import React from 'react';
import { Box, Container, Grid, Image, Text, Title, Center, Loader } from '@mantine/core';
import { useTheNeed } from '@/context/TheNeedContext';
import classes from './TheNeedPreview.module.css';

export default function TheNeedPreview() {
  const { data } = useTheNeed();

  if (!data) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <main>
      <Box bg="var(--mantine-color-gray-0)" py="xl">
        <Container size="lg" py="xl">
          <Title order={2} ta="center" mb="md">
            ⭐ THE EDUCATION CRISIS
          </Title>

          <Grid gutter="xl" align="center">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Text size="lg">{data.mainText}</Text>
              <Text mt="md">{data.statistics}</Text>
              <Text mt="md">{data.impact}</Text>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Box className={classes.imageWrapper}>
                <Image
                  src={data.imageUrl}
                  alt="Child in need of education"
                  className={classes.image}
                  style={{
                    border: '1px solid var(--mantine-color-gray-3)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              </Box>
            </Grid.Col>
          </Grid>
        </Container>

        <Container size="lg" py="xl">
          <Title order={2} ta="center" mb="md">
            ⭐ EDUCATION STATISTICS – CRISIS DATA
          </Title>

          <Center>
            <Box className={classes.imageWrapper}>
              <Image
                src={data.statsImageUrl}
                alt="Education Statistics Data"
                className={classes.image}
                style={{
                  border: '1px solid var(--mantine-color-gray-3)',
                  transition: 'transform 0.3s ease',
                }}
              />
            </Box>
          </Center>
        </Container>
      </Box>
    </main>
  );
}
