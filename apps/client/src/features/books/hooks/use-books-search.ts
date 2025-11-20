import { useEffect, useMemo, useState } from 'react';
import { useBooksControllerSearchSimple } from '@/api/generated/books/books';

export type BooksSearchFilters = {
  title: string;
  genre: string;
  authorName: string;
};

export function useBooksSearch() {
  const [filters, setFilters] = useState<BooksSearchFilters>({
    title: '',
    genre: '',
    authorName: '',
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [filters]);

  const normalizedFilters = useMemo(() => {
    const normalize = (value: string) =>
      value.trim().length > 0 ? value.trim() : undefined;

    return {
      title: normalize(debouncedFilters.title),
      genre: normalize(debouncedFilters.genre),
      authorName: normalize(debouncedFilters.authorName),
    };
  }, [debouncedFilters]);

  const hasSearchParams = Object.values(normalizedFilters).some(
    (value) => typeof value === 'string',
  );

  const {
    data: books = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useBooksControllerSearchSimple(
    hasSearchParams ? normalizedFilters : undefined,
    {
      query: {
        select: (response) => (response.status === 200 ? response.data : []),
      },
    },
  );

  return {
    filters,
    setFilters,
    books,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}
