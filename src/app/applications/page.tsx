'use client';
import { useState } from 'react';
import {
  Container, Title, Table, Group, TextInput, Select, Button,
  Menu, ActionIcon, Modal, Stack, Badge,
  Drawer, Paper, Tooltip, Text
} from '@mantine/core';
import {
  IconDotsVertical, IconMail, IconPhone, IconCalendar,
  IconDownload, IconPrinter, IconFilter, IconSearch,
  IconFileSpreadsheet, IconX
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import * as XLSX from 'xlsx';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';

// ✅ MIGRATED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';
import { useCrudOperations } from '@/hooks/useCrudOperations';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [filterDrawerOpened, { open: openFilterDrawer, close: closeFilterDrawer }] = useDisclosure(false);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  // ✅ MIGRATED: Use centralized data fetching
  const { data: applications = [], loading: _loading, error: _error } = useApiData<Application[]>('/api/join-us', []);
  const { update } = useCrudOperations<Application>('/api/join-us');

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const result = await update(id, { status: newStatus });
      
      if (result) {
        notifications.show({
          title: 'Success',
          message: 'Application status updated',
          color: 'green',
        });
      }
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to update status',
        color: 'red',
      });
    }
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      const matchesSearch = search ?
        (app.name.toLowerCase().includes(search.toLowerCase()) ||
          app.email.toLowerCase().includes(search.toLowerCase()) ||
          app.role.toLowerCase().includes(search.toLowerCase()) ||
          app.message.toLowerCase().includes(search.toLowerCase()))
        : true;

      const matchesStatus = statusFilter ? app.status === statusFilter : true;

      const matchesRole = roleFilter ? app.role === roleFilter : true;

      const matchesDate = dateRange[0] && dateRange[1] ?
        (new Date(app.createdAt) >= dateRange[0] &&
          new Date(app.createdAt) <= dateRange[1])
        : true;

      return matchesSearch && matchesStatus && matchesRole && matchesDate;
    });
  };

  const handleExport = () => {
    const filteredData = getFilteredApplications();
    const exportData = filteredData.map(app => ({
      'Name': app.name,
      'Email': app.email,
      'Phone': app.phone,
      'Role': app.role,
      'Message': app.message,
      'Status': app.status,
      'Date': new Date(app.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    XLSX.writeFile(wb, `applications_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    const filteredData = getFilteredApplications();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Applications</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Applications Report</h1>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(app => `
                <tr>
                  <td>${app.name}</td>
                  <td>${app.role}</td>
                  <td>${app.email}</td>
                  <td>${app.status}</td>
                  <td>${new Date(app.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredApplications = getFilteredApplications();
  const uniqueRoles = Array.from(new Set(applications.map(app => app.role)));

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title>Join Applications</Title>
        <Group>
          <Tooltip label="Export to Excel">
            <ActionIcon variant="light" onClick={handleExport}>
              <IconFileSpreadsheet size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Print">
            <ActionIcon variant="light" onClick={handlePrint}>
              <IconPrinter size={20} />
            </ActionIcon>
          </Tooltip>
          <Button
            leftSection={<IconFilter size={20} />}
            variant="light"
            onClick={openFilterDrawer}
          >
            Filters
          </Button>
        </Group>
      </Group>

      <Paper withBorder p="md" mb="xl">
        <Group>
          <TextInput
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flex: 1 }}
            leftSection={<IconSearch size={16} />}
            rightSection={
              search ? (
                <ActionIcon onClick={() => setSearch('')}>
                  <IconX size={16} />
                </ActionIcon>
              ) : null
            }
          />
        </Group>
      </Paper>

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

      <Drawer
        opened={filterDrawerOpened}
        onClose={closeFilterDrawer}
        title="Filter Applications"
        position="right"
        padding="lg"
      >
        <Stack>
          <Select
            label="Status"
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

          <Select
            label="Role"
            placeholder="Filter by role"
            value={roleFilter}
            onChange={setRoleFilter}
            clearable
            data={uniqueRoles.map(role => ({ value: role, label: role }))}
          />

          <DateInput
            label="Start Date"
            placeholder="Filter from date"
            value={dateRange[0]}
            onChange={(date) => setDateRange([date, dateRange[1]])}
          />

          <DateInput
            label="End Date"
            placeholder="Filter to date"
            value={dateRange[1]}
            onChange={(date) => setDateRange([dateRange[0], date])}
          />

          <Button
            onClick={() => {
              setStatusFilter(null);
              setRoleFilter(null);
              setDateRange([null, null]);
            }}
            variant="light"
            color="red"
          >
            Clear Filters
          </Button>
        </Stack>
      </Drawer>
    </Container>
  );
}
