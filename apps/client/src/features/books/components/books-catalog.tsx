import { useState } from 'react';
import { BooksFilters } from './books.filter';
import { BooksEmptyState } from './books-empty-state';
import { BooksErrorState } from './books-error-state';
import { BooksGrid } from './books-grid';
import { BooksLoadingGrid } from './books-loading-grid';
import { useBooksSearch } from '../hooks/use-books-search';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useBooksControllerCreateFromGoogleBooks } from '@/api/generated/books/books';
import { getErrorMessage } from '@/lib/api-errors';

type BooksCatalogProps = {
  title?: string;
  description?: string;
  withAddBook?: boolean;
};

export function BooksCatalog({
  title = 'Library catalog',
  description = 'Browse all books available in the library.',
  withAddBook = false,
}: BooksCatalogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isbn, setIsbn] = useState('');
  const queryClient = useQueryClient();

  const {
    filters,
    setFilters,
    books,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useBooksSearch();

  const createFromGoogleMutation = useBooksControllerCreateFromGoogleBooks({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 201 && response.data) {
          // Invalidate search queries
          queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey;
              return (
                Array.isArray(key) &&
                key.length > 0 &&
                key[0] === '/api/books/search/simple'
              );
            },
          });

          toast.success('Book added successfully!', {
            description: `"${response.data.title}" has been added from Google Books.`,
          });

          setIsDialogOpen(false);
          setIsbn('');
        }
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        toast.error('Failed to add book from Google', {
          description:
            errorMessage || 'An unexpected error occurred. Please try again.',
        });
      },
    },
  });

  const handleCreate = () => {
    if (!isbn.trim()) {
      toast.error('ISBN is required', {
        description: 'Please enter a valid ISBN.',
      });
      return;
    }

    createFromGoogleMutation.mutate({
      data: { isbn: isbn.trim() },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

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

    return <BooksGrid books={books} />;
  })();

  return (
    <section className="space-y-8">
      <header className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex w-full items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
            {withAddBook ? (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                  <Link
                    to={'/admin/books/add'}
                    className="flex items-center gap-2"
                  >
                    <Plus className="size-4" />
                    Add Book
                  </Link>
                </Button>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="size-4" />
                  Add from Google
                </Button>
              </div>
            ) : null}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Book from Google</DialogTitle>
            <DialogDescription>
              Enter the ISBN (ISBN-10 or ISBN-13) of the book you want to add
              from Google Books.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                placeholder="Enter ISBN-10 or ISBN-13"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={createFromGoogleMutation.isPending}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setIsbn('');
              }}
              disabled={createFromGoogleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createFromGoogleMutation.isPending || !isbn.trim()}
            >
              {createFromGoogleMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
