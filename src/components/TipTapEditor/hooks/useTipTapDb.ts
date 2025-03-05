import { useState } from 'react';
import { notifications } from '@mantine/notifications';

interface ContentData {
  id?: string;
  content: string;
  modelName: string; // e.g., 'Page', 'Blog', etc.
  fieldName: string; // e.g., 'body', 'description', etc.
  recordId?: string | number; // ID of the related record
}

export const useTipTapDb = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveContent = async ({
    content,
    modelName,
    fieldName,
    recordId,
    id,
  }: ContentData): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      // Create the request body
      const body = {
        content,
        modelName,
        fieldName,
        recordId,
        id,
      };

      // Send data to your API endpoint
      const response = await fetch('/api/tiptap-content', {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save content');
      }

      const data = await response.json();

      notifications.show({
        title: 'Success',
        message: 'Content saved successfully',
        color: 'green',
      });

      return data.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);

      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async (id: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tiptap-content?id=${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch content');
      }

      const data = await response.json();
      return data.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    saveContent,
    fetchContent,
    loading,
    error,
  };
};

export default useTipTapDb;
