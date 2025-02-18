import { Paper, Grid, TextInput, Select } from '@mantine/core';
import { IconSearch, IconFilter } from '@tabler/icons-react';
import { CATEGORIES } from '@/types/gallery';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (value: string | null) => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: FilterBarProps) {
  return (
    <Paper shadow="sm" p="xs" radius="md" withBorder mb="md">
      <Grid align="center">
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <TextInput
            placeholder="Search images..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Select
            placeholder="Filter by category"
            leftSection={<IconFilter size={16} />}
            value={selectedCategory}
            onChange={onCategoryChange}
            data={[
              { value: '', label: 'All Categories' },
              ...CATEGORIES,
            ]}
            clearable
          />
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
