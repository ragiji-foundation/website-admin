'use client';

import { AppShell, Loader, Center } from '@mantine/core';
import { AdminHeader } from './AdminHeader';
import { Navbar } from './Navbar';
import { useSettings } from '@/hooks/useSettings';
import { Header } from './Header';

export function AdminLayout({ children }: { children: React.ReactNode }) {
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
      navbar={{ width: 100, breakpoint: 'sm' }}
      padding="xs"
    >
      <AppShell.Header>
        <Header
       
        />
      </AppShell.Header>
      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

export default AdminLayout; 