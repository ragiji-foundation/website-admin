

import React from 'react';
import {
  Container,
  Grid,
  Title,
  Text,
  Image,
  Card,
  SimpleGrid,
  Box,
  Group,
  Paper
} from '@mantine/core';
import { RichTextContent } from '@/components/RichTextContent';
import classes from './OurStoryPreview.module.css';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  title?: string;
}

interface OurStoryProps {
  story?: { //All properties are now optional
    title?: string;
    content?: string;
    media?: MediaItem[];
    isActive?: boolean;
  };
  model?: {  //All properties are now optional
    description?: string;
    imageUrl?: string;
  };
  visionMission?: { //All properties are now optional
    vision?: string;
    mission?: string;
    visionIcon?: string;
    missionIcon?: string;
  };
  timeline?: Array<{ //All properties are now optional
    year?: string;
    title?: string;
    centers?: number;
    volunteers?: number;
    children?: number;
    order?: number;
  }>;
}

export default function OurStoryPreview({
  story = {}, //Default values added for each prop
  model = {}, //Default values added for each prop
  visionMission = {}, //Default values added for each prop
  timeline = [] //Default values added for each prop
}: OurStoryProps) {
  // Sort timeline items by order
  const sortedTimeline = [...(timeline || [])].sort((a, b) => (a.order || 0) - (b.order || 0)); // Use empty array and default order

  return (
    <Box className={classes.previewContainer}>
      {/* Story Section */}
      <Container size="xl" py="xl">
        <div className={classes.sectionContainer}>
          <h2 className={classes.sectionTitle}>★ {story?.title || "Our Story"}</h2> {/* Use optional chaining and default title*/}
          <RichTextContent content={story?.content || ""} />{/* Use optional chaining and empty string as default*/}

          {/* Media Items */}
          <SimpleGrid cols={3} mt="md">
            {story?.media?.map((item, index) => ( // Use optional chaining
              <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
                {item.type === 'image' ? (
                  <Image src={item.url} alt={item.title || 'Story Image'} height={150} />
                ) : (
                  <iframe
                    src={item.url}
                    title={item.title || 'Story Video'}
                    height="150"
                    style={{ border: 'none', width: '100%' }}
                  />
                )}
                <Text mt="sm" fw={500}>
                  {item.title || 'Untitled Media'}
                </Text>
              </Card>
            )) || null} {/* render null instead if story?.media is undefined or null*/}
          </SimpleGrid>
        </div>
      </Container>

      {/* The Model Section */}
      <Container size="xl" py="xl">
        <div className={classes.sectionContainer}>
          <h2 className={classes.sectionTitle}>♦ Our Model</h2>
          <Grid gutter="xl">
            <Grid.Col span={6}>
              <RichTextContent content={model?.description || ""} />{/* Use optional chaining and empty string as default*/}
            </Grid.Col>
            <Grid.Col span={6}>
              <Image src={model?.imageUrl || ""} alt="Our Model" radius="md" />{/* Use optional chaining and empty string as default*/}
            </Grid.Col>
          </Grid>
        </div>
      </Container>

      {/* Vision & Mission Section */}
      <Container size="xl" py="xl">
        <div className={classes.sectionContainer}>
          <h2 className={classes.sectionTitle}>◎ Vision & Mission</h2>
          <Grid gutter="xl">
            <Grid.Col span={6}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group align="center">
                  <Image src={visionMission?.visionIcon || ""} alt="Vision Icon" width={40} height={40} />{/* Use optional chaining and empty string as default*/}
                  <Title order={4}>Vision</Title>
                </Group>
                <RichTextContent content={visionMission?.vision || ""} />{/* Use optional chaining and empty string as default*/}
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group align="center">
                  <Image src={visionMission?.missionIcon || ""} alt="Mission Icon" width={40} height={40} />{/* Use optional chaining and empty string as default*/}
                  <Title order={4}>Mission</Title>
                </Group>
                <RichTextContent content={visionMission?.mission || ""} />{/* Use optional chaining and empty string as default*/}
              </Card>
            </Grid.Col>
          </Grid>
        </div>
      </Container>

      {/* Timeline Section */}
      <Container size="xl" py="xl">
        <div className={classes.sectionContainer}>
          <h2 className={classes.sectionTitle}>◷ Timeline</h2>
          {sortedTimeline.map((item, index) => (
            <Paper key={index} shadow="sm" p="lg" radius="md" withBorder mt="md">
              <Title order={5}>{item.year}: {item.title}</Title> {/* Use optional chaining  */}
              <Text size="sm" color="dimmed">
                Centers: {item.centers}, Volunteers: {item.volunteers}, Children: {item.children} {/* Use optional chaining  */}
              </Text>
            </Paper>
          ))}
        </div>
      </Container>
    </Box>
  );
}