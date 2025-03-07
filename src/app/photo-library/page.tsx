'use client';

import { useState } from 'react';
import { Container, Grid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { GalleryHeader } from '@/components/Gallery/GalleryHeader';
import { FilterBar } from '@/components/Gallery/FilterBar';
import { ImageCard } from '@/components/Gallery/ImageCard';
import { UploadDrawer } from '@/components/Gallery/UploadDrawer';
import { ImageViewer } from '@/components/Gallery/ImageViewer';
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
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  // Integrate with the Cloudinary-powered UploadDrawer
  const handleFormSubmit = async (formData: any) => {
    await handleSubmit(formData);
    drawerHandlers.close();
  };

  return (
    <Container size="xl" maw={1000} px={0} mx="auto">
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
              onClick={() => {
                setSelectedImage(item);
                viewerHandlers.open();
              }}
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
      />
    </Container>
  );
}