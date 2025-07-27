'use client';

import { useState } from 'react';
import {
  Container, Table, Text, Paper, Title, Badge, Group, Stack,
  TextInput, Button, ActionIcon, Drawer, Tooltip
} from '@mantine/core';
import { formatDistanceToNow } from 'date-fns';
import { DateInput } from '@mantine/dates';
import * as XLSX from 'xlsx';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSearch, IconFilter, IconPrinter,
  IconFileSpreadsheet, IconX
} from '@tabler/icons-react';

// ✅ MIGRATED: Import centralized hooks
import { useApiData } from '@/hooks/useApiData';

interface Enquiry {
  id: string;
  email: string;
  name: string | null;
  subject: string | null;
  message: string;
  createdAt: string;
}

export default function EnquiriesPage() {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [filterDrawerOpened, { open: openFilterDrawer, close: closeFilterDrawer }] = useDisclosure(false);

  // ✅ MIGRATED: Use centralized data fetching
  const { data: enquiries = [], loading: _loading } = useApiData<Enquiry[]>('/api/enquiries', []);

  // Filter function
  const getFilteredEnquiries = () => {
    return enquiries.filter(enquiry => {
      const matchesSearch = search ?
        (enquiry.name?.toLowerCase().includes(search.toLowerCase()) ||
          enquiry.email.toLowerCase().includes(search.toLowerCase()) ||
          enquiry.subject?.toLowerCase().includes(search.toLowerCase()) ||
          enquiry.message.toLowerCase().includes(search.toLowerCase()))
        : true;

      const matchesDate = dateRange[0] && dateRange[1] ?
        (new Date(enquiry.createdAt) >= dateRange[0] &&
          new Date(enquiry.createdAt) <= dateRange[1])
        : true;

      return matchesSearch && matchesDate;
    });
  };

  // Export to Excel
  const handleExport = () => {
    const filteredData = getFilteredEnquiries();
    const exportData = filteredData.map(enquiry => ({
      'Date': new Date(enquiry.createdAt).toLocaleDateString(),
      'Name': enquiry.name || 'Anonymous',
      'Email': enquiry.email,
      'Subject': enquiry.subject || 'No subject',
      'Message': enquiry.message
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Enquiries');
    XLSX.writeFile(wb, `enquiries_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Print functionality
  const handlePrint = () => {
    const filteredData = getFilteredEnquiries();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Enquiries</title>
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Enquiries Report</h1>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(enquiry => `
                <tr>
                  <td>${new Date(enquiry.createdAt).toLocaleDateString()}</td>
                  <td>${enquiry.name || 'Anonymous'}</td>
                  <td>${enquiry.email}</td>
                  <td>${enquiry.subject || 'No subject'}</td>
                  <td>${enquiry.message}</td>
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

  const filteredEnquiries = getFilteredEnquiries();

  if (_loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={2}>Contact Form Submissions</Title>
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
            placeholder="Search enquiries..."
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

      <Paper shadow="sm" p="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Subject</Table.Th>
              <Table.Th>Message</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredEnquiries.map((enquiry) => (
              <Table.Tr key={enquiry.id}>
                <Table.Td>
                  <Text size="sm">
                    {formatDistanceToNow(new Date(enquiry.createdAt), { addSuffix: true })}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{enquiry.name || 'Anonymous'}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{enquiry.email}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{enquiry.subject || 'No subject'}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={2}>
                    {enquiry.message}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Drawer
        opened={filterDrawerOpened}
        onClose={closeFilterDrawer}
        title="Filter Enquiries"
        position="right"
        padding="lg"
      >
        <Stack>
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