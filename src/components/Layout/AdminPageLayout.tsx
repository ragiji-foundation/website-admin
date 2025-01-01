'use client';

import { Container } from '@mantine/core';

interface AdminPageLayoutProps {
  children: React.ReactNode;
}

export function AdminPageLayout({ children }: AdminPageLayoutProps) {
  return (
    <Container size="xl" py="xl" px="md">
      {children}
    </Container>
  );
}

export default AdminPageLayout; 