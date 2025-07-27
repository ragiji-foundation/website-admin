/**
 * Centralized API Data Fetching Hook
 * 
 * This hook eliminates the need for duplicate fetch implementa  // Use useRef to store the latest fetchData function to avoid dependency cycles
  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;

  const refetch = useCallback(() => fetchDataRef.current(), []);
  const fetchWithParams = useCallback((params?: Record<string, string | number | boolean>) => fetchDataRef.current(params), []);

  // Auto-fetch on mount and dependency changes - only depend on endpoint and immediate
  useEffect(() => {
    if (immediate) {
      fetchDataRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, endpoint]);cross the application. It provides consistent error handling,
 * loading states, and fallback mechanisms.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { notifications } from '@mantine/notifications';

interface UseApiDataOptions<T = unknown> {
  immediate?: boolean;
  dependencies?: React.DependencyList;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showNotifications?: boolean;
}

interface UseApiDataResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  fetchWithParams: (params?: Record<string, string | number | boolean>) => Promise<void>;
}

/**
 * Centralized data fetching hook with fallback support
 * 
 * @param endpoint - API endpoint to fetch from
 * @param fallbackData - Default data to use if API fails
 * @param options - Additional options for the hook
 * @returns Object with data, loading state, error, and refetch function
 */
export function useApiData<T>(
  endpoint: string,
  fallbackData: T,
  options: UseApiDataOptions<T> = {}
): UseApiDataResult<T> {
  const {
    immediate = true,
    dependencies = [],
    onSuccess,
    onError,
    showNotifications = true
  } = options;

  const [data, setData] = useState<T>(fallbackData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use refs to store callback functions to avoid stale closures
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const fallbackDataRef = useRef(fallbackData);
  const showNotificationsRef = useRef(showNotifications);
  
  // Update refs when options change
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  fallbackDataRef.current = fallbackData;
  showNotificationsRef.current = showNotifications;

  const fetchData = useCallback(async (params?: Record<string, string | number | boolean>) => {
    setLoading(true);
    setError(null);

    try {
      // Build URL with params if provided
      let url = endpoint;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        const paramString = searchParams.toString();
        url += paramString ? `?${paramString}` : '';
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      onSuccessRef.current?.(result);

      // Only log in development mode to reduce console spam
      if (showNotificationsRef.current && process.env.NODE_ENV === 'development') {
        console.log(`✅ Successfully fetched data from ${endpoint}`);
      }
    } catch (fetchError) {
      const errorInstance = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
      console.warn(`⚠️ API error for ${endpoint}:`, errorInstance);
      
      // Use fallback data on error
      setData(fallbackDataRef.current);
      setError(errorInstance);
      onErrorRef.current?.(errorInstance);

      if (showNotificationsRef.current) {
        notifications.show({
          title: 'Data Loading Issue',
          message: `Using cached data. ${errorInstance.message}`,
          color: 'orange'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint]); // Only depend on endpoint to prevent infinite loops

  const refetch = useCallback(() => fetchData(), [fetchData]);
  const fetchWithParams = useCallback((params?: Record<string, string | number | boolean>) => fetchData(params), [fetchData]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, fetchData, ...(dependencies || [])]);

  return {
    data,
    loading,
    error,
    refetch,
    fetchWithParams
  };
}

/**
 * Specialized hook for paginated data
 */
export function usePaginatedApiData<T>(
  endpoint: string,
  fallbackData: T[],
  options: UseApiDataOptions<{items: T[], total: number, page: number, pageSize: number}> & {
    pageSize?: number;
  } = {}
) {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  const { data, loading, error, fetchWithParams } = useApiData(
    endpoint,
    { items: fallbackData, total: 0, page: 1, pageSize: options.pageSize || 10 },
    { immediate: false, ...options }
  );

  const fetchPage = useCallback(async (pageNumber: number) => {
    setPage(pageNumber);
    await fetchWithParams({
      page: pageNumber,
      limit: options.pageSize || 10
    });
  }, [fetchWithParams, options.pageSize]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  useEffect(() => {
    if (data && typeof data === 'object' && 'total' in data) {
      setTotal(data.total);
    }
  }, [data]);

  return {
    items: data.items || fallbackData,
    loading,
    error,
    page,
    total,
    pageSize: options.pageSize || 10,
    fetchPage,
    refetch: () => fetchPage(page)
  };
}

/**
 * Hook for searchable data
 */
export function useSearchableApiData<T>(
  endpoint: string,
  fallbackData: T[],
  options: UseApiDataOptions<T[]> = {}
) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, loading, error, fetchWithParams } = useApiData(
    endpoint,
    fallbackData,
    { immediate: false, ...options }
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch when search changes
  useEffect(() => {
    fetchWithParams({ search: debouncedSearch });
  }, [debouncedSearch, fetchWithParams]);

  return {
    data,
    loading,
    error,
    search,
    setSearch,
    refetch: () => fetchWithParams({ search: debouncedSearch })
  };
}
