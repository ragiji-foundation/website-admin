'use client';
import AdminLayout from '@/components/Layout/AdminLayout';
import { usePathname } from 'next/navigation';
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, AppShell } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import Navbar from '@/components/Layout/Navbar';
import { Header } from '@/components/Layout/Header';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <MantineProvider defaultColorScheme="light">
            <Notifications />
            {pathname?.startsWith('/auth') ? (
              children
            ) : (
              <AppShell
                header={{ height: 60 }} // Match this with navbar top position
                navbar={{ width: 280, breakpoint: 'none' }} // Disable responsive breakpoint
                padding="md"
              >
                <AppShell.Header>
                  <Header />
                </AppShell.Header>
                <AppShell.Navbar>
                  <Navbar />
                </AppShell.Navbar>
                <AppShell.Main>
                  <AdminLayout>{children}</AdminLayout>
                </AppShell.Main>
              </AppShell>
            )}
          </MantineProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

