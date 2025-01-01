import { isApiError } from '@/types/api';

export async function fetchWithError<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    const message = isApiError(data) ? data.error : 'An unexpected error occurred';
    throw new Error(message);
  }

  return data as T;
} 