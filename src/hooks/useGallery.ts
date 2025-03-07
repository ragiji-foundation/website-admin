import { useState, useEffect, useCallback } from 'react';
import { notifications } from '@mantine/notifications';

export interface GalleryItem {
  id: number | string; // Support both number and string IDs
  title: string;
  imageUrl?: string;
  url?: string; // Support both formats
  category?: string;
  description?: string;
  createdAt: string;
}

export function useGallery() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      if (!response.ok) throw new Error('Failed to fetch images');

      const data = await response.json();

      // Normalize the data to ensure consistent field names
      const normalizedImages = data.map((item: any) => ({
        id: item.id,
        title: item.title || 'Untitled',
        imageUrl: item.imageUrl || item.url || '',
        url: item.url || item.imageUrl || '',
        category: item.category || 'general',
        description: item.description || '',
        createdAt: item.createdAt || new Date().toISOString()
      }));

      setImages(normalizedImages);
    } catch (error) {
      console.error('Gallery fetch error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch gallery images',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const filteredImages = images.filter(
    (image) =>
      (selectedCategory === null || image.category === selectedCategory) &&
      (searchQuery === '' ||
        image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (image.description &&
          image.description.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleDelete = async (id: number | string) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete image');

      setImages((prev) => prev.filter((img) => img.id !== id));

      notifications.show({
        title: 'Success',
        message: 'Image deleted successfully',
        color: 'green'
      });
    } catch (error) {
      console.error('Gallery delete error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to delete image',
        color: 'red'
      });
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add image');

      await fetchImages();

      notifications.show({
        title: 'Success',
        message: 'Image added successfully',
        color: 'green'
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add image',
        color: 'red'
      });
    }
  };

  return {
    images,
    loading,
    selectedCategory,
    searchQuery,
    filteredImages,
    handleDelete,
    handleSearch,
    handleCategoryChange,
    handleSubmit,
    refreshImages: fetchImages,
  };
}
