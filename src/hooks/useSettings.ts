import { useQuery } from '@tanstack/react-query';
import type { Settings } from '@/types/settings';

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });
} 