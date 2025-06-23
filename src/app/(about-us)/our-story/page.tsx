'use client';
import { useEffect, useState } from 'react';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEye, IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react';
// Fix the import path to use the correct component
import TipTapEditor from '@/components/TipTapEditor/TipTapEditor';
import { MediaUpload } from '@/components/MediaUpload';
import OurStoryPreview from '@/components/previews/OurStoryPreview';

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
  // State for each content type
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
  const [loadingData, setLoadingData] = useState(true);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoadingData(true);
      const response = await fetch('/api/our-story');

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();

      // Set data for each content type
      if (data.story) {
        // Parse media from JSON if needed
        let mediaArray: MediaItem[] = [];
        try {
          mediaArray = typeof data.story.media === 'string'
            ? JSON.parse(data.story.media)
            : data.story.media;
        } catch (e) {
          console.error('Error parsing media JSON:', e);
        }

        setStoryData({
          id: data.story.id,
          title: data.story.title,
          titleHi: data.story.titleHi,
          content: data.story.content,
          contentHi: data.story.contentHi,
          media: mediaArray,
          isActive: data.story.isActive,
          version: data.story.version,
        });
      }

      if (data.model) {
        setModelData({
          id: data.model.id,
          description: data.model.description,
          descriptionHi: data.model.descriptionHi,
          imageUrl: data.model.imageUrl,
        });
      }

      if (data.visionMission) {
        setVisionMissionData({
          id: data.visionMission.id,
          vision: data.visionMission.vision,
          visionHi: data.visionMission.visionHi,
          mission: data.visionMission.mission,
          missionHi: data.visionMission.missionHi,
          visionIcon: data.visionMission.visionIcon,
          missionIcon: data.visionMission.missionIcon,
        });
      }

      if (data.timeline) {
        setTimelineData(data.timeline.sort((a: any, b: any) => a.order - b.order));
      }

    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to fetch data',
        color: 'red',
      });
    } finally {
      setLoadingData(false);
    }
  };

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

  // Save story data
  const saveStoryData = async () => {
    try {
      setLoadingStory(true);

      const payload = {
        ...storyData,
        modelType: 'OurStory',
      };

      const response = await fetch('/api/our-story', {
        method: storyData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save story data');
      }

      const updatedStory = await response.json();
      setStoryData(prev => ({
        ...prev,
        id: updatedStory.id,
        version: updatedStory.version,
      }));

      notifications.show({
        title: 'Success',
        message: 'Story data saved successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save story data',
        color: 'red',
      });
    } finally {
      setLoadingStory(false);
    }
  };

  // Save model data
  const saveModelData = async () => {
    try {
      setLoadingModel(true);

      const payload = {
        ...modelData,
        modelType: 'OurModel',
      };

      const response = await fetch('/api/our-story', {
        method: modelData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save model data');
      }

      const updatedModel = await response.json();
      setModelData(prev => ({
        ...prev,
        id: updatedModel.id,
      }));

      notifications.show({
        title: 'Success',
        message: 'Model data saved successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save model data',
        color: 'red',
      });
    } finally {
      setLoadingModel(false);
    }
  };

  // Save vision and mission data
  const saveVisionMissionData = async () => {
    try {
      setLoadingVisionMission(true);

      const payload = {
        ...visionMissionData,
        modelType: 'VisionMission',
      };
      const response = await fetch('/api/our-story', {
        method: visionMissionData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save vision and mission data');
      }

      const updatedData = await response.json();
      setVisionMissionData(prev => ({
        ...prev,
        id: updatedData.id,
      }));

      notifications.show({
        title: 'Success',
        message: 'Vision and mission data saved successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save vision and mission data',
        color: 'red',
      });
    } finally {
      setLoadingVisionMission(false);
    }
  };

  // Add new timeline item
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

      const payload = {
        ...newTimelineItem,
        modelType: 'Timeline',
      };

      const response = await fetch('/api/our-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to add timeline item');
      }

      const addedItem = await response.json();
      setTimelineData(prev => [...prev, addedItem].sort((a, b) => a.order - b.order));

      // Reset the new item form
      setNewTimelineItem({
        year: '',
        title: '',
        titleHi: '',
        centers: 0,
        volunteers: 0,
        children: 0,
        order: timelineData.length,
      });

      notifications.show({
        title: 'Success',
        message: 'Timeline item added successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to add timeline item',
        color: 'red',
      });
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Delete timeline item
  const deleteTimelineItem = async (id: string) => {
    try {
      setLoadingTimeline(true);

      const response = await fetch(`/api/our-story?modelType=Timeline&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete timeline item');
      }

      setTimelineData(prev => prev.filter(item => item.id !== id));

      notifications.show({
        title: 'Success',
        message: 'Timeline item deleted successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete timeline item',
        color: 'red',
      });
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Update timeline item order
  const updateTimelineOrder = async (id: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/our-story`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelType: 'Timeline',
          id: id,
          action: 'reorderTimeline',
          order: newOrder,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update timeline order');
      }

      // Refresh timeline data to get the updated order
      fetchAllData();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update timeline order',
        color: 'red',
      });
    }
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Manage Our Story Content</Title>

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
          <Paper p="md" withBorder>
            <LoadingOverlay visible={loadingStory} />
            <Stack gap="md">
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
                <TipTapEditor
                  content={storyData.content}
                  onChange={handleStoryContentChange}
                  minHeight={400}
                />
              </Box>

              <Box>
                <Text fw={500} mb="xs">Content (Hindi)</Text>
                <TipTapEditor
                  content={storyData.contentHi || ''}
                  onChange={(html) => setStoryData(prev => ({ ...prev, contentHi: html }))}
                  minHeight={400}
                />
              </Box>

              <Box>
                <Text fw={500} mb="md">Media Items</Text>
                <Grid>
                  {storyData.media.map((item, index) => (
                    <Grid.Col span={4} key={index}>
                      <Paper p="xs" withBorder>
                        <Stack gap="xs">
                          {item.type === 'image' ? (
                            <Image src={item.url} height={150} alt={item.title || 'Story image'} />
                          ) : (
                            <iframe
                              src={item.url}
                              title={item.title || 'Video content'}
                              height="150"
                              style={{ border: 'none', width: '100%' }}
                            />
                          )}
                          <Group justify="apart">
                            <Text size="sm" fw={500}>{item.title || 'Untitled'}</Text>
                            <ActionIcon color="red" variant="subtle" onClick={() => removeMediaItem(index)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Stack>
                      </Paper>
                    </Grid.Col>
                  ))}

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
          <Paper p="md" withBorder>
            <LoadingOverlay visible={loadingModel} />
            <Stack gap="md">
              <Box>
                <Text fw={500} mb="xs">Description (English)</Text>
                <TipTapEditor
                  content={modelData.description}
                  onChange={handleModelDescriptionChange}
                  minHeight={300}
                />
              </Box>

              <Box>
                <Text fw={500} mb="xs">Description (Hindi)</Text>
                <TipTapEditor
                  content={modelData.descriptionHi || ''}
                  onChange={(html) => setModelData(prev => ({ ...prev, descriptionHi: html }))}
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
          <Paper p="md" withBorder>
            <LoadingOverlay visible={loadingVisionMission} />
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Box>
                    <Text fw={500} mb="xs">Vision Statement (English)</Text>
                    <TipTapEditor
                      content={visionMissionData.vision}
                      onChange={handleVisionChange}
                      minHeight={200}
                    />
                  </Box>
                  <Box mt="md">
                    <Text fw={500} mb="xs">Vision Statement (Hindi)</Text>
                    <TipTapEditor
                      content={visionMissionData.visionHi || ''}
                      onChange={(html) => setVisionMissionData(prev => ({ ...prev, visionHi: html }))}
                      minHeight={200}
                    />
                  </Box>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Box>
                    <Text fw={500} mb="xs">Mission Statement (English)</Text>
                    <TipTapEditor
                      content={visionMissionData.mission}
                      onChange={handleMissionChange}
                      minHeight={200}
                    />
                  </Box>
                  <Box mt="md">
                    <Text fw={500} mb="xs">Mission Statement (Hindi)</Text>
                    <TipTapEditor
                      content={visionMissionData.missionHi || ''}
                      onChange={(html) => setVisionMissionData(prev => ({ ...prev, missionHi: html }))}
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
          <Paper p="md" withBorder>
            <LoadingOverlay visible={loadingTimeline} />
            <Stack gap="md">
              <Title order={3}>Timeline Items</Title>

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
                            onClick={() => updateTimelineOrder(item.id!, item.order - 1)}
                          >
                            Move Up
                          </Button>
                          <Button
                            size="xs"
                            variant="light"
                            disabled={index === timelineData.length - 1}
                            onClick={() => updateTimelineOrder(item.id!, item.order + 1)}
                          >
                            Move Down
                          </Button>
                          <Text size="xs" color="dimmed">Order: {item.order}</Text>
                        </Group>
                        <Button
                          size="xs"
                          color="red"
                          variant="light"
                          onClick={() => deleteTimelineItem(item.id!)}
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
          <Paper p="md" withBorder>
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