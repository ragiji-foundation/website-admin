/**
 * Centralized CRUD Operations Hook
 * 
 * This hook eliminates duplicate CRUD implementations across components.
 * It provides consistent create, read, update, delete operations with
 * proper error handling and notifications.
 */

import { useCallback, useState, useMemo } from 'react';
import { notifications } from '@mantine/notifications';

interface CrudOperationOptions {
  showNotifications?: boolean;
  onSuccess?: (data: unknown, operation: string) => void;
  onError?: (error: Error, operation: string) => void;
  customHeaders?: Record<string, string>;
}

interface CrudOperationsResult<T> {
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string | number, data: Partial<T>) => Promise<T | null>;
  remove: (id: string | number) => Promise<boolean>;
  bulkDelete: (ids: (string | number)[]) => Promise<boolean>;
  reorder: (id: string | number, direction: 'up' | 'down') => Promise<boolean>;
  toggle: (id: string | number, field: string) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for centralized CRUD operations
 * 
 * @param baseEndpoint - Base API endpoint (e.g., '/api/blogs')
 * @param options - Configuration options
 * @returns Object with CRUD operation functions
 */
export function useCrudOperations<T>(
  baseEndpoint: string,
  options: CrudOperationOptions = {}
): CrudOperationsResult<T> {
  const {
    showNotifications = true,
    onSuccess,
    onError,
    customHeaders = {}
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const defaultHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders
  }), [customHeaders]);

  const handleOperation = useCallback(async <R>(
    operation: () => Promise<R>,
    operationName: string,
    successMessage?: string
  ): Promise<R | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      
      if (showNotifications && successMessage) {
        notifications.show({
          title: 'Success',
          message: successMessage,
          color: 'green'
        });
      }

      onSuccess?.(result, operationName);
      return result;
    } catch (operationError) {
      const errorInstance = operationError instanceof Error 
        ? operationError 
        : new Error(String(operationError));
      
      setError(errorInstance);
      
      if (showNotifications) {
        notifications.show({
          title: 'Error',
          message: `Failed to ${operationName}: ${errorInstance.message}`,
          color: 'red'
        });
      }

      onError?.(errorInstance, operationName);
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotifications, onSuccess, onError]);

  const create = useCallback(async (data: Partial<T>): Promise<T | null> => {
    return handleOperation(async () => {
      const response = await fetch(baseEndpoint, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    }, 'create', 'Item created successfully');
  }, [baseEndpoint, defaultHeaders, handleOperation]);

  const update = useCallback(async (id: string | number, data: Partial<T>): Promise<T | null> => {
    return handleOperation(async () => {
      try {
        const url = id.toString().includes('?') ? `${baseEndpoint}/${id}` : `${baseEndpoint}/${id}`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: defaultHeaders,
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Update operation failed:', error);
        throw error;
      }
    }, 'update', 'Item updated successfully');
  }, [baseEndpoint, defaultHeaders, handleOperation]);

  const remove = useCallback(async (id: string | number): Promise<boolean> => {
    const result = await handleOperation(async () => {
      const response = await fetch(`${baseEndpoint}/${id}`, {
        method: 'DELETE',
        headers: defaultHeaders
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Some APIs return the deleted item, others return just success status
      return response.status === 204 ? true : response.json();
    }, 'delete', 'Item deleted successfully');

    return result !== null;
  }, [baseEndpoint, defaultHeaders, handleOperation]);

  const bulkDelete = useCallback(async (ids: (string | number)[]): Promise<boolean> => {
    const result = await handleOperation(async () => {
      const response = await fetch(`${baseEndpoint}?ids=${ids.join(',')}`, {
        method: 'DELETE',
        headers: defaultHeaders
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    }, 'bulk delete', `${ids.length} items deleted successfully`);

    return result !== null;
  }, [baseEndpoint, defaultHeaders, handleOperation]);

  const reorder = useCallback(async (id: string | number, direction: 'up' | 'down'): Promise<boolean> => {
    const result = await handleOperation(async () => {
      const response = await fetch(`${baseEndpoint}/${id}/reorder`, {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify({ direction })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    }, 'reorder', 'Items reordered successfully');

    return result !== null;
  }, [baseEndpoint, defaultHeaders, handleOperation]);

  const toggle = useCallback(async (id: string | number, field: string): Promise<boolean> => {
    const result = await handleOperation(async () => {
      const response = await fetch(`${baseEndpoint}/${id}/toggle`, {
        method: 'PATCH',
        headers: defaultHeaders,
        body: JSON.stringify({ field })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    }, 'toggle', 'Status updated successfully');

    return result !== null;
  }, [baseEndpoint, defaultHeaders, handleOperation]);

  return {
    create,
    update,
    remove,
    bulkDelete,
    reorder,
    toggle,
    loading,
    error
  };
}

/**
 * Hook for form-based CRUD operations
 * Combines useCrudOperations with form state management
 */
export function useFormCrud<T>(
  baseEndpoint: string,
  initialData: T,
  options: CrudOperationOptions & {
    onSubmitSuccess?: (data: T) => void;
    resetOnSuccess?: boolean;
  } = {}
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  const { resetOnSuccess = true, onSubmitSuccess, ...crudOptions } = options;

  const crud = useCrudOperations<T>(baseEndpoint, {
    ...crudOptions,
    onSuccess: (data, operation) => {
      if (operation === 'create' || operation === 'update') {
        onSubmitSuccess?.(data as T);
        if (resetOnSuccess) {
          setFormData(initialData);
          setIsEditing(false);
          setEditingId(null);
        }
      }
      crudOptions.onSuccess?.(data, operation);
    }
  });

  const handleSubmit = useCallback(async () => {
    if (isEditing && editingId) {
      return await crud.update(editingId, formData);
    } else {
      return await crud.create(formData);
    }
  }, [crud, formData, isEditing, editingId]);

  const startEdit = useCallback((id: string | number, data: T) => {
    setEditingId(id);
    setFormData(data);
    setIsEditing(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setFormData(initialData);
    setIsEditing(false);
    setEditingId(null);
  }, [initialData]);

  return {
    ...crud,
    formData,
    setFormData,
    isEditing,
    editingId,
    handleSubmit,
    startEdit,
    cancelEdit
  };
}
