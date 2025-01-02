'use client';
import AdminLayout from '@/components/Layout/AdminLayout';
import { usePathname } from 'next/navigation';
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

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
              <AdminLayout>{children}</AdminLayout>
            )}
          </MantineProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}

