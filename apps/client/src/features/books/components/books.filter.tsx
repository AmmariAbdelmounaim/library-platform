import { Input } from '@/components/ui/input';
import { ChangeEvent } from 'react';

interface BooksFiltersProps {
  filters: {
    title: string;
    genre: string;
    authorName: string;
  };
  onChange: (filters: BooksFiltersProps['filters']) => void;
}

export function BooksFilters({ filters, onChange }: BooksFiltersProps) {
  const handleChange =
    (field: keyof BooksFiltersProps['filters']) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange({ ...filters, [field]: event.target.value });
    };

  return (
    <div className="bg-card gap-4 rounded-xl border p-4 sm:grid sm:grid-cols-3">
      <Input
        value={filters.title}
        onChange={handleChange('title')}
        placeholder="Filter by title"
        aria-label="Filter books by title"
      />
      <Input
        value={filters.genre}
        onChange={handleChange('genre')}
        placeholder="Filter by genre"
        aria-label="Filter books by genre"
      />
      <Input
        value={filters.authorName}
        onChange={handleChange('authorName')}
        placeholder="Filter by author name"
        aria-label="Filter books by author name"
      />
    </div>
  );
}
