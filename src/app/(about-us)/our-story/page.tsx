'use client';
import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Tabs,
  Button,
  Group,
  Stack,
  Box,
  Text,
  Paper,
  Image,
  Grid,
  Switch,
  LoadingOverlay,
  ActionIcon,
  Tooltip,
  TextInput,
  NumberInput,
  ThemeIcon,
  Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

import { IconEye, IconDeviceFloppy, IconPlus, IconTrash, IconBook, IconBulb, IconTargetArrow, IconTimeline } from '@tabler/icons-react';
import TiptapEditor from '@/components/TiptapEditor';
import { MediaUpload } from '@/components/MediaUpload';
import OurStoryPreview from '@/components/previews/OurStoryPreview';
import { uploadFile } from '@/utils/centralized';
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

// Define interfaces for each content type
interface MediaItem {
  type: 'image' | 'video';
  url: string;
  title?: string;
}

interface OurStoryData {
  id?: string;
  title: string;
  titleHi?: string;
  content: string;
  contentHi?: string;
  media: MediaItem[];
  isActive: boolean;
  version?: number;
}

interface OurModelData {
  id?: string;
  description: string;
  descriptionHi?: string;
  imageUrl: string;
}

interface VisionMissionData {
  id?: string;
  vision: string;
  visionHi?: string;
  mission: string;
  missionHi?: string;
  visionIcon: string;
  missionIcon: string;
}

interface TimelineItem {
  id?: string;
  year: string;
  title: string;
  titleHi?: string;
  centers: number;
  volunteers: number;
  children: number;
  order: number;
}

// Main component
export default function OurStoryPage() {
  // ✅ MIGRATED: Using centralized hooks instead of manual state management
  const { data: apiData, loading: _dataLoading, refetch: fetchAllData } = useApiData<{
    story?: OurStoryData;
    model?: OurModelData;
    visionMission?: VisionMissionData;
    timeline?: TimelineItem[];
  }>('/api/our-story', {}, { showNotifications: true });

  // ✅ MIGRATED: Using centralized CRUD operations
  const { create, update, remove } = useCrudOperations('/api/our-story', {
    showNotifications: true,
    onSuccess: () => fetchAllData()
  });

  // Local state for form editing
  const [storyData, setStoryData] = useState<OurStoryData>({
    title: '',
    titleHi: '',
    content: '',
    contentHi: '',
    media: [],
    isActive: true,
  });

  const [modelData, setModelData] = useState<OurModelData>({
    description: '',
    descriptionHi: '',
    imageUrl: '',
  });

  const [visionMissionData, setVisionMissionData] = useState<VisionMissionData>({
    vision: '',
    visionHi: '',
    mission: '',
    missionHi: '',
    visionIcon: '',
    missionIcon: '',
  });

  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [newTimelineItem, setNewTimelineItem] = useState<TimelineItem>({
    year: '',
    title: '',
    titleHi: '',
    centers: 0,
    volunteers: 0,
    children: 0,
    order: 0,
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string | null>('story');
  const [loadingStory, setLoadingStory] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);
  const [loadingVisionMission, setLoadingVisionMission] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Update local state when API data changes
  useEffect(() => {
    if (apiData?.story) {
      let mediaArray: MediaItem[] = [];
      try {
        mediaArray = typeof apiData.story.media === 'string'
          ? JSON.parse(apiData.story.media)
          : apiData.story.media || [];
      } catch (e) {
        console.error('Error parsing media JSON:', e);
      }

      setStoryData({
        id: apiData.story.id,
        title: apiData.story.title,
        titleHi: apiData.story.titleHi,
        content: apiData.story.content,
        contentHi: apiData.story.contentHi,
        media: mediaArray,
        isActive: apiData.story.isActive,
        version: apiData.story.version,
      });
    }

    if (apiData?.model) {
      setModelData({
        id: apiData.model.id,
        description: apiData.model.description,
        descriptionHi: apiData.model.descriptionHi,
        imageUrl: apiData.model.imageUrl,
      });
    }

    if (apiData?.visionMission) {
      setVisionMissionData({
        id: apiData.visionMission.id,
        vision: apiData.visionMission.vision,
        visionHi: apiData.visionMission.visionHi,
        mission: apiData.visionMission.mission,
        missionHi: apiData.visionMission.missionHi,
        visionIcon: apiData.visionMission.visionIcon,
        missionIcon: apiData.visionMission.missionIcon,
      });
    }

    if (apiData?.timeline) {
      setTimelineData(apiData.timeline.sort((a: TimelineItem, b: TimelineItem) => a.order - b.order));
    }
  }, [apiData]);

  // Handle story content changes
  const handleStoryContentChange = (html: string) => {
    setStoryData(prev => ({
      ...prev,
      content: html,
    }));
  };

  // Handle model description changes
  const handleModelDescriptionChange = (html: string) => {
    setModelData(prev => ({
      ...prev,
      description: html,
    }));
  };

  // Handle vision and mission changes
  const handleVisionChange = (html: string) => {
    setVisionMissionData(prev => ({
      ...prev,
      vision: html,
    }));
  };

  const handleMissionChange = (html: string) => {
    setVisionMissionData(prev => ({
      ...prev,
      mission: html,
    }));
  };

  // Add media item to story
  const addMediaItem = (mediaItem: MediaItem) => {
    setStoryData(prev => ({
      ...prev,
      media: [...prev.media, mediaItem],
    }));
  };

  // Remove media item from story
  const removeMediaItem = (index: number) => {
    setStoryData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  // ✅ MIGRATED: Save functions using centralized operations
  const saveStoryData = async () => {
    try {
      setLoadingStory(true);
      // Ensure we're passing the modelType with the id for the update operation
      const payload = { ...storyData, modelType: 'OurStory' };
      
      if (storyData.id) {
        console.log('Updating story with ID:', storyData.id);
        const result = await update(storyData.id, payload) as OurStoryData;
        // Update local state with the latest version from server
        if (result) {
          setStoryData(prev => ({ 
            ...prev, 
            version: result.version,
            media: Array.isArray(result.media) ? result.media : 
                  typeof result.media === 'string' ? JSON.parse(result.media) : []
          }));
        }
      } else {
        const result = await create(payload) as OurStoryData;
        if (result) {
          setStoryData(prev => ({ 
            ...prev, 
            id: result.id, 
            version: result.version,
            media: Array.isArray(result.media) ? result.media : 
                  typeof result.media === 'string' ? JSON.parse(result.media) : []
          }));
        }
      }
    } catch (error) {
      console.error('Error saving story data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save story data. Please try again.',
        color: 'red',
      });
    } finally {
      setLoadingStory(false);
    }
  };

  const saveModelData = async () => {
    try {
      setLoadingModel(true);
      const payload = { ...modelData, modelType: 'OurModel' };
      
      if (modelData.id) {
        await update(modelData.id, payload);
      } else {
        const result = await create(payload) as any;
        setModelData(prev => ({ ...prev, id: result.id }));
      }
    } catch (error) {
      console.error('Error saving model data:', error);
    } finally {
      setLoadingModel(false);
    }
  };

  const saveVisionMissionData = async () => {
    try {
      setLoadingVisionMission(true);
      const payload = { ...visionMissionData, modelType: 'VisionMission' };
      
      if (visionMissionData.id) {
        await update(visionMissionData.id, payload);
      } else {
        const result = await create(payload) as any;
        setVisionMissionData(prev => ({ ...prev, id: result.id }));
      }
    } catch (error) {
      console.error('Error saving vision/mission data:', error);
    } finally {
      setLoadingVisionMission(false);
    }
  };

  // ✅ MIGRATED: Timeline operations using centralized CRUD
  const addTimelineItem = async () => {
    if (!newTimelineItem.year || !newTimelineItem.title) {
      notifications.show({
        title: 'Error',
        message: 'Year and title are required for timeline items',
        color: 'red',
      });
      return;
    }

    try {
      setLoadingTimeline(true);
      const payload = { ...newTimelineItem, modelType: 'Timeline' };
      await create(payload);
      
      // Reset form
      setNewTimelineItem({
        year: '',
        title: '',
        titleHi: '',
        centers: 0,
        volunteers: 0,
        children: 0,
        order: 0,
      });
    } catch (error) {
      console.error('Error adding timeline item:', error);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const updateTimelineItem = async (id: string, data: Partial<TimelineItem>) => {
    try {
      setLoadingTimeline(true);
      await update(id, { ...data, modelType: 'Timeline' });
    } catch (error) {
      console.error('Error updating timeline item:', error);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const removeTimelineItem = async (id: string) => {
    try {
      setLoadingTimeline(true);
      await remove(id);
    } catch (error) {
      console.error('Error removing timeline item:', error);
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Handle media upload for story
  const handleMediaUpload = async (file: File, index?: number) => {
    try {
      // ✅ FIXED: Use centralized upload function with correct signature
      const uploadResult = await uploadFile(file, { folder: 'our-story' });
      
      const mediaItem: MediaItem = {
        type: file.type.startsWith('image/') ? 'image' : 'video',
        url: uploadResult.url,
        title: '',
      };

      setStoryData(prev => {
        const newMedia = [...prev.media];
        if (typeof index === 'number') {
          newMedia[index] = mediaItem;
        } else {
          newMedia.push(mediaItem);
        }
        return { ...prev, media: newMedia };
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to upload media',
        color: 'red',
      });
    }
  };

  const removeMedia = (index: number) => {
    setStoryData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const updateMediaTitle = (index: number, value: string) => {
    setStoryData(prev => ({
      ...prev,
      media: prev.media.map((item, i) => 
        i === index ? { ...item, title: value } : item
      ),
    }));
  };

  return (
    <Container size="lg" py={{ base: 'md', md: 'xl' }}>
      <Title order={1} mb="xl" ta="center">
        Manage Our Story Content
      </Title>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List mb="xl">
          <Tabs.Tab value="story">Story</Tabs.Tab>
          <Tabs.Tab value="model">The Model</Tabs.Tab>
          <Tabs.Tab value="vision-mission">Vision & Mission</Tabs.Tab>
          <Tabs.Tab value="timeline">Timeline</Tabs.Tab>
          <Tabs.Tab value="preview">Preview</Tabs.Tab>
        </Tabs.List>

        {/* Story Tab */}
        <Tabs.Panel value="story">
          <Paper p={{ base: 'md', md: 'xl' }} withBorder>
            <LoadingOverlay visible={loadingStory} />
            <Stack gap="md">
              <Group justify="center" mb="md">
                <ThemeIcon size={40} radius="xl" color="blue">
                  <IconBook />
                </ThemeIcon>
                <Title order={2} mb={0}>Story</Title>
              </Group>

              <TextInput
                label="Title (English)"
                required
                value={storyData.title}
                onChange={(e) => setStoryData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Our Story Title"
              />

              <TextInput
                label="Title (Hindi)"
                value={storyData.titleHi || ''}
                onChange={(e) => setStoryData(prev => ({ ...prev, titleHi: e.target.value }))}
                placeholder="हमारी कहानी का शीर्षक"
                style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
              />

              <Box>
                <Text fw={500} mb="xs">Content (English)</Text>
                <TiptapEditor
                  content={storyData.content}
                  onChange={handleStoryContentChange}
                  minHeight={400}
                />
              </Box>

              <Box>
                <Text fw={500} mb="xs">Content (Hindi)</Text>
                <TiptapEditor
                  content={storyData.contentHi || ''}
                  onChange={(html: string) => setStoryData(prev => ({ ...prev, contentHi: html }))}
                  minHeight={400}
                />
              </Box>

              <Box>
                <Text fw={500} mb="md">Media Items</Text>
                <Grid>
          {Array.isArray(storyData.media) ? storyData.media.map((item, index) => (
            <Grid.Col span={4} key={index}>
              <Paper p="xs" withBorder>
                <Stack gap="xs">
                  {item.type === 'image' && item.url ? (
                    <Image src={item.url} height={150} alt={item.title || 'Story image'} />
                  ) : item.type === 'video' && item.url ? (
                    <iframe
                      src={item.url}
                      title={item.title || 'Video content'}
                      height="150"
                      style={{ border: 'none', width: '100%' }}
                    />
                  ) : null}
                  <Group justify="apart">
                    <Text size="sm" fw={500}>{item.title || 'Untitled'}</Text>
                    <ActionIcon color="red" variant="subtle" onClick={() => removeMediaItem(index)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Stack>
              </Paper>
            </Grid.Col>
          )) : null}

                  <Grid.Col span={4}>
                    <Paper p="md" withBorder style={{ height: '100%' }}>
                      <Stack align="center" justify="center" style={{ height: '100%' }}>
                        <Text size="sm" c="dimmed" mb="md">Add Media Item</Text>

                        <Group>
                          <MediaUpload
                            label=""
                            mediaType="image"
                            folder="our-story"
                            value=""
                            onChange={(url) => addMediaItem({
                              type: 'image',
                              url,
                              title: 'Story Image',
                            })}
                            buttonLabel="Add Image"
                          />

                          <Tooltip label="Add video URL (YouTube, Vimeo, etc)">
                            <Button
                              onClick={() => {
                                const url = prompt('Enter video embed URL (YouTube, Vimeo, etc)');
                                if (url) {
                                  addMediaItem({
                                    type: 'video',
                                    url,
                                    title: 'Story Video',
                                  });
                                }
                              }}
                              variant="light"
                            >
                              Add Video
                            </Button>
                          </Tooltip>
                        </Group>
                      </Stack>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Box>

              <Group justify="apart" mt="lg">
                <Switch
                  label="Active"
                  checked={storyData.isActive}
                  onChange={(e) => setStoryData(prev => ({ ...prev, isActive: e.currentTarget.checked }))}
                />

                <Button
                  onClick={saveStoryData}
                  leftSection={<IconDeviceFloppy size={16} />}
                  loading={loadingStory}
                >
                  Save Story
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Tabs.Panel>

        {/* The Model Tab */}
        <Tabs.Panel value="model">
          <Paper p={{ base: 'md', md: 'xl' }} withBorder>
            <LoadingOverlay visible={loadingModel} />
            <Stack gap="md">
              <Group justify="center" mb="sm">
                <ThemeIcon size={36} radius="xl" color="orange">
                  <IconTargetArrow />
                </ThemeIcon>
                <Title order={3} mb={0}>The Model</Title>
              </Group>

              <Box>
                <Text fw={500} mb="xs">Description (English)</Text>
                <TiptapEditor
                  content={modelData.description}
                  onChange={handleModelDescriptionChange}
                  minHeight={300}
                />
              </Box>

              <Box>
                <Text fw={500} mb="xs">Description (Hindi)</Text>
                <TiptapEditor
                  content={modelData.descriptionHi || ''}
                  onChange={(html: string) => setModelData(prev => ({ ...prev, descriptionHi: html }))}
                  minHeight={300}
                />
              </Box>

              <Box>
                <Text fw={500} mb="xs">Model Image</Text>
                <MediaUpload
                  label=""
                  mediaType="image"
                  folder="our-story/model"
                  value={modelData.imageUrl}
                  onChange={(url) => setModelData(prev => ({ ...prev, imageUrl: url }))}
                />
              </Box>

              <Group justify="right" mt="lg">
                <Button
                  onClick={saveModelData}
                  leftSection={<IconDeviceFloppy size={16} />}
                  loading={loadingModel}
                >
                  Save Model
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Tabs.Panel>

        {/* Vision & Mission Tab */}
        <Tabs.Panel value="vision-mission">
          <Paper p={{ base: 'md', md: 'xl' }} withBorder>
            <LoadingOverlay visible={loadingVisionMission} />
            <Stack gap="md">
              <Group justify="center" mb="sm">
                <ThemeIcon size={36} radius="xl" color="orange">
                  <IconBulb />
                </ThemeIcon>
                <Title order={3} mb={0}>Vision & Mission</Title>
              </Group>

              <Grid>
                <Grid.Col span={6}>
                  <Box>
                    <Text fw={500} mb="xs">Vision Statement (English)</Text>
                    <TiptapEditor
                      content={visionMissionData.vision}
                      onChange={handleVisionChange}
                      minHeight={200}
                    />
                  </Box>
                  <Box mt="md">
                    <Text fw={500} mb="xs">Vision Statement (Hindi)</Text>
                    <TiptapEditor
                      content={visionMissionData.visionHi || ''}
                      onChange={(html: string) => setVisionMissionData(prev => ({ ...prev, visionHi: html }))}
                      minHeight={200}
                    />
                  </Box>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Box>
                    <Text fw={500} mb="xs">Mission Statement (English)</Text>
                    <TiptapEditor
                      content={visionMissionData.mission}
                      onChange={handleMissionChange}
                      minHeight={200}
                    />
                  </Box>
                  <Box mt="md">
                    <Text fw={500} mb="xs">Mission Statement (Hindi)</Text>
                    <TiptapEditor
                      content={visionMissionData.missionHi || ''}
                      onChange={(html: string) => setVisionMissionData(prev => ({ ...prev, missionHi: html }))}
                      minHeight={200}
                    />
                  </Box>
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={6}>
                  <Box>
                    <Text fw={500} mb="xs">Vision Icon</Text>
                    <MediaUpload
                      label=""
                      mediaType="image"
                      folder="our-story/icons"
                      value={visionMissionData.visionIcon}
                      onChange={(url) => setVisionMissionData(prev => ({ ...prev, visionIcon: url }))}
                    />
                  </Box>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Box>
                    <Text fw={500} mb="xs">Mission Icon</Text>
                    <MediaUpload
                      label=""
                      mediaType="image"
                      folder="our-story/icons"
                      value={visionMissionData.missionIcon}
                      onChange={(url) => setVisionMissionData(prev => ({ ...prev, missionIcon: url }))}
                    />
                  </Box>
                </Grid.Col>
              </Grid>

              <Group justify="right" mt="lg">
                <Button
                  onClick={saveVisionMissionData}
                  leftSection={<IconDeviceFloppy size={16} />}
                  loading={loadingVisionMission}
                >
                  Save Vision & Mission
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Tabs.Panel>

        {/* Timeline Tab */}
        <Tabs.Panel value="timeline">
          <Paper p={{ base: 'md', md: 'xl' }} withBorder>
            <LoadingOverlay visible={loadingTimeline} />
            <Stack gap="md">
              <Group justify="center" mb="sm">
                <ThemeIcon size={40} radius="xl" color="blue">
                  <IconTimeline />
                </ThemeIcon>
                <Title order={3} mb={0}>Timeline Items</Title>
              </Group>

              {timelineData.map((item, index) => (
                <Paper key={item.id} p="md" withBorder>
                  <Grid gutter="md">
                    <Grid.Col span={2}>
                      <TextInput
                        label="Year"
                        value={item.year}
                        readOnly
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Stack gap="xs">
                        <TextInput
                          label="Title"
                          value={item.title}
                          readOnly
                        />
                        {item.titleHi && (
                          <Text size="sm" c="dimmed" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
                            {item.titleHi}
                          </Text>
                        )}
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <NumberInput
                        label="Centers"
                        value={item.centers}
                        readOnly
                      />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <NumberInput
                        label="Volunteers"
                        value={item.volunteers}
                        readOnly
                      />
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <NumberInput
                        label="Children"
                        value={item.children}
                        readOnly
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <Group justify="apart">
                        <Group>
                          <Button
                            size="xs"
                            variant="light"
                            disabled={index === 0}
                            onClick={() => updateTimelineItem(item.id!, { order: item.order - 1 })}
                          >
                            Move Up
                          </Button>
                          <Button
                            size="xs"
                            variant="light"
                            disabled={index === timelineData.length - 1}
                            onClick={() => updateTimelineItem(item.id!, { order: item.order + 1 })}
                          >
                            Move Down
                          </Button>
                          <Text size="xs" color="dimmed">Order: {item.order}</Text>
                        </Group>
                        <Button
                          size="xs"
                          color="red"
                          variant="light"
                          onClick={() => removeTimelineItem(item.id!)}
                        >
                          Delete
                        </Button>
                      </Group>
                    </Grid.Col>
                  </Grid>
                </Paper>
              ))}

              <Paper p="md" withBorder mt="xl">
                <Title order={4} mb="md">Add New Timeline Item</Title>
                <Grid gutter="md">
                  <Grid.Col span={2}>
                    <TextInput
                      label="Year"
                      required
                      value={newTimelineItem.year}
                      onChange={(e) => setNewTimelineItem(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="e.g. 2020"
                    />
                  </Grid.Col>                    <Grid.Col span={4}>
                      <TextInput
                        label="Title"
                        required
                        value={newTimelineItem.title}
                        onChange={(e) => setNewTimelineItem(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Milestone title"
                      />
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <TextInput
                        label="Title (Hindi)"
                        value={newTimelineItem.titleHi || ''}
                        onChange={(e) => setNewTimelineItem(prev => ({ ...prev, titleHi: e.target.value }))}
                        placeholder="मील का पत्थर शीर्षक"
                        style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}
                      />
                    </Grid.Col>
                  <Grid.Col span={2}>
                    <NumberInput
                      label="Centers"
                      value={newTimelineItem.centers}
                      // Fix: Ensure we're setting a number value
                      onChange={(val) => setNewTimelineItem(prev => ({
                        ...prev,
                        centers: typeof val === 'number' ? val : 0
                      }))}
                      min={0}
                    />
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <NumberInput
                      label="Volunteers"
                      value={newTimelineItem.volunteers}
                      // Fix: Ensure we're setting a number value
                      onChange={(val) => setNewTimelineItem(prev => ({
                        ...prev,
                        volunteers: typeof val === 'number' ? val : 0
                      }))}
                      min={0}
                    />
                  </Grid.Col>
                  <Grid.Col span={2}>
                    <NumberInput
                      label="Children"
                      value={newTimelineItem.children}
                      // Fix: Ensure we're setting a number value
                      onChange={(val) => setNewTimelineItem(prev => ({
                        ...prev,
                        children: typeof val === 'number' ? val : 0
                      }))}
                      min={0}
                    />
                  </Grid.Col>
                </Grid>

                <Group justify="right" mt="md">
                  <Button
                    onClick={addTimelineItem}
                    leftSection={<IconPlus size={16} />}
                    disabled={!newTimelineItem.year || !newTimelineItem.title}
                    loading={loadingTimeline}
                  >
                    Add Timeline Item
                  </Button>
                </Group>
              </Paper>
            </Stack>
          </Paper>
        </Tabs.Panel>

        {/* Preview Tab */}
        <Tabs.Panel value="preview">
          <Paper p={{ base: 'md', md: 'xl' }} withBorder>
            <Box mb="md">
              <Group justify="right">
                <Button
                  leftSection={<IconEye size={16} />}
                  variant="light"
                  onClick={fetchAllData}
                >
                  Refresh Preview
                </Button>
              </Group>
            </Box>

            <Divider my="md" />
            <OurStoryPreview
              story={storyData}
              model={modelData}
              visionMission={visionMissionData}
              timeline={timelineData}
            />
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}