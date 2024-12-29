'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Text,
  Paper,
  Title,
  Badge,
  Group,
  Stack
} from '@mantine/core';
import { formatDistanceToNow } from 'date-fns';

interface Enquiry {
  id: string;
  email: string;
  name: string | null;
  subject: string | null;
  message: string;
  createdAt: string;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnquiries() {
      try {
        const response = await fetch('/api/enquiries');
        const data = await response.json();
        setEnquiries(data);
      } catch (error) {
        console.error('Error fetching enquiries:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEnquiries();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Stack p="xl">
      <Group justify="space-between" align="center">
        <Title order={2}>Contact Form Submissions</Title>
        <Badge size="lg">{enquiries.length} Total</Badge>
      </Group>

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
            {enquiries.map((enquiry) => (
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
    </Stack>
  );
} 