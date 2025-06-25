'use client';

import { Group, Text, Avatar, Menu, Image } from '@mantine/core';
import { IconLogout, IconUser, IconSettings } from '@tabler/icons-react';
import Link from 'next/link';
import { ActionToggle } from '@/components/ActionToggle';
import { useRouter } from 'next/navigation';

export interface HeaderProps {
  settings?: {
    siteName?: string;
    logoUrl?: string | null;
  };
}



export function Header({ settings }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const response = await fetch('/api/logout', {
      method: 'POST',
    });

    if (response.ok) {
      router.push('/auth/login');
    } else {
      console.error('Logout failed:', response.statusText);
    }
  };

  return (
    <Group h="100%" px="md" justify="space-between" align="center">
      <Group>
        <Image
          src={settings?.logoUrl || "/logo.png"}
          alt="Ragiji Foundation Logo"
          w={52}
          h={52}
      
        />
        <Text size="xl" fw={700}>
          {settings?.siteName || 'Ragiji Foundation '}
        </Text>
      </Group>

      <Group justify="space-between">
        <ActionToggle />

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Avatar
              src="/avatar.png"
              alt="User Avatar"
              style={{ cursor: 'pointer' }}
            />
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Account</Menu.Label>
            <Menu.Item leftSection={<IconUser size={14} />} component={Link} href="/profile">
              Profile
            </Menu.Item>
            <Menu.Item leftSection={<IconSettings size={14} />} component={Link} href="/settings">
              Account Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
              Logout
            </Menu.Item>
          </Menu.Dropdown>

        </Menu>
      </Group>
    </Group>
  );
}