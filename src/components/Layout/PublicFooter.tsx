'use client';

import { Group, Text, ActionIcon, Stack } from '@mantine/core';
import { IconBrandTwitter, IconBrandFacebook, IconBrandInstagram } from '@tabler/icons-react';

interface PublicFooterProps {
  siteName?: string;
  socialLinks?: {
    twitter: string;
    facebook: string;
    instagram: string;
  };
  contactEmail?: string;
}

export function PublicFooter({ siteName = 'CMS', socialLinks, contactEmail }: PublicFooterProps) {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Stack gap={0}>
        <Text size="sm">© {new Date().getFullYear()} {siteName}</Text>
        {contactEmail && (
          <Text size="sm" c="dimmed">
            Contact: {contactEmail}
          </Text>
        )}
      </Stack>

      {socialLinks && (
        <Group>
          {socialLinks.twitter && (
            <ActionIcon
              component="a"
              href={socialLinks.twitter}
              target="_blank"
              variant="light"
            >
              <IconBrandTwitter size={18} />
            </ActionIcon>
          )}
          {socialLinks.facebook && (
            <ActionIcon
              component="a"
              href={socialLinks.facebook}
              target="_blank"
              variant="light"
            >
              <IconBrandFacebook size={18} />
            </ActionIcon>
          )}
          {socialLinks.instagram && (
            <ActionIcon
              component="a"
              href={socialLinks.instagram}
              target="_blank"
              variant="light"
            >
              <IconBrandInstagram size={18} />
            </ActionIcon>
          )}
        </Group>
      )}
    </Group>
  );
} 