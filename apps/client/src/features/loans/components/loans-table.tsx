import { useCallback, useMemo } from 'react';

import { Link } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type { LoanResponseDto } from '@/api/generated/model';
import {
  getLoansControllerFindMyOngoingLoansQueryKey,
  useLoansControllerReturnLoan,
} from '@/api/generated/loans/loans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { asOptionalString, formatDate } from '@/features/books';

import { useLoanBooks } from '../hooks/use-loan-books';

interface LoansTableProps {
  loans: LoanResponseDto[];
}

type LoanRow = LoanResponseDto & {
  bookTitle: string;
  dueDisplay: string;
};

export function LoansTable({ loans }: LoansTableProps) {
  const { bookMap, isLoading: isLoadingBooks } = useLoanBooks(loans);
  const queryClient = useQueryClient();

  const { mutate: returnLoan, isPending: isReturning } =
    useLoansControllerReturnLoan({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getLoansControllerFindMyOngoingLoansQueryKey(),
          });
        },
      },
    });

  const handleReturn = useCallback(
    (loanId: number) => {
      returnLoan({ id: loanId });
    },
    [returnLoan],
  );

  const columns: ColumnDef<LoanRow>[] = useMemo(
    () => [
      {
        accessorKey: 'bookTitle',
        header: () => 'Book',
        cell: ({ row }) => {
          const { bookId, bookTitle } = row.original;
          if (!bookId) {
            return <span className="text-muted-foreground">Unknown book</span>;
          }

          return (
            <Link
              to="/user/books/$bookId"
              params={{ bookId: String(bookId) }}
              className="text-primary font-medium hover:underline"
            >
              {bookTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: 'dueDisplay',
        header: () => 'Due date',
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.dueDisplay}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => 'Actions',
        cell: ({ row }) => {
          const loanId = row.original.id;
          return (
            <Button
              onClick={() => handleReturn(loanId)}
              disabled={isReturning}
              variant="outline"
              size="sm"
            >
              {isReturning ? 'Returning...' : 'Return'}
            </Button>
          );
        },
      },
    ],
    [handleReturn, isReturning],
  );

  const data = useMemo(
    () =>
      loans.map((loan) => {
        const rawTitle = bookMap.get(loan.bookId)?.title;
        const title = asOptionalString(rawTitle) ?? 'Loading title…';
        return {
          ...loan,
          bookTitle: title,
          dueDisplay: loan.dueAt ? formatDate(loan.dueAt) : 'Not available',
        };
      }),
    [bookMap, loans],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ongoing loans</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No active loans right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {isLoadingBooks ? (
        <p className="text-muted-foreground text-sm">Fetching book titles…</p>
      ) : null}
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full min-w-0 text-sm">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-muted-foreground px-4 py-3 text-left font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LoansTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-40" />
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Book
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Due date
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-44" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-8 w-20" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
