
'use client';
import AdminLayout from '@/components/Layout/AdminLayout';
import { usePathname } from 'next/navigation';


import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import { MantineProvider } from '@mantine/core';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
 


  return (
    <html lang="en">
      <body>
        <MantineProvider defaultColorScheme="light">
          {/* Let the middleware handle authentication redirects */}
          {pathname.startsWith('/auth') ? (
            children
          ) : (
            <AdminLayout>{children}</AdminLayout>
          )}
        </MantineProvider>
      </body>
    </html>
  );
}

