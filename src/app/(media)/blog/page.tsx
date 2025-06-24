'use client'

import { useState, useEffect } from 'react';
import { Table, Button, Group, Text, Container, Loader, Alert } from '@mantine/core';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import Link from "next/link";
import { format } from 'date-fns';

interface Blog {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  slug: string;
  locale: string;
  authorName: string;
}

interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10
  });

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        locale: 'en' // You can make this dynamic if needed
      });

      const response = await fetch(`/api/blogs?${searchParams}`);
      if (!response.ok) throw new Error('Failed to fetch blogs');

      const data = await response.json();
      setBlogs(data.blogs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [pagination.page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete blog');
      fetchBlogs(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog');
    }
  };

  if (loading) return (
    <Container p="md">
      <Loader size="lg" />
    </Container>
  );

  if (error) return (
    <Container p="md">
      <Alert color="red" title="Error">
        {error}
      </Alert>
    </Container>
  );

  return (
    <Container size="xl" p="md">
      <Group justify="space-between" mb="lg">
        <Text size="xl" fw={700}>Blogs</Text>
        <Button component={Link} href="/blogs/new">
          Create New Blog
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Author</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Created At</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {blogs.map((blog) => (
            <Table.Tr key={blog.id}>
              <Table.Td>{blog.title}</Table.Td>
              <Table.Td>{blog.authorName}</Table.Td>
              <Table.Td>{blog.status}</Table.Td>
              <Table.Td>
                {format(new Date(blog.createdAt), 'MMM dd, yyyy')}
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    component={Link}
                    href={`/blogs/${blog.slug}/edit`}
                  >
                    <IconEdit size={16} />
                  </Button>
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    component={Link}
                    href={`/blogs/${blog.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconEye size={16} />
                  </Button>
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    color="red"
                    onClick={() => handleDelete(blog.id)}
                  >
                    <IconTrash size={16} />
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {pagination.pages > 1 && (
        <Group justify="center" mt="md">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <Button
              key={i + 1}
              variant={pagination.page === i + 1 ? "filled" : "light"}
              onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
            >
              {i + 1}
            </Button>
          ))}
        </Group>
      )}
    </Container>
  );
}
