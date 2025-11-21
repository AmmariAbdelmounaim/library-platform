import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  AdminLoansTable,
  AdminLoansTableSkeleton,
} from '@/features/loans/components/admin-loans-table';
import {
  getLoansControllerFindAllOngoingQueryKey,
  useLoansControllerFindAllOngoing,
} from '@/api/generated/loans/loans';

export const Route = createFileRoute('/(protected)/admin/loans/')({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data: loansResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLoansControllerFindAllOngoing({
    query: {
      queryKey: getLoansControllerFindAllOngoingQueryKey(),
      select: (response) => (response.status === 200 ? response.data : []),
    },
  });

  const loans = loansResponse || [];

  const content = (() => {
    if (isLoading) {
      return <AdminLoansTableSkeleton />;
    }

    if (isError) {
      return (
        <div className="border-destructive/50 bg-destructive/5 rounded-lg border p-6">
          <p className="text-destructive font-semibold">Failed to load loans</p>
          <p className="text-muted-foreground mt-2 text-sm">
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred.'}
          </p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Try again
          </Button>
        </div>
      );
    }

    return <AdminLoansTable loans={loans} />;
  })();

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Loans</h1>
          <p className="text-muted-foreground">
            View and manage all loans in the library platform.
          </p>
        </div>
        {isFetching && !isLoading ? (
          <p className="text-muted-foreground text-sm">Refreshing…</p>
        ) : null}
      </header>

      {content}
    </section>
  );
}
