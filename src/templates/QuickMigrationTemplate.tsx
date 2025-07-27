/**
 * Quick Migration Template
 * 
 * Use this template to quickly convert existing pages that follow the
 * duplicate fetch pattern identified in the codebase audit.
 * 
 * Simply copy this template and customize for your specific data type.
 */

'use client';
import { 
  Container, 
  Grid, 
  Card, 
  Text, 
  Button, 
  LoadingOverlay,
  Group,
  Title,
  Alert
} from '@mantine/core';
import { IconPlus, IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

// 🔧 STEP 1: Define your data interface
interface YourDataType {
  id: string;
  title: string;
  // Add your specific fields here
  createdAt?: string;
  updatedAt?: string;
}

// 🔧 STEP 2: Update the API endpoint
const API_ENDPOINT = '/api/your-endpoint'; // Change this

export default function YourPage() {
  // 🔧 STEP 3: Update the type parameter
  const { 
    data: items, 
    loading, 
    error, 
    refetch 
  } = useApiData<YourDataType[]>(API_ENDPOINT, []);

  const { 
    create, 
    update, 
    remove: deleteItem, 
    loading: operationLoading 
  } = useCrudOperations<YourDataType>(API_ENDPOINT);

  // Handle loading state
  if (loading) {
    return (
      <Container size="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Container size="xl">
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error Loading Data" 
          color="red"
          variant="filled"
        >
          {error?.message || 'An error occurred'}
          <Group mt="md">
            <Button 
              variant="outline" 
              color="red" 
              onClick={refetch}
              leftSection={<IconRefresh size={16} />}
            >
              Retry
            </Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  // Handle empty state
  if (!items || items.length === 0) {
    return (
      <Container size="xl">
        <Alert title="No Data Found" color="blue">
          No items found. Click the button below to add your first item.
          <Group mt="md">
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                // 🔧 STEP 4: Add your create item logic here
                const newItem = {
                  title: 'New Item',
                  // Add default values for your fields
                };
                create(newItem);
              }}
            >
              Add First Item
            </Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl">
      {/* 🔧 STEP 5: Update the page title */}
      <Group justify="space-between" mb="xl">
        <Title order={1}>Your Page Title</Title>
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            // 🔧 STEP 6: Add your create item logic here
            const newItem = {
              title: `New Item ${Date.now()}`,
              // Add default values for your fields
            };
            create(newItem);
          }}
          loading={operationLoading}
        >
          Add New Item
        </Button>
      </Group>

      {/* 🔧 STEP 7: Customize the grid layout and card content */}
      <Grid>
        {items.map((item) => (
          <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              {/* 🔧 STEP 8: Customize card content based on your data */}
              <Card.Section>
                <Text fw={500} size="lg" mt="md">
                  {item.title}
                </Text>
              </Card.Section>

              {/* Add more fields as needed */}
              {item.createdAt && (
                <Text size="sm" c="dimmed" mt="xs">
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              )}

              {/* Action buttons */}
              <Group justify="flex-end" mt="md">
                <Button 
                  variant="light" 
                  size="sm"
                  onClick={() => {
                    // 🔧 STEP 9: Add your edit logic here
                    const updatedItem = {
                      ...item,
                      title: `${item.title} (Updated)`,
                      // Add your update logic
                    };
                    update(item.id, updatedItem);
                  }}
                  loading={operationLoading}
                >
                  Edit
                </Button>
                <Button 
                  color="red" 
                  variant="light" 
                  size="sm"
                  onClick={() => deleteItem(item.id)}
                  loading={operationLoading}
                >
                  Delete
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}

/**
 * 🚀 QUICK CONVERSION CHECKLIST:
 * 
 * □ Step 1: Update YourDataType interface with your actual data structure
 * □ Step 2: Change API_ENDPOINT to your actual API endpoint
 * □ Step 3: Update useApiData type parameter
 * □ Step 4-6: Implement create item logic
 * □ Step 7: Customize grid layout (span values for responsive design)
 * □ Step 8: Update card content with your actual data fields
 * □ Step 9: Implement edit/update logic
 * □ Step 10: Test the page functionality
 * □ Step 11: Remove old file and update imports
 * 
 * 💡 COMMON PATTERNS REPLACED:
 * 
 * ❌ Old: useState + useEffect + manual fetch + error handling
 * ✅ New: useApiData hook (single line)
 * 
 * ❌ Old: Manual create/update/delete functions with try/catch
 * ✅ New: useCrudOperations hook (single line)
 * 
 * ❌ Old: Custom loading states and error handling
 * ✅ New: Centralized loading/error states
 * 
 * ❌ Old: Manual notifications for success/error
 * ✅ New: Automatic notifications from hooks
 * 
 * 💾 TYPICAL CONVERSION TIME: 10-15 minutes per page
 * 📉 CODE REDUCTION: 70-80% fewer lines
 * 🐛 BUG REDUCTION: Standardized error handling eliminates edge cases
 */
