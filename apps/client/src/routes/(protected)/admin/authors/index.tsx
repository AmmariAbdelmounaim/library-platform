import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AuthorsTable,
  AuthorsTableSkeleton,
} from '@/features/authors';
import {
  useAuthorsControllerFindAll,
} from '@/api/generated/authors/authors';

export const Route = createFileRoute('/(protected)/admin/authors/')({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data: authorsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAuthorsControllerFindAll({
    query: {
      select: (response) => (response.status === 200 ? response.data : []),
    },
  });

  const authors = authorsResponse || [];

  const content = (() => {
    if (isLoading) {
      return <AuthorsTableSkeleton />;
    }

    if (isError) {
      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
          <p className="text-destructive font-semibold">
            Failed to load authors
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred.'}
          </p>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="mt-4"
          >
            Try again
          </Button>
        </div>
      );
    }

    return <AuthorsTable authors={authors} />;
  })();

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Authors</h1>
          <p className="text-muted-foreground">
            Manage authors in your library.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading ? (
            <p className="text-muted-foreground text-sm">Refreshing…</p>
          ) : null}
          <Button asChild>
            <Link to="/admin/authors/add" className="flex items-center gap-2">
              <Plus className="size-4" />
              Add Author
            </Link>
          </Button>
        </div>
      </header>

      {content}
    </section>
  );
}
