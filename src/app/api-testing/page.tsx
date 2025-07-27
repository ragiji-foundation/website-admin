'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Card,
  Group,
  Button,
  TextInput,
  Stack,
  Text,
  Badge,
  Accordion,
  JsonInput,
  Code,
  Loader,
  Alert,
  Grid,
  Paper,
  Tabs,
  ScrollArea,
  ActionIcon,
  CopyButton,
  Tooltip
} from '@mantine/core';
import {
  IconApi,
  IconPlayerPlay,
  IconRefresh,
  IconCheck,
  IconX,
  IconCopy,
  IconDatabase,
  IconTestPipe,
  IconBug
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  category: string;
  requiresAuth?: boolean;
  parameters?: string[];
  samplePayload?: object;
}

interface ApiResponse {
  status: number;
  data: unknown;
  headers: Record<string, string>;
  time: number;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Auth & Profile
  { path: '/api/login', method: 'POST', description: 'Admin login', category: 'Auth', samplePayload: { username: 'admin', password: 'password' } },
  { path: '/api/logout', method: 'POST', description: 'Admin logout', category: 'Auth' },
  { path: '/api/profile', method: 'GET', description: 'Get user profile', category: 'Auth', requiresAuth: true },
  { path: '/api/profile', method: 'PUT', description: 'Update user profile', category: 'Auth', requiresAuth: true, samplePayload: { name: 'Admin User', image: 'https://example.com/image.jpg' } },

  // Dashboard & Analytics
  { path: '/api/dashboard', method: 'GET', description: 'Get dashboard statistics', category: 'Dashboard' },
  { path: '/api/analytics/event', method: 'POST', description: 'Track analytics event', category: 'Analytics', samplePayload: { event: 'page_view', page: '/home' } },
  { path: '/api/analytics/track', method: 'POST', description: 'Track user action', category: 'Analytics', samplePayload: { action: 'click', element: 'button' } },

  // Content Management
  { path: '/api/blogs', method: 'GET', description: 'Get all blogs', category: 'Blogs' },
  { path: '/api/blogs', method: 'POST', description: 'Create new blog', category: 'Blogs', requiresAuth: true, samplePayload: { title: 'Sample Blog', content: 'Blog content', slug: 'sample-blog' } },
  { path: '/api/blogs/{slug}', method: 'GET', description: 'Get blog by slug', category: 'Blogs', parameters: ['slug'] },
  { path: '/api/blogs/{slug}', method: 'PUT', description: 'Update blog', category: 'Blogs', requiresAuth: true, parameters: ['slug'] },
  { path: '/api/blogs/{slug}', method: 'DELETE', description: 'Delete blog', category: 'Blogs', requiresAuth: true, parameters: ['slug'] },

  // News & Media
  { path: '/api/news-coverage', method: 'GET', description: 'Get news articles', category: 'News' },
  { path: '/api/news-coverage', method: 'POST', description: 'Create news article', category: 'News', requiresAuth: true, samplePayload: { title: 'News Title', source: 'News Source', date: new Date().toISOString() } },
  { path: '/api/news-coverage/{id}', method: 'GET', description: 'Get news article by ID', category: 'News', parameters: ['id'] },
  { path: '/api/news-coverage/{id}', method: 'PUT', description: 'Update news article', category: 'News', requiresAuth: true, parameters: ['id'] },
  { path: '/api/news-coverage/{id}', method: 'DELETE', description: 'Delete news article', category: 'News', requiresAuth: true, parameters: ['id'] },

  // Success Stories
  { path: '/api/success-stories', method: 'GET', description: 'Get success stories', category: 'Success Stories' },
  { path: '/api/success-stories', method: 'POST', description: 'Create success story', category: 'Success Stories', requiresAuth: true, samplePayload: { title: 'Success Story', content: 'Story content', personName: 'John Doe', location: 'Mumbai' } },
  { path: '/api/success-stories/{id}', method: 'GET', description: 'Get success story by ID', category: 'Success Stories', parameters: ['id'] },
  { path: '/api/success-stories/{id}', method: 'PUT', description: 'Update success story', category: 'Success Stories', requiresAuth: true, parameters: ['id'] },
  { path: '/api/success-stories/{id}', method: 'DELETE', description: 'Delete success story', category: 'Success Stories', requiresAuth: true, parameters: ['id'] },

  // Careers
  { path: '/api/careers', method: 'GET', description: 'Get career listings', category: 'Careers' },
  { path: '/api/careers', method: 'POST', description: 'Create career listing', category: 'Careers', requiresAuth: true, samplePayload: { title: 'Software Developer', description: 'Job description', location: 'Mumbai', type: 'Full-time' } },
  { path: '/api/careers/{id}', method: 'GET', description: 'Get career by ID', category: 'Careers', parameters: ['id'] },
  { path: '/api/careers/{id}', method: 'PUT', description: 'Update career listing', category: 'Careers', requiresAuth: true, parameters: ['id'] },
  { path: '/api/careers/{id}', method: 'DELETE', description: 'Delete career listing', category: 'Careers', requiresAuth: true, parameters: ['id'] },

  // Centers
  { path: '/api/centers', method: 'GET', description: 'Get all centers', category: 'Centers' },
  { path: '/api/centers', method: 'POST', description: 'Create center', category: 'Centers', requiresAuth: true, samplePayload: { name: 'Mumbai Center', location: 'Mumbai', description: 'Center description' } },
  { path: '/api/centers/{id}', method: 'GET', description: 'Get center by ID', category: 'Centers', parameters: ['id'] },
  { path: '/api/centers/{id}', method: 'PUT', description: 'Update center', category: 'Centers', requiresAuth: true, parameters: ['id'] },
  { path: '/api/centers/{id}', method: 'DELETE', description: 'Delete center', category: 'Centers', requiresAuth: true, parameters: ['id'] },

  // Testimonials
  { path: '/api/testimonials', method: 'GET', description: 'Get testimonials', category: 'Testimonials' },
  { path: '/api/testimonials', method: 'POST', description: 'Create testimonial', category: 'Testimonials', requiresAuth: true, samplePayload: { name: 'John Doe', message: 'Great organization!', rating: 5 } },
  { path: '/api/testimonials/{id}', method: 'GET', description: 'Get testimonial by ID', category: 'Testimonials', parameters: ['id'] },
  { path: '/api/testimonials/{id}', method: 'PUT', description: 'Update testimonial', category: 'Testimonials', requiresAuth: true, parameters: ['id'] },
  { path: '/api/testimonials/{id}', method: 'DELETE', description: 'Delete testimonial', category: 'Testimonials', requiresAuth: true, parameters: ['id'] },

  // Gallery & Media
  { path: '/api/gallery', method: 'GET', description: 'Get gallery items', category: 'Gallery' },
  { path: '/api/gallery', method: 'POST', description: 'Create gallery item', category: 'Gallery', requiresAuth: true, samplePayload: { title: 'Gallery Image', imageUrl: 'https://example.com/image.jpg', category: 'events' } },
  { path: '/api/gallery/{id}', method: 'GET', description: 'Get gallery item by ID', category: 'Gallery', parameters: ['id'] },
  { path: '/api/gallery/{id}', method: 'PUT', description: 'Update gallery item', category: 'Gallery', requiresAuth: true, parameters: ['id'] },
  { path: '/api/gallery/{id}', method: 'DELETE', description: 'Delete gallery item', category: 'Gallery', requiresAuth: true, parameters: ['id'] },

  // Features
  { path: '/api/features', method: 'GET', description: 'Get features', category: 'Features' },
  { path: '/api/features', method: 'POST', description: 'Create feature', category: 'Features', requiresAuth: true, samplePayload: { title: 'New Feature', description: 'Feature description', icon: 'IconStar' } },
  { path: '/api/features/{id}', method: 'GET', description: 'Get feature by ID', category: 'Features', parameters: ['id'] },
  { path: '/api/features/{id}', method: 'PUT', description: 'Update feature', category: 'Features', requiresAuth: true, parameters: ['id'] },
  { path: '/api/features/{id}', method: 'DELETE', description: 'Delete feature', category: 'Features', requiresAuth: true, parameters: ['id'] },

  // Settings & Configuration
  { path: '/api/settings', method: 'GET', description: 'Get application settings', category: 'Settings', requiresAuth: true },
  { path: '/api/settings', method: 'PUT', description: 'Update application settings', category: 'Settings', requiresAuth: true, samplePayload: { siteName: 'Ragiji Foundation', contactEmail: 'contact@ragiji.com' } },
  { path: '/api/banner', method: 'GET', description: 'Get banner configuration', category: 'Settings' },
  { path: '/api/banner', method: 'POST', description: 'Update banner', category: 'Settings', requiresAuth: true },

  // Upload & Files
  { path: '/api/upload', method: 'POST', description: 'Upload file', category: 'Upload', requiresAuth: true },
  { path: '/api/upload', method: 'DELETE', description: 'Delete file', category: 'Upload', requiresAuth: true },

  // Utilities
  { path: '/api/search', method: 'GET', description: 'Search content', category: 'Utilities' },
  { path: '/api/contact', method: 'POST', description: 'Submit contact form', category: 'Utilities', samplePayload: { name: 'John Doe', email: 'john@example.com', message: 'Hello!' } },
  { path: '/api/enquiries', method: 'GET', description: 'Get enquiries', category: 'Utilities', requiresAuth: true },

  // Database Testing
  { path: '/api/db-test', method: 'GET', description: 'Test database connection', category: 'Database', requiresAuth: true },
];

export default function ApiTestingPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [requestBody, setRequestBody] = useState('{}');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiStatuses, setApiStatuses] = useState<Record<string, 'checking' | 'online' | 'offline'>>({});

  const categories = Array.from(new Set(API_ENDPOINTS.map(endpoint => endpoint.category)));

  // Function to check API status
  const checkApiStatus = async (endpoint: ApiEndpoint) => {
    const key = `${endpoint.method}:${endpoint.path}`;
    setApiStatuses(prev => ({ ...prev, [key]: 'checking' }));

    try {
      const response = await fetch(endpoint.path.replace(/\{.*?\}/g, '1'), {
        method: endpoint.method === 'DELETE' ? 'GET' : endpoint.method,
        headers: { 'Content-Type': 'application/json' },
      });
      
      setApiStatuses(prev => ({ 
        ...prev, 
        [key]: response.status < 500 ? 'online' : 'offline' 
      }));
    } catch {
      setApiStatuses(prev => ({ ...prev, [key]: 'offline' }));
    }
  };

  // Function to execute API request
  const executeRequest = async () => {
    if (!selectedEndpoint) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      let url = selectedEndpoint.path;
      
      // Replace parameters in URL
      if (selectedEndpoint.parameters) {
        selectedEndpoint.parameters.forEach(param => {
          const value = parameters[param] || '1';
          url = url.replace(`{${param}}`, value);
        });
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && requestBody) {
        options.body = requestBody;
      }

      const response = await fetch(url, options);
      const data = await response.json();
      const endTime = Date.now();

      const apiResponse: ApiResponse = {
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries()),
        time: endTime - startTime,
      };

      setResponse(apiResponse);

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: `API call completed in ${apiResponse.time}ms`,
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } else {
        notifications.show({
          title: 'API Error',
          message: `Request failed with status ${response.status}`,
          color: 'red',
          icon: <IconX size={16} />,
        });
      }
    } catch (error) {
      console.error('API call error:', error);
      const endTime = Date.now();
      
      setResponse({
        status: 0,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        headers: {},
        time: endTime - startTime,
      });

      notifications.show({
        title: 'Request Failed',
        message: 'Failed to execute API request',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load sample payload when endpoint changes
  useEffect(() => {
    if (selectedEndpoint?.samplePayload) {
      setRequestBody(JSON.stringify(selectedEndpoint.samplePayload, null, 2));
    } else {
      setRequestBody('{}');
    }
    
    // Reset parameters
    setParameters({});
    setResponse(null);
  }, [selectedEndpoint]);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'blue';
      case 'POST': return 'green';
      case 'PUT': return 'yellow';
      case 'DELETE': return 'red';
      case 'PATCH': return 'violet';
      default: return 'gray';
    }
  };

  const getStatusColor = (status: 'checking' | 'online' | 'offline') => {
    switch (status) {
      case 'checking': return 'yellow';
      case 'online': return 'green';
      case 'offline': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Group>
            <IconApi size={32} />
            <Title order={1}>API Testing Dashboard</Title>
          </Group>
          <Group>
            <Badge color="blue" variant="light">
              {API_ENDPOINTS.length} APIs Available
            </Badge>
          </Group>
        </Group>

        <Tabs defaultValue="testing">
          <Tabs.List>
            <Tabs.Tab value="testing" leftSection={<IconTestPipe size={16} />}>
              API Testing
            </Tabs.Tab>
            <Tabs.Tab value="overview" leftSection={<IconDatabase size={16} />}>
              API Overview
            </Tabs.Tab>
            <Tabs.Tab value="monitoring" leftSection={<IconBug size={16} />}>
              Status Monitoring
            </Tabs.Tab>
          </Tabs.List>

          {/* API Testing Tab */}
          <Tabs.Panel value="testing" pt="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Card withBorder>
                  <Stack gap="md">
                    <Title order={3}>Select API Endpoint</Title>
                    
                    <Accordion>
                      {categories.map(category => (
                        <Accordion.Item key={category} value={category}>
                          <Accordion.Control>
                            <Group justify="space-between">
                              <Text fw={500}>{category}</Text>
                              <Badge size="sm" variant="light">
                                {API_ENDPOINTS.filter(e => e.category === category).length}
                              </Badge>
                            </Group>
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="xs">
                              {API_ENDPOINTS.filter(e => e.category === category).map((endpoint, index) => (
                                <Paper
                                  key={index}
                                  p="sm"
                                  withBorder
                                  style={{
                                    cursor: 'pointer',
                                    backgroundColor: selectedEndpoint === endpoint ? 'var(--mantine-color-blue-light)' : undefined
                                  }}
                                  onClick={() => setSelectedEndpoint(endpoint)}
                                >
                                  <Group justify="space-between" gap="xs">
                                    <Group gap="xs">
                                      <Badge size="xs" color={getMethodColor(endpoint.method)}>
                                        {endpoint.method}
                                      </Badge>
                                      {endpoint.requiresAuth && (
                                        <Badge size="xs" color="orange" variant="light">
                                          Auth
                                        </Badge>
                                      )}
                                    </Group>
                                  </Group>
                                  <Text size="sm" fw={500} mt={4}>
                                    {endpoint.path}
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    {endpoint.description}
                                  </Text>
                                </Paper>
                              ))}
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="md">
                  {/* Request Configuration */}
                  <Card withBorder>
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Title order={3}>Request Configuration</Title>
                        {selectedEndpoint && (
                          <Group gap="xs">
                            <Badge color={getMethodColor(selectedEndpoint.method)}>
                              {selectedEndpoint.method}
                            </Badge>
                            {selectedEndpoint.requiresAuth && (
                              <Badge color="orange" variant="light">
                                Requires Auth
                              </Badge>
                            )}
                          </Group>
                        )}
                      </Group>

                      {selectedEndpoint ? (
                        <>
                          <TextInput
                            label="Endpoint URL"
                            value={selectedEndpoint.path}
                            readOnly
                            rightSection={
                              <CopyButton value={selectedEndpoint.path}>
                                {({ copied, copy }) => (
                                  <Tooltip label={copied ? 'Copied' : 'Copy'}>
                                    <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                                      <IconCopy size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </CopyButton>
                            }
                          />

                          <Text size="sm" c="dimmed">
                            {selectedEndpoint.description}
                          </Text>

                          {/* Parameters */}
                          {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                            <Stack gap="xs">
                              <Text size="sm" fw={500}>URL Parameters</Text>
                              {selectedEndpoint.parameters.map(param => (
                                <TextInput
                                  key={param}
                                  label={param}
                                  placeholder={`Enter ${param}`}
                                  value={parameters[param] || ''}
                                  onChange={(e) => setParameters(prev => ({ ...prev, [param]: e.target.value }))}
                                />
                              ))}
                            </Stack>
                          )}

                          {/* Request Body */}
                          {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                            <JsonInput
                              label="Request Body"
                              placeholder="Enter JSON payload"
                              value={requestBody}
                              onChange={setRequestBody}
                              minRows={6}
                              validationError="Invalid JSON"
                              formatOnBlur
                              autosize
                            />
                          )}

                          <Button
                            leftSection={loading ? <Loader size={16} /> : <IconPlayerPlay size={16} />}
                            onClick={executeRequest}
                            loading={loading}
                            disabled={!selectedEndpoint}
                          >
                            Execute Request
                          </Button>
                        </>
                      ) : (
                        <Alert color="blue" icon={<IconApi size={16} />}>
                          Select an API endpoint from the left panel to configure and test it.
                        </Alert>
                      )}
                    </Stack>
                  </Card>

                  {/* Response */}
                  {response && (
                    <Card withBorder>
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Title order={3}>Response</Title>
                          <Group gap="xs">
                            <Badge color={response.status < 300 ? 'green' : response.status < 500 ? 'yellow' : 'red'}>
                              {response.status}
                            </Badge>
                            <Badge variant="light">
                              {response.time}ms
                            </Badge>
                          </Group>
                        </Group>

                        <Tabs defaultValue="body">
                          <Tabs.List>
                            <Tabs.Tab value="body">Response Body</Tabs.Tab>
                            <Tabs.Tab value="headers">Headers</Tabs.Tab>
                          </Tabs.List>

                          <Tabs.Panel value="body" pt="md">
                            <ScrollArea.Autosize mah={400}>
                              <Code block>
                                {JSON.stringify(response.data, null, 2)}
                              </Code>
                            </ScrollArea.Autosize>
                          </Tabs.Panel>

                          <Tabs.Panel value="headers" pt="md">
                            <ScrollArea.Autosize mah={400}>
                              <Code block>
                                {JSON.stringify(response.headers, null, 2)}
                              </Code>
                            </ScrollArea.Autosize>
                          </Tabs.Panel>
                        </Tabs>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* API Overview Tab */}
          <Tabs.Panel value="overview" pt="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>API Endpoints Overview</Title>
                <Text c="dimmed">{API_ENDPOINTS.length} total endpoints</Text>
              </Group>

              {categories.map(category => (
                <Card key={category} withBorder>
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Title order={4}>{category}</Title>
                      <Badge variant="light">
                        {API_ENDPOINTS.filter(e => e.category === category).length} endpoints
                      </Badge>
                    </Group>

                    <Stack gap="xs">
                      {API_ENDPOINTS.filter(e => e.category === category).map((endpoint, index) => (
                        <Group key={index} justify="space-between" p="sm" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                          <Group gap="md">
                            <Badge color={getMethodColor(endpoint.method)} size="sm">
                              {endpoint.method}
                            </Badge>
                            <Code>{endpoint.path}</Code>
                            <Text size="sm">{endpoint.description}</Text>
                          </Group>
                          <Group gap="xs">
                            {endpoint.requiresAuth && (
                              <Badge size="xs" color="orange" variant="light">
                                Auth Required
                              </Badge>
                            )}
                            {endpoint.parameters && (
                              <Badge size="xs" color="blue" variant="light">
                                {endpoint.parameters.length} params
                              </Badge>
                            )}
                          </Group>
                        </Group>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Tabs.Panel>

          {/* Status Monitoring Tab */}
          <Tabs.Panel value="monitoring" pt="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>API Status Monitoring</Title>
                <Button
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => {
                    API_ENDPOINTS.forEach(endpoint => checkApiStatus(endpoint));
                  }}
                >
                  Check All APIs
                </Button>
              </Group>

              <Grid>
                {categories.map(category => (
                  <Grid.Col key={category} span={{ base: 12, sm: 6, lg: 4 }}>
                    <Card withBorder>
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Title order={4}>{category}</Title>
                          <Badge variant="light">
                            {API_ENDPOINTS.filter(e => e.category === category).length}
                          </Badge>
                        </Group>

                        <Stack gap="xs">
                          {API_ENDPOINTS.filter(e => e.category === category).map((endpoint, index) => {
                            const key = `${endpoint.method}:${endpoint.path}`;
                            const status = apiStatuses[key];

                            return (
                              <Group key={index} justify="space-between" p="xs">
                                <Group gap="xs">
                                  <Badge size="xs" color={getMethodColor(endpoint.method)}>
                                    {endpoint.method}
                                  </Badge>
                                  <Text size="sm" truncate style={{ maxWidth: 150 }}>
                                    {endpoint.path}
                                  </Text>
                                </Group>
                                <Group gap="xs">
                                  {status && (
                                    <Badge size="xs" color={getStatusColor(status)}>
                                      {status === 'checking' ? 'Checking...' : status}
                                    </Badge>
                                  )}
                                  <ActionIcon
                                    size="sm"
                                    variant="light"
                                    onClick={() => checkApiStatus(endpoint)}
                                    loading={status === 'checking'}
                                  >
                                    <IconRefresh size={12} />
                                  </ActionIcon>
                                </Group>
                              </Group>
                            );
                          })}
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
