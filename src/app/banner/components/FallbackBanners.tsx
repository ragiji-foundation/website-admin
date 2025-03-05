'use client';
import { useState, useEffect } from 'react';
import {
  Paper,
  Title,
  Grid,
  Card,
  Text,
  Image,
  Group,
  Badge,
  Button,
  Tooltip
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { generateDefaultBanner } from '@/utils/bannerUtils';
import { BannerType } from '@/types/banner';

const BANNER_TYPES: BannerType[] = [
  'blog', 'about', 'initiatives', 'successstories', 'home', 'media',
  'electronicmedia', 'gallery', 'newscoverage', 'ourstory', 'need',
  'centers', 'contactus', 'careers', 'awards'
];

interface FallbackBannersProps {
  existingBannerTypes: string[];
  onCreateBanner: (type: BannerType) => void;
}

export function FallbackBanners({ existingBannerTypes, onCreateBanner }: FallbackBannersProps) {
  // Filter out banner types that already have a banner
  const missingBannerTypes = BANNER_TYPES.filter(
    type => !existingBannerTypes.includes(type)
  );

  if (missingBannerTypes.length === 0) {
    return null;
  }

  return (
    <Paper p="xl" radius="md" withBorder mb="xl">
      <Title order={3} mb="lg">Default Banners</Title>
      <Text mb="md">
        These are the default fallback banners used when no banner exists for a type.
        Click the button to create a custom banner for any of these types.
      </Text>

      <Grid>
        {missingBannerTypes.map(type => {
          const defaultBanner = generateDefaultBanner(type);
          return (
            <Grid.Col key={type} span={{ base: 12, sm: 6, lg: 4 }}>
              <Card withBorder shadow="sm" padding="md" radius="md">
                <Card.Section>
                  <div style={{ position: 'relative' }}>
                    <Image
                      src={defaultBanner.backgroundImage}
                      height={150}
                      alt={`Default ${type} banner`}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      color: '#fff',
                      textShadow: '0 0 5px rgba(0,0,0,0.7)'
                    }}>
                      <Title order={4}>{defaultBanner.title}</Title>
                    </div>
                  </div>
                </Card.Section>

                <Group justify="apart" mt="md">
                  <Badge color="orange">Default Fallback</Badge>
                  <Tooltip label={`Create custom ${type} banner`}>
                    <Button
                      size="xs"
                      leftSection={<IconPlus size={14} />}
                      onClick={() => onCreateBanner(type)}
                    >
                      Replace
                    </Button>
                  </Tooltip>
                </Group>

                <Text size="sm" c="dimmed" mt="sm">
                  This default gradient banner will be used when the {type} banner is requested.
                </Text>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>
    </Paper>
  );
}
