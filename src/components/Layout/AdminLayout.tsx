'use client';
import { memo } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Loader, Center } from '@mantine/core';




interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: settings, isLoading } = useSettings();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return (

      

        <main >
          {children}
        </main>
  
  );
}

export default memo(AdminLayout);