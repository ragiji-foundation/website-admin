'use client';
import React from 'react';
import { Box, Container, Grid, Image, Title, Center, Loader, Paper, Code } from '@mantine/core';
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

  // Format the HTML string for display by creating DOM nodes
  const createMarkup = (htmlString: string) => {
    return { __html: htmlString };
  };

  return (
    <main>
      <Box bg="var(--mantine-color-gray-0)" py="xl">
        <Container size="lg" py="xl">
          <Title order={2} ta="center" mb="xl" className={classes.sectionTitle}>
            THE EDUCATION CRISIS
          </Title>

          <Grid gutter="xl" align="stretch">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Paper p="xl" radius="md" className={classes.contentPaper}>
                <Title order={3} mb="md">Main Text</Title>

                {/* Render HTML content properly */}
                <div
                  className={classes.richText}
                  dangerouslySetInnerHTML={createMarkup(data.mainText)}
                />
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Box className={classes.imageWrapper}>
                <Image
                  src={data.imageUrl}
                  alt="Child in need of education"
                  className={classes.image}
                  radius="md"
                />
              </Box>
            </Grid.Col>
          </Grid>

          <Grid mt="xl" gutter="xl">
            <Grid.Col span={12}>
              <Paper p="xl" radius="md" className={classes.contentPaper}>
                <Title order={3} mb="md">Statistics</Title>
                <div
                  className={classes.richText}
                  dangerouslySetInnerHTML={createMarkup(data.statistics)}
                />
              </Paper>
            </Grid.Col>

            <Grid.Col span={12} mt="xl">
              <Paper p="xl" radius="md" className={classes.contentPaper}>
                <Title order={3} mb="md">Impact</Title>
                <div
                  className={classes.richText}
                  dangerouslySetInnerHTML={createMarkup(data.impact)}
                />
              </Paper>
            </Grid.Col>
          </Grid>
        </Container>

        <Container size="lg" py="xl">
          <Title order={2} ta="center" mb="lg" className={classes.sectionTitle}>
            EDUCATION STATISTICS – CRISIS DATA
          </Title>

          <Center>
            <Box className={classes.imageWrapper} style={{ maxWidth: '800px' }}>
              <Image
                src={data.statsImageUrl}
                alt="Education Statistics Data"
                className={classes.image}
                radius="md"
              />
            </Box>
          </Center>
        </Container>

        {data.isPublished ? (
          <Box ta="center" mt="md" pb="md" className={classes.publishStatus}>
            <div className={classes.publishedBadge}>✓ Published</div>
          </Box>
        ) : (
          <Box ta="center" mt="md" pb="md" className={classes.publishStatus}>
            <div className={classes.unpublishedBadge}>✗ Not Published</div>
          </Box>
        )}

        {/* Debug section to show raw content (development only) */}
        {process.env.NODE_ENV !== 'production' && (
          <Container size="lg" py="md">
            <Paper p="md" withBorder>
              <details>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Debug Raw Content</summary>
                <div style={{ marginTop: '1rem' }}>
                  <Code block style={{ whiteSpace: 'pre-wrap', maxHeight: '300px', overflow: 'auto' }}>
                    {JSON.stringify(data, null, 2)}
                  </Code>
                </div>
              </details>
            </Paper>
          </Container>
        )}
      </Box>
    </main>
  );
}
