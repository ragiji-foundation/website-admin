import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { GalleryItem } from '@/types/gallery';

export function useGallery() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchImages = async () => {
    try {
      const url = new URL('/api/gallery', window.location.origin);
      if (selectedCategory) {
        url.searchParams.append('category', selectedCategory);
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch images',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [selectedCategory]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete image');

      notifications.show({
        title: 'Success',
        message: 'Image deleted successfully',
        color: 'green',
      });

      fetchImages();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete image',
        color: 'red',
      });
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to add image');

      notifications.show({
        title: 'Success',
        message: 'Image added successfully',
        color: 'green',
      });

      fetchImages();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to add image',
        color: 'red',
      });
    }
  };

  const filteredImages = images.filter(image => {
    const matchesCategory = !selectedCategory || image.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return {
    images,
    loading,
    selectedCategory,
    searchQuery,
    filteredImages,
    handleDelete,
    handleSearch: setSearchQuery,
    handleCategoryChange: setSelectedCategory,
    handleSubmit,
  };
}
