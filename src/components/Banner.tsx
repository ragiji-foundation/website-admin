'use client';

import { Box, Container, Title, Text, Button, Group, Stack } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import Image from 'next/image';

interface BannerProps {
  id: string;
  type: string;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  backgroundImage: string;
  actionText?: string;
  actionUrl?: string;
  showHindi?: boolean;
}

export function Banner({
  title,
  titleHi,
  description,
  descriptionHi,
  backgroundImage,
  actionText,
  actionUrl,
  showHindi = false,
}: BannerProps) {
  const displayTitle = showHindi && titleHi ? titleHi : title;
  const displayDescription = showHindi && descriptionHi ? descriptionHi : description;

  return (
    <Box
      style={{
        position: 'relative',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background Image */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Image
          src={backgroundImage}
          alt={title}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </Box>

      {/* Overlay */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <Container size="lg" style={{ position: 'relative', zIndex: 3 }}>
        <Box
          style={{
            color: 'white',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <Stack gap="lg">
            <Title
              order={1}
              size="3rem"
              fw={700}
              style={{
                fontFamily: showHindi && titleHi ? 'Noto Sans Devanagari, sans-serif' : undefined,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
              }}
            >
              {displayTitle}
            </Title>

            {displayDescription && (
              <Text
                size="xl"
                style={{
                  fontFamily: showHindi && descriptionHi ? 'Noto Sans Devanagari, sans-serif' : undefined,
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
                  opacity: 0.9,
                }}
              >
                {displayDescription}
              </Text>
            )}

            {actionText && actionUrl && (
              <Group justify="center" mt="xl">
                <Button
                  component="a"
                  href={actionUrl}
                  size="lg"
                  rightSection={<IconArrowRight size={18} />}
                  variant="white"
                  color="dark"
                  style={{
                    fontWeight: 600,
                    padding: '12px 24px',
                  }}
                >
                  {actionText}
                </Button>
              </Group>
            )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

// Hero Banner variant
export function HeroBanner(props: BannerProps) {
  return (
    <Box style={{ minHeight: '70vh' }}>
      <Banner {...props} />
    </Box>
  );
}

// Compact Banner variant
export function CompactBanner(props: BannerProps) {
  return (
    <Box style={{ minHeight: '250px' }}>
      <Banner {...props} />
    </Box>
  );
}

// Banner with language toggle
interface BilingualBannerProps extends BannerProps {
  language: 'en' | 'hi';
  onLanguageChange?: (lang: 'en' | 'hi') => void;
}

export function BilingualBanner({ language, onLanguageChange, ...props }: BilingualBannerProps) {
  return (
    <Box style={{ position: 'relative' }}>
      <Banner {...props} showHindi={language === 'hi'} />
      
      {onLanguageChange && (props.titleHi || props.descriptionHi) && (
        <Box
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 4,
          }}
        >
          <Group gap="xs">
            <Button
              size="xs"
              variant={language === 'en' ? 'filled' : 'light'}
              onClick={() => onLanguageChange('en')}
            >
              EN
            </Button>
            <Button
              size="xs"
              variant={language === 'hi' ? 'filled' : 'light'}
              onClick={() => onLanguageChange('hi')}
              style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
            >
              हिं
            </Button>
          </Group>
        </Box>
      )}
    </Box>
  );
}