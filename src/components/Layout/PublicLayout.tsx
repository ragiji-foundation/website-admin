'use client';

import { AppShell, Loader, Center } from '@mantine/core';
import { AdminHeader } from './AdminHeader';
import { PublicFooter } from './PublicFooter';
import { useSettings } from '@/hooks/useSettings';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { data: settings, isLoading } = useSettings();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <AdminHeader
          siteName={settings?.siteName}
          logoUrl={settings?.logoUrl}
        />
      </AppShell.Header>
      <AppShell.Main>
        {children}
      </AppShell.Main>
      <AppShell.Footer>
        <PublicFooter
          siteName={settings?.siteName}
          socialLinks={settings?.socialLinks}
          contactEmail={settings?.contactEmail}
        />
      </AppShell.Footer>
    </AppShell>
  );
} 