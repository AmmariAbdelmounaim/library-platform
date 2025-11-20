import { useEffect, useMemo, useState } from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { BookCard, BookCardSkeleton, BooksFilters } from '@/features/books';
import { useBooksControllerSearchSimple } from '@/api/generated/books/books';

export const Route = createFileRoute('/(protected)/user/books/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [filters, setFilters] = useState({
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

  const content = (() => {
    if (isLoading) {
      return <BooksLoadingGrid />;
    }

    if (isError) {
      return (
        <BooksErrorState
          message={
            error instanceof Error
              ? error.message
              : 'Something went wrong while loading books.'
          }
          onRetry={refetch}
        />
      );
    }

    if (books.length === 0) {
      return <BooksEmptyState />;
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    );
  })();

  return (
    <section className="space-y-8">
      <header className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Library catalog
            </h1>
            <p className="text-muted-foreground">
              Browse all books available in the library.
            </p>
          </div>
          {isFetching && !isLoading ? (
            <p className="text-muted-foreground text-sm">Refreshing…</p>
          ) : null}
        </div>

        <BooksFilters
          filters={filters}
          onChange={(nextFilters) => setFilters(nextFilters)}
        />
      </header>

      {content}
    </section>
  );
}

function BooksLoadingGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  );
}

type BooksErrorStateProps = {
  message: string;
  onRetry: () => Promise<unknown>;
};

function BooksErrorState({ message, onRetry }: BooksErrorStateProps) {
  return (
    <div className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-4 rounded-xl border p-6">
      <div>
        <p className="text-destructive text-base font-semibold">
          Unable to load books
        </p>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
      <Button variant="outline" onClick={() => onRetry()}>
        Try again
      </Button>
    </div>
  );
}

function BooksEmptyState() {
  return (
    <div className="bg-card rounded-xl border p-10 text-center">
      <p className="text-lg font-semibold">No books found</p>
    </div>
  );
}
