import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { LoansTable, LoansTableSkeleton } from '@/features/loans';
import { useLoansControllerFindMyOngoingLoans } from '@/api/generated/loans/loans';

export const Route = createFileRoute('/(protected)/user/loans/')({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data: loans = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLoansControllerFindMyOngoingLoans({
    query: {
      select: (response) => (response.status === 200 ? response.data : []),
    },
  });

  const content = (() => {
    if (isLoading) {
      return <LoansTableSkeleton />;
    }

    if (isError) {
      return (
        <LoansErrorState
          message={
            error instanceof Error
              ? error.message
              : 'Unable to load your ongoing loans.'
          }
          onRetry={refetch}
        />
      );
    }

    if (loans.length === 0) {
      return <LoansEmptyState />;
    }

    return <LoansTable loans={loans} />;
  })();

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Your ongoing loans
          </h1>
          <p className="text-muted-foreground">
            Track which books are currently checked out and when they’re due.
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

interface LoansErrorStateProps {
  message: string;
  onRetry: () => Promise<unknown>;
}

function LoansErrorState({ message, onRetry }: LoansErrorStateProps) {
  return (
    <div className="border-destructive/50 bg-destructive/5 flex flex-col items-start gap-4 rounded-xl border p-6">
      <div>
        <p className="text-destructive text-base font-semibold">
          Unable to load loans
        </p>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
      <Button variant="outline" onClick={() => onRetry()}>
        Try again
      </Button>
    </div>
  );
}

function LoansEmptyState() {
  return (
    <div className="bg-card rounded-xl border p-10 text-center">
      <p className="text-lg font-semibold">No active loans</p>
      <p className="text-muted-foreground text-sm">
        When you borrow a book, it will show up here with its due date.
      </p>
    </div>
  );
}
