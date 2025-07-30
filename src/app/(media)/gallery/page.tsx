"use client";

import { useState, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  Image,
  Text,
  Button,
  Group,
  Modal,
  FileButton,
  Stack,
  Skeleton,
  ActionIcon,
  Tooltip,
  Badge,
  Paper,
  Box,
  TextInput,
  Tabs,
  Progress,
  Alert
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPhoto,
  IconTrash,
  IconCopy,
  IconSearch,
  IconEye,
  IconEdit,
  IconX,
  IconFiles,
  IconCheck,
  IconAlertCircle,
  IconRefresh
} from '@tabler/icons-react';
import { uploadFile, getTransformedUrl, deleteFile } from '@/services/uploadService';
import { GalleryImageForm } from '@/components/Gallery/GalleryImageForm';
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

interface GalleryItem {
  id: string;
  title: string;
  titleHi?: string;
  imageUrl: string;
  description?: string;
  descriptionHi?: string;
  category?: string;
  createdAt: string;
}

export default function GalleryPage() {
  // 🚀 Centralized data management
  const { 
    data: rawData = [], 
    loading: isLoading, 
    refetch: fetchGalleryItems 
  } = useApiData<any>('/api/gallery', [], {
    showNotifications: true
  });

  // Transform data locally
  const items: GalleryItem[] = useMemo(() => {
    console.log('Gallery data received:', rawData); // Debug log
    
    // Handle API response structure: { success: true, data: Array, message: string }
    const data = Array.isArray(rawData) ? rawData : rawData?.data || [];
    console.log('Extracted data array:', data); // Debug log
    
    const transformedData = Array.isArray(data) ? data.map((item: any) => ({
      id: String(item.id),
      title: item.title || 'Untitled',
      titleHi: item.titleHi,
      imageUrl: item.imageUrl || item.url || '',
      description: item.description || '',
      descriptionHi: item.descriptionHi,
      category: item.category || 'general',
      createdAt: item.createdAt || new Date().toISOString()
    })) : [];
    
    console.log('Transformed gallery items:', transformedData); // Debug log
    return transformedData;
  }, [rawData]);

  const { create, remove, update } = useCrudOperations<GalleryItem>('/api/gallery', {
    showNotifications: true,
    onSuccess: () => {
      console.log('CRUD operation completed, refreshing gallery...'); // Debug log
      fetchGalleryItems();
    }
  });

  // 🎯 UI state management
  const [uploadModal, uploadHandlers] = useDisclosure(false);
  const [editModal, editHandlers] = useDisclosure(false);
  const [previewModal, previewHandlers] = useDisclosure(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  
  // 📦 Bulk upload state
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // 📤 Upload handler
  const handleUpload = async (file: File | null) => {
    if (!file) return;
    
    setUploading(true);
    try {
      console.log('Starting upload for:', file.name); // Debug log
      
      const result = await uploadFile(file, {
        folder: 'gallery',
        resourceType: 'image',
        showNotifications: false
      });
      
      console.log('Upload result:', result); // Debug log
      
      const galleryItem = {
        title: file.name.split('.')[0],
        imageUrl: result.url,
        description: `Uploaded on ${new Date().toLocaleDateString()}`,
        category: 'upload'
      };
      
      console.log('Creating gallery item:', galleryItem); // Debug log
      
      await create(galleryItem);
      
      uploadHandlers.close();
      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green'
      });
    } catch (error) {
      console.error('Upload error:', error); // Debug log
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Upload failed',
        color: 'red'
      });
    } finally {
      setUploading(false);
    }
  };

  // 📦 Bulk upload handler
  const handleBulkUpload = async (files: File[] | null) => {
    if (!files || files.length === 0) return;
    
    setBulkUploading(true);
    setUploadProgress({});
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 25 }));
          
          const result = await uploadFile(file, {
            folder: 'gallery',
            resourceType: 'image',
            showNotifications: false
          });
          
          setUploadProgress(prev => ({ ...prev, [file.name]: 75 }));
          
          await create({
            title: file.name.split('.')[0],
            imageUrl: result.url,
            description: `Bulk uploaded on ${new Date().toLocaleDateString()}`,
            category: 'bulk-upload'
          });
          
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          successCount++;
          
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 })); // -1 indicates error
          errorCount++;
        }
      }
      
      setBulkFiles([]);
      uploadHandlers.close();
      
      notifications.show({
        title: 'Bulk Upload Complete',
        message: `✅ ${successCount} uploaded successfully${errorCount > 0 ? `, ❌ ${errorCount} failed` : ''}`,
        color: successCount > 0 ? 'green' : 'red'
      });
      
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Bulk upload failed',
        color: 'red'
      });
    } finally {
      setBulkUploading(false);
      setUploadProgress({});
    }
  };

  // 🗑️ Delete handler
  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this image?")) {
      try {
        // Find the item to get the image URL before deleting from database
        const itemToDelete = items.find(item => item.id === id);
        
        // Delete from database first
        await remove(id);
        
        // Then delete from MinIO storage if we have the image URL
        if (itemToDelete?.imageUrl) {
          try {
            await deleteFile(itemToDelete.imageUrl, { showNotifications: false });
            console.log('Image successfully deleted from MinIO:', itemToDelete.imageUrl);
          } catch (storageError) {
            console.warn('Failed to delete image from storage (database record was removed):', storageError);
            // Don't show error notification since database deletion succeeded
            // The image might already be deleted or the URL might be invalid
          }
        }
        
        notifications.show({
          title: 'Success',
          message: 'Image deleted successfully',
          color: 'green'
        });
        
      } catch (error) {
        console.error('Error deleting image:', error);
        notifications.show({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to delete image',
          color: 'red'
        });
      }
    }
  };

  // ✏️ Edit handlers
  const handleEdit = (item: GalleryItem) => {
    setEditItem(item);
    editHandlers.open();
  };

  const handleEditSubmit = async (formData: Partial<GalleryItem>) => {
    if (!editItem) return;
    await update(editItem.id, formData);
    setEditItem(null);
    editHandlers.close();
  };

  // 👁️ Preview handler
  const handlePreview = (item: GalleryItem) => {
    setSelectedItem(item);
    previewHandlers.open();
  };

  // 📋 Copy URL handler
  const copyToClipboard = (url: string) => {
    // Convert relative URLs to absolute URLs
    let fullUrl = url;
    
    if (url.startsWith('/api/image-proxy/')) {
      // Convert proxy URL to full URL
      fullUrl = `${window.location.origin}${url}`;
    } else if (url.startsWith('/')) {
      // Convert any relative URL to absolute
      fullUrl = `${window.location.origin}${url}`;
    }
    // If it's already a full URL (starts with http), use as is
    
    navigator.clipboard.writeText(fullUrl);
    notifications.show({
      title: 'Success',
      message: `URL copied: ${fullUrl}`,
      color: 'blue'
    });
  };

  // 🔍 Search filter
  console.log('Current items state:', items, 'Type:', typeof items, 'Is Array:', Array.isArray(items)); // Debug log
  
  const filteredItems = Array.isArray(items) && searchTerm
    ? items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : Array.isArray(items) ? items : [];

  return (
    <Container size="xl" py="xl">
      {/* 📊 Header */}
      <Paper shadow="xs" p="md" mb="lg" withBorder>
        <Group justify="space-between" wrap="nowrap">
          <Text size="xl" fw={700} variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
            Gallery
          </Text>
          <Group>
            <ActionIcon
              variant="light"
              color="gray"
              onClick={() => {
                console.log('Manual refresh triggered'); // Debug log
                fetchGalleryItems();
              }}
              title="Refresh Gallery"
            >
              <IconRefresh size={16} />
            </ActionIcon>
            <TextInput
              placeholder="Search images..."
              leftSection={<IconSearch size={16} />}
              rightSection={
                searchTerm && (
                  <ActionIcon size="xs" variant="subtle" onClick={() => setSearchTerm('')}>
                    <IconX size={12} />
                  </ActionIcon>
                )
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              w={200}
            />
            <Button
              onClick={uploadHandlers.open}
              leftSection={<IconPhoto size={16} />}
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
            >
              Upload
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* 🖼️ Gallery Grid */}
      {isLoading ? (
        <Grid>
          {Array.from({ length: 6 }, (_, i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Card withBorder>
                <Card.Section>
                  <Skeleton height={200} />
                </Card.Section>
                <Skeleton height={20} mt="md" width="70%" />
                <Skeleton height={15} mt="sm" width="40%" />
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      ) : filteredItems.length === 0 ? (
        <Paper p="xl" withBorder style={{ textAlign: 'center', borderStyle: 'dashed' }}>
          <IconPhoto size={40} style={{ opacity: 0.5, marginBottom: 10 }} />
          <Text size="lg" fw={500} mb="xs">No images found</Text>
          <Text size="sm" c="dimmed" mb="md">
            {searchTerm ? 'No results match your search.' : 'Your gallery is empty.'}
          </Text>
          {!searchTerm && (
            <Button variant="light" onClick={uploadHandlers.open} leftSection={<IconPhoto size={16} />}>
              Upload your first image
            </Button>
          )}
        </Paper>
      ) : (
        <Grid>
          {filteredItems.map((item) => (
            <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                withBorder
                style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                className="gallery-card"
              >
                <Card.Section 
                  style={{ position: 'relative', cursor: 'pointer' }} 
                  onClick={() => handlePreview(item)}
                >
                  <Image
                    src={getTransformedUrl(item.imageUrl, 400, 300)}
                    height={200}
                    alt={item.title}
                    fallbackSrc="/placeholder.svg"
                    fit="cover"
                  />
                  <div 
                    className="hover-overlay"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    }}
                  >
                    <IconEye color="white" size={24} />
                  </div>
                </Card.Section>

                <Stack gap="xs" mt="md" style={{ flex: 1 }}>
                  <Text fw={500} lineClamp={1}>{item.title}</Text>
                  <Text size="xs" c="dimmed">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                  {item.category && (
                    <Badge size="sm" variant="light">{item.category}</Badge>
                  )}
                </Stack>

                <Group mt="auto" gap="xs">
                  <Tooltip label="Preview">
                    <ActionIcon variant="light" color="blue" onClick={() => handlePreview(item)}>
                      <IconEye size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Copy URL">
                    <ActionIcon variant="light" color="blue" onClick={() => copyToClipboard(item.imageUrl)}>
                      <IconCopy size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Edit">
                    <ActionIcon variant="light" color="blue" onClick={() => handleEdit(item)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete">
                    <ActionIcon variant="light" color="red" onClick={() => handleDelete(item.id)} ml="auto">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* 📤 Upload Modal */}
      <Modal opened={uploadModal} onClose={uploadHandlers.close} title="Upload Images" size="lg">
        <Tabs defaultValue="single">
          <Tabs.List>
            <Tabs.Tab value="single" leftSection={<IconPhoto size={16} />}>
              Single Upload
            </Tabs.Tab>
            <Tabs.Tab value="bulk" leftSection={<IconFiles size={16} />}>
              Bulk Upload
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="single" pt="md">
            <Stack>
              <Box
                style={{
                  border: '2px dashed #e0e0e0',
                  borderRadius: '8px',
                  padding: '30px',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb'
                }}
              >
                <IconPhoto size={40} style={{ opacity: 0.5, marginBottom: 15 }} />
                <Text size="sm" mb="md">Select an image to upload</Text>
                <FileButton onChange={handleUpload} accept="image/*">
                  {(props) => (
                    <Button {...props} loading={uploading} variant="light">
                      Choose Image
                    </Button>
                  )}
                </FileButton>
              </Box>
              <Text size="xs" c="dimmed">Supported: PNG, JPG, WebP, GIF (max 5MB)</Text>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="bulk" pt="md">
            <Stack>
              <Box
                style={{
                  border: '2px dashed #e0e0e0',
                  borderRadius: '8px',
                  padding: '30px',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb'
                }}
              >
                <IconFiles size={40} style={{ opacity: 0.5, marginBottom: 15 }} />
                <Text size="sm" mb="md">Select multiple images to upload</Text>
                <FileButton 
                  onChange={setBulkFiles} 
                  accept="image/*" 
                  multiple
                >
                  {(props) => (
                    <Button {...props} variant="light" disabled={bulkUploading}>
                      Choose Images
                    </Button>
                  )}
                </FileButton>
              </Box>
              
              {bulkFiles.length > 0 && (
                <Stack>
                  <Alert 
                    icon={<IconFiles size={16} />} 
                    title="Files Selected" 
                    color="blue"
                  >
                    {bulkFiles.length} image(s) selected for upload
                  </Alert>
                  
                  {Object.keys(uploadProgress).length > 0 && (
                    <Stack gap="xs">
                      {bulkFiles.map((file) => {
                        const progress = uploadProgress[file.name];
                        const isError = progress === -1;
                        const isComplete = progress === 100;
                        
                        return (
                          <Group key={file.name} gap="xs">
                            <Text size="xs" style={{ flex: 1 }} truncate>
                              {file.name}
                            </Text>
                            {isError ? (
                              <IconAlertCircle size={16} color="red" />
                            ) : isComplete ? (
                              <IconCheck size={16} color="green" />
                            ) : (
                              <Progress 
                                value={progress || 0} 
                                size="sm" 
                                style={{ width: 100 }}
                              />
                            )}
                          </Group>
                        );
                      })}
                    </Stack>
                  )}
                  
                  <Button 
                    onClick={() => handleBulkUpload(bulkFiles)}
                    loading={bulkUploading}
                    disabled={bulkFiles.length === 0}
                    fullWidth
                  >
                    Upload All Images
                  </Button>
                </Stack>
              )}
              
              <Text size="xs" c="dimmed">
                Supported: PNG, JPG, WebP, GIF (max 5MB each)
              </Text>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Modal>

      {/* ✏️ Edit Modal */}
      <Modal opened={editModal} onClose={editHandlers.close} title="Edit Image" size="lg">
        {editItem && (
          <GalleryImageForm
            initialValues={editItem}
            onSubmit={handleEditSubmit}
            loading={false}
          />
        )}
      </Modal>

      {/* 👁️ Preview Modal */}
      <Modal opened={previewModal} onClose={previewHandlers.close} title="Preview" size="xl">
        {selectedItem && (
          <Stack>
            <Box style={{ textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <Image
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                fit="contain"
                style={{ maxHeight: '60vh' }}
                fallbackSrc="/placeholder.svg"
              />
            </Box>
            <Stack gap="xs">
              <Text fw={500} size="lg">{selectedItem.title}</Text>
              {selectedItem.description && (
                <Text size="sm" c="dimmed">{selectedItem.description}</Text>
              )}
              <Text size="xs" c="dimmed">
                {new Date(selectedItem.createdAt).toLocaleDateString()}
              </Text>
              <Group mt="md">
                <Button
                  variant="light"
                  leftSection={<IconCopy size={16} />}
                  onClick={() => copyToClipboard(selectedItem.imageUrl)}
                >
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => {
                    handleDelete(selectedItem.id);
                    previewHandlers.close();
                  }}
                >
                  Delete
                </Button>
              </Group>
            </Stack>
          </Stack>
        )}
      </Modal>

      {/* 🎨 Hover Effects */}
      <style jsx global>{`
        .gallery-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .gallery-card:hover .hover-overlay {
          opacity: 1;
        }
      `}</style>
    </Container>
  );
}

