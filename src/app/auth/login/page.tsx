"use client";
import { useState } from 'react';
import AuthenticationImage from "@/components/Auth/AuthenticationImage";
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      notifications.show({
        title: 'Success',
        message: 'Logged in successfully',
        color: 'green',
      });

      router.push('/');
      router.refresh(); // Important to refresh the router cache

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthenticationImage
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
}