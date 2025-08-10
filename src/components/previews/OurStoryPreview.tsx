

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
          <h2 className={classes.sectionTitle}>★ {story?.title || "Our Story"}</h2>
          <Grid gutter="xl">
            <Grid.Col span={7}>
              <div className={classes.contentWrapper}>
                <RichTextContent content={story?.content || ""} />
              </div>
            </Grid.Col>
            <Grid.Col span={5}>
              {Array.isArray(story?.media) && story.media.length > 0 && (
                <div className={classes.mediaGrid}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.featuredMedia}>
                    {story.media[0].type === 'image' && story.media[0].url ? (
                      <Image
                        src={story.media[0].url}
                        alt={story.media[0].title || 'Featured Story Image'}
                        height={300}
                        fit="cover"
                        className={classes.mainImage}
                      />
                    ) : story.media[0].type === 'video' && story.media[0].url ? (
                      <iframe
                        src={story.media[0].url}
                        title={story.media[0].title || 'Featured Story Video'}
                        height="300"
                        style={{ border: 'none', width: '100%', borderRadius: 'var(--mantine-radius-md)' }}
                      />
                    ) : null}
                  </Card>
                  {story.media.length > 1 && (
                    <SimpleGrid cols={2} mt="md">
                      {story.media.slice(1, 3).map((item, index) => (
                        <Card key={index} shadow="sm" padding="xs" radius="md" withBorder>
                          {item.type === 'image' && item.url ? (
                            <Image 
                              src={item.url} 
                              alt={item.title || 'Story Image'} 
                              height={120}
                              fit="cover"
                            />
                          ) : item.type === 'video' && item.url ? (
                            <iframe
                              src={item.url}
                              title={item.title || 'Story Video'}
                              height="120"
                              style={{ border: 'none', width: '100%', borderRadius: 'var(--mantine-radius-md)' }}
                            />
                          ) : null}
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </div>
              )}
            </Grid.Col>
          </Grid>
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