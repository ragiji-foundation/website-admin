'use client';

import { useState } from 'react';
import { Container, Grid, Button, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { GalleryHeader } from '@/components/Gallery/GalleryHeader';
import { FilterBar } from '@/components/Gallery/FilterBar';
import { ImageCard } from '@/components/Gallery/ImageCard';
import { UploadDrawer } from '@/components/Gallery/UploadDrawer';
import { ImageViewer } from '@/components/Gallery/ImageViewer';
import { EditImageModal } from '@/components/Gallery/EditImageModal';
import { GalleryItem } from '@/types/gallery';
import { useGallery } from '@/hooks/useGallery';

export default function GalleryAdmin() {
  const {
    images,
    loading,
    selectedCategory,
    searchQuery,
    filteredImages,
    handleDelete,
    handleSearch,
    handleCategoryChange,
    handleSubmit,
    refreshImages,
  } = useGallery();

  const [drawerOpened, drawerHandlers] = useDisclosure(false);
  const [viewerOpened, viewerHandlers] = useDisclosure(false);
  const [editModalOpened, editModalHandlers] = useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryItem | null>(null);
  // Hindi support
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Integrate with the MinIO-powered UploadDrawer
  const handleFormSubmit = async (formData: {
    title: string;
    titleHi?: string;
    description?: string;
    descriptionHi?: string;
    category: string;
    file: File;
  }) => {
    await handleSubmit(formData);
    drawerHandlers.close();
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingImage(item);
    editModalHandlers.open();
  };

  const handleUpdateImage = (_updatedImage: GalleryItem) => {
    // Refresh the gallery to get updated data
    refreshImages();
    editModalHandlers.close();
  };

  return (
    <Container size="xl" maw={1000} px={0} mx="auto">
      <Group justify="flex-end" mb="md">
        <Button.Group>
          <Button
            variant={language === 'en' ? 'filled' : 'outline'}
            onClick={() => setLanguage('en')}
            size="xs"
          >
            EN
          </Button>
          <Button
            variant={language === 'hi' ? 'filled' : 'outline'}
            onClick={() => setLanguage('hi')}
            size="xs"
          >
            HI
          </Button>
        </Button.Group>
      </Group>
      <GalleryHeader onAddNew={drawerHandlers.open} />
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <Grid gutter="xs">
        {filteredImages.map((item) => (
          <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <ImageCard
              item={item}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onClick={() => {
                setSelectedImage(item);
                viewerHandlers.open();
              }}
              language={language}
            />
          </Grid.Col>
        ))}
      </Grid>

      <UploadDrawer
        opened={drawerOpened}
        onClose={drawerHandlers.close}
        onSubmit={handleFormSubmit}
      />

      <ImageViewer
        opened={viewerOpened}
        onClose={viewerHandlers.close}
        image={selectedImage}
        language={language}
      />

      <EditImageModal
        opened={editModalOpened}
        onClose={editModalHandlers.close}
        image={editingImage}
        onUpdate={handleUpdateImage}
        language={language}
      />
    </Container>
  );
}