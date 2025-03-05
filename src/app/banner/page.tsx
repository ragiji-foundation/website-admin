'use client';
import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Card,
  Text,
  Button,
  Group,
  Image,
  TextInput,
  Textarea,
  Select,
  Grid,
  Stack,
  ActionIcon,
  Badge,
  Tabs,
  LoadingOverlay,
  Paper,
  Tooltip,
  Alert,
  Overlay,
  em,
  rem,
  Box,
  Divider
} from '@mantine/core';
import { Dropzone, DropzoneProps, FileWithPath } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import {
  IconUpload,
  IconEdit,
  IconTrash,
  IconPhoto,
  IconDownload,
  IconX,
  IconCheck,
  IconEye,
  IconAlertCircle
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { Banner, BannerType } from '@/types/banner';
import { modals } from '@mantine/modals';
import classes from './BannerManagement.module.css';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { FallbackBanners } from './components/FallbackBanners';

interface FormValues {
  type: BannerType;
  title: string;
  description: string;
  backgroundImage: File | null;
  previewUrl?: string;
}

const bannerTypes = [
  { value: 'blog', label: 'Blog' },
  { value: 'about', label: 'About' },
  { value: 'initiatives', label: 'Initiatives' },
  { value: 'successstories', label: 'Success Stories' },
  { value: 'home', label: 'Home' },
  { value: 'media', label: 'Media' },
  { value: 'electronicmedia', label: 'Electronic Media' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'newscoverage', label: 'News Coverage' },
  { value: 'ourstory', label: 'Our Story' },
  { value: 'need', label: 'The Need' },
  { value: 'centers', label: 'Centers' },
  { value: 'contactus', label: 'Contact Us' },
  { value: 'careers', label: 'Careers' },
  { value: 'awards', label: 'Awards' }
];

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('bannerList');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      type: '' as BannerType,
      title: '',
      description: '',
      backgroundImage: null,
      previewUrl: '',
    },
    validate: {
      type: (value) => (!value ? 'Banner type is required' : null),
      title: (value) => (!value ? 'Title is required' : null),
    },
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await fetch('/api/banner');
      if (!response.ok) throw new Error('Failed to fetch banners');
      const data = await response.json();
      setBanners(data.sort((a: Banner, b: Banner) => a.type.localeCompare(b.type)));
    } catch (error) {
      console.error('Error fetching banners:', error);
      setErrorMessage('Failed to load banners. Please try again later.');
      notifications.show({
        title: 'Error',
        message: 'Failed to load banners',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageDrop = (files: FileWithPath[]) => {
    if (files.length === 0) return;

    const file = files[0];
    form.setFieldValue('backgroundImage', file);

    // Create a preview URL
    const imageUrl = URL.createObjectURL(file);
    setPreviewUrl(imageUrl);
    setDragOver(false);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const result = await uploadToCloudinary(file, {
        folder: 'banners',
        resourceType: 'image',
      });

      return result.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setSubmitting(true);
      setErrorMessage(null);

      // Validate that we have an image for new banners
      if (!editingId && !values.backgroundImage) {
        notifications.show({
          title: 'Validation Error',
          message: 'Please upload a background image',
          color: 'red',
        });
        setSubmitting(false);
        return;
      }

      let imageUrl = '';

      // If we have a new image, upload it to Cloudinary
      if (values.backgroundImage) {
        imageUrl = await handleImageUpload(values.backgroundImage);
      }

      // Prepare the data for API call
      const bannerData = {
        type: values.type,
        title: values.title,
        description: values.description,
        backgroundImage: imageUrl || undefined,
      };

      // API call
      const url = editingId ? `/api/banner/${editingId}` : '/api/banner';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));

        // Check if this is a conflict error (status 409) - Banner type already exists
        if (response.status === 409) {
          throw new Error(`${errorData.error} Select the existing banner to edit it instead.`);
        }

        throw new Error(errorData.message || 'Failed to save banner');
      }

      notifications.show({
        title: 'Success',
        message: `Banner ${editingId ? 'updated' : 'created'} successfully`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      // Reset form and state
      form.reset();
      setEditingId(null);
      setPreviewUrl(null);
      setActiveTab('bannerList');
      fetchBanners();
    } catch (error) {
      console.error('Error submitting banner:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save banner');
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save banner',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    modals.openConfirmModal({
      title: 'Delete Banner',
      children: (
        <Text size="sm">
          Are you sure you want to delete this banner? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/banner/${id}`, {
            method: 'DELETE',
          });

          if (!response.ok) throw new Error('Failed to delete banner');

          notifications.show({
            title: 'Success',
            message: 'Banner deleted successfully',
            color: 'green',
            icon: <IconCheck size={16} />,
          });

          fetchBanners();
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete banner',
            color: 'red',
            icon: <IconX size={16} />,
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    form.setValues({
      type: banner.type as BannerType,
      title: banner.title,
      description: banner.description || '',
      backgroundImage: null,
    });
    setPreviewUrl(banner.backgroundImage);
    setActiveTab('addBanner');
  };

  const handlePreview = (banner: Banner) => {
    modals.open({
      title: `${banner.title} (${banner.type})`,
      size: 'lg',
      children: (
        <Stack gap="md">
          <Box className={classes.previewContainer}>
            <Image
              src={banner.backgroundImage}
              alt={banner.title}
              height={400}
              fit="cover"
              fallbackSrc="/placeholder-banner.jpg"
              className={classes.previewImage}
            />
            <Overlay className={classes.previewOverlay} color="#000" opacity={0.6} />
            <div className={classes.previewContent}>
              <Title order={2} c="white">{banner.title}</Title>
              {banner.description && <Text c="white" size="lg">{banner.description}</Text>}
            </div>
          </Box>
          <Group justify="center">
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={() => {
                modals.closeAll();
                handleEdit(banner);
              }}
            >
              Edit Banner
            </Button>
          </Group>
        </Stack>
      ),
    });
  };

  const handleClearForm = () => {
    form.reset();
    setEditingId(null);
    setPreviewUrl(null);
  };

  const renderBannerForm = () => (
    <Paper p="md" shadow="xs" radius="md" withBorder className={classes.formCard}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Select
            label="Banner Type"
            placeholder="Select a banner type"
            data={bannerTypes}
            required
            searchable
            nothingFoundMessage="Type not found"
            {...form.getInputProps('type')}
          />
          <TextInput
            label="Title"
            placeholder="Enter banner title"
            required
            {...form.getInputProps('title')}
          />
          <Textarea
            label="Description"
            placeholder="Enter banner description (optional)"
            minRows={3}
            autosize
            {...form.getInputProps('description')}
          />

          <Stack gap="xs">
            <Text size="sm" fw={500}>Background Image</Text>
            <Dropzone
              onDrop={handleImageDrop}
              onDragEnter={() => setDragOver(true)}
              onDragLeave={() => setDragOver(false)}
              maxSize={3 * 1024 * 1024}
              accept={['image/jpeg', 'image/png', 'image/webp']}
              className={dragOver ? classes.dropzoneActive : classes.dropzone}
            >
              <Group justify="center" gap="xl" style={{ pointerEvents: 'none', height: '100%' }}>
                <Dropzone.Accept>
                  <IconUpload size={50} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX size={50} stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto size={50} stroke={1.5} />
                </Dropzone.Idle>

                <Stack gap={0} align="center">
                  <Text size="xl" inline>
                    Drag images here or click to select files
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Image should be less than 3MB
                  </Text>
                </Stack>
              </Group>
            </Dropzone>

            {previewUrl && (
              <Box mt="md" className={classes.previewWrapper}>
                <Image
                  src={previewUrl}
                  height={200}
                  fit="cover"
                  alt="Banner preview"
                  style={{ borderRadius: 8 }}
                />
                <ActionIcon
                  className={classes.removePreview}
                  variant="filled"
                  color="red"
                  radius="xl"
                  size="sm"
                  onClick={() => {
                    form.setFieldValue('backgroundImage', null);
                    setPreviewUrl(null);
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            )}
          </Stack>

          {errorMessage && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" withCloseButton onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleClearForm} disabled={submitting}>
              Clear
            </Button>
            <Button type="submit" loading={submitting}>
              {editingId ? 'Update Banner' : 'Create Banner'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );

  const renderBannerList = () => {
    if (loading) {
      return (
        <Box pos="relative" h={400}>
          <LoadingOverlay visible={true} />
        </Box>
      );
    }

    if (banners.length === 0) {
      return (
        <Paper p="xl" withBorder radius="md" className={classes.emptyState}>
          <Stack align="center" gap="md">
            <IconPhoto size={48} stroke={1.5} />
            <Title order={3}>No Banners Yet</Title>
            <Text c="dimmed" ta="center">
              Start by creating your first banner to enhance your website&apos;s appearance.
            </Text>
            <Button
              onClick={() => setActiveTab('addBanner')}
              leftSection={<IconUpload size={16} />}
            >
              Add Your First Banner
            </Button>
          </Stack>
        </Paper>
      );
    }

    // Get list of banner types that already have banners
    const existingBannerTypes = banners.map(banner => banner.type);

    return (
      <Stack gap="xl">
        <Text c="dimmed" ta="center" mb="xl">
          Note: Only one banner can exist for each banner type. To change a banner, select it and edit it.
        </Text>

        {/* Show the fallback banners section for missing types */}
        <FallbackBanners
          existingBannerTypes={existingBannerTypes}
          onCreateBanner={(type) => {
            form.setValues({
              type,
              title: '',
              description: '',
              backgroundImage: null,
            });
            setActiveTab('addBanner');
          }}
        />

        {/* Existing banner cards */}
        {banners.sort((a, b) => a.type.localeCompare(b.type)).map((banner) => (
          <Card key={banner.id} withBorder shadow="sm" padding="md" radius="md" className={classes.bannerCard}>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Box className={classes.bannerImageContainer}>
                  <Image
                    src={banner.backgroundImage}
                    height={200}
                    alt={banner.title}
                    fallbackSrc="/placeholder-banner.jpg"
                    fit="cover"
                    className={classes.bannerImage}
                  />
                </Box>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack>
                  <Group justify="space-between" align="flex-start">
                    <div>
                      <Badge variant="light" color="blue" mb="xs">
                        {banner.type}
                      </Badge>
                      <Title order={4}>{banner.title}</Title>
                    </div>
                    <Group>
                      <Tooltip label="Preview">
                        <ActionIcon
                          variant="light"
                          onClick={() => handlePreview(banner)}
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Edit">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEdit(banner)}
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  {banner.description && (
                    <Text size="sm" c="dimmed">
                      {banner.description}
                    </Text>
                  )}
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        ))}
      </Stack>
    );
  };

  return (
    <Container size="xl" py="xl" className={classes.container}>
      <Group justify="space-between" mb="lg">
        <Title order={1}>Banner Management</Title>
        {activeTab === 'bannerList' && (
          <Button
            onClick={() => setActiveTab('addBanner')}
            leftSection={<IconUpload size={16} />}
          >
            Add New Banner
          </Button>
        )}
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab} mb="lg">
        <Tabs.List>
          <Tabs.Tab value="bannerList">All Banners</Tabs.Tab>
          <Tabs.Tab value="addBanner">{editingId ? 'Edit Banner' : 'Add Banner'}</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Box pos="relative">
        <LoadingOverlay visible={loading && activeTab === 'addBanner'} />
        {activeTab === 'bannerList' ? renderBannerList() : renderBannerForm()}
      </Box>
    </Container>
  );
}
