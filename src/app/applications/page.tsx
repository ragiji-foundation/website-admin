'use client';
import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Table,
  Badge,
  ActionIcon,
  Group,
  Text,
  Menu,
  Select,
  TextInput,
  Button,
  Modal,
  Stack,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDotsVertical, IconMail, IconPhone, IconCalendar } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  message: string;
  status: string;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    PENDING: 'yellow',
    APPROVED: 'green',
    REJECTED: 'red',
    CONTACTED: 'blue',
  };

  return (
    <Badge color={colors[status as keyof typeof colors]}>
      {status}
    </Badge>
  );
}

function ApplicationDetails({
  application,
  onClose,
  onStatusChange
}: {
  application: Application;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>{application.name}</Title>
        <StatusBadge status={application.status} />
      </Group>

      <Group>
        <IconCalendar size={16} />
        <Text size="sm">
          {new Date(application.createdAt).toLocaleDateString()}
        </Text>
      </Group>

      <Group>
        <IconMail size={16} />
        <Text component="a" href={`mailto:${application.email}`}>
          {application.email}
        </Text>
      </Group>

      <Group>
        <IconPhone size={16} />
        <Text component="a" href={`tel:${application.phone}`}>
          {application.phone}
        </Text>
      </Group>

      <Text fw={500}>Role</Text>
      <Text>{application.role}</Text>

      <Text fw={500}>Message</Text>
      <Text>{application.message}</Text>

      <Select
        label="Update Status"
        value={application.status}
        data={['PENDING', 'APPROVED', 'REJECTED', 'CONTACTED']}
        onChange={(value) => {
          if (value) onStatusChange(application.id, value);
        }}
      />

      <Button onClick={onClose} mt="md">Close</Button>
    </Stack>
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/join-us');
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch applications',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/join-us/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      setApplications(apps =>
        apps.map(app =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );

      notifications.show({
        title: 'Success',
        message: 'Application status updated',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update status',
        color: 'red',
      });
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.email.toLowerCase().includes(search.toLowerCase()) ||
      app.role.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container size="xl" py="xl">
      <Title mb="xl">Join Applications</Title>

      <Group mb="xl">
        <TextInput
          placeholder="Search applications..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          data={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
            { value: 'CONTACTED', label: 'Contacted' },
          ]}
        />
      </Group>

      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Message</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredApplications.map((app) => (
            <Table.Tr key={app.id}>
              <Table.Td>{app.name}</Table.Td>
              <Table.Td>{app.role}</Table.Td>
              <Table.Td>{app.email}</Table.Td>
              <Table.Td>{app.message}</Table.Td>
              <Table.Td><StatusBadge status={app.status} /></Table.Td>
              <Table.Td>{new Date(app.createdAt).toLocaleDateString()}</Table.Td>
              <Table.Td>
                <Menu>
                  <Menu.Target>
                    <ActionIcon>
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item onClick={() => {
                      setSelectedApplication(app);
                      open();
                    }}>
                      View Details
                    </Menu.Item>
                    <Menu.Item
                      component="a"
                      href={`mailto:${app.email}`}
                    >
                      Send Email
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal
        opened={opened}
        onClose={close}
        title="Application Details"
        size="lg"
      >
        {selectedApplication && (
          <ApplicationDetails
            application={selectedApplication}
            onClose={close}
            onStatusChange={handleStatusChange}
          />
        )}
      </Modal>
    </Container>
  );
}
