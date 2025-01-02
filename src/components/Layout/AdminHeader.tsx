'use client';

import { Group, Title, Image, ActionIcon, Menu } from '@mantine/core';
import { IconBell, IconSettings, IconLogout } from '@tabler/icons-react';
import { signOut } from 'next-auth/react';

interface AdminHeaderProps {
  siteName?: string;
  logoUrl?: string | null;
}

export function AdminHeader({ siteName = 'CMS', logoUrl }: AdminHeaderProps) {
  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        {logoUrl && (
          <Image
            src={logoUrl}
            alt={siteName}
            height={40}
            width="auto"
            fit="contain"
          />
        )}
        <Title order={3}>{siteName}</Title>
      </Group>
      
      <Group>
        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="light" size="lg">
              <IconBell size={20} />
            </ActionIcon>
          </Menu.Target>
          {/* Add notifications menu items */}
        </Menu>

        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="light" size="lg">
              <IconSettings size={20} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item component="a" href="/settings">
              Settings
            </Menu.Item>
            <Menu.Item 
              color="red" 
              onClick={() => signOut()}
              leftSection={<IconLogout size={14} />}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
} 