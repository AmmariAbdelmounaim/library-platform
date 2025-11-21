import { useCallback, useMemo } from 'react';

import { Link } from '@tanstack/react-router';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type { LoanResponseDto } from '@/api/generated/model';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { asOptionalString, formatDate } from '@/features/books';

import { useLoanBooks } from '../hooks/use-loan-books';
import { useLoanUsers } from '../hooks/use-loan-users';

interface AdminLoansTableProps {
  loans: LoanResponseDto[];
}

type LoanRow = LoanResponseDto & {
  userName: string;
  bookTitle: string;
  borrowedDisplay: string;
  dueDisplay: string;
  returnedDisplay: string;
  statusDisplay: string;
};

export function AdminLoansTable({ loans }: AdminLoansTableProps) {
  const { bookMap, isLoading: isLoadingBooks } = useLoanBooks(loans);
  const { userMap, isLoading: isLoadingUsers } = useLoanUsers(loans);

  const getUserName = useCallback(
    (userId: number): string => {
      const user = userMap.get(userId);
      if (!user) {
        return 'Loading...';
      }
      const firstName = asOptionalString(user.firstName) ?? '';
      const lastName = asOptionalString(user.lastName) ?? '';
      const name = [firstName, lastName].filter(Boolean).join(' ');
      return name || asOptionalString(user.email) || 'Unknown User';
    },
    [userMap],
  );

  const columns: ColumnDef<LoanRow>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: () => 'Loan ID',
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono text-sm">
            #{row.original.id}
          </span>
        ),
      },
      {
        accessorKey: 'userName',
        header: () => 'User',
        cell: ({ row }) => {
          const { userId, userName } = row.original;
          if (!userId) {
            return <span className="text-muted-foreground">Unknown user</span>;
          }

          return <span className="font-medium">{userName}</span>;
        },
      },
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
              to="/admin/books/$bookId"
              params={{ bookId: String(bookId) }}
              className="text-primary font-medium hover:underline"
            >
              {bookTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: 'statusDisplay',
        header: () => 'Status',
        cell: ({ row }) => {
          const status = row.original.statusDisplay;
          const statusColor =
            status === 'ONGOING'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : status === 'LATE'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColor}`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: 'borrowedDisplay',
        header: () => 'Borrowed',
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.borrowedDisplay}
          </span>
        ),
      },
      {
        accessorKey: 'dueDisplay',
        header: () => 'Due Date',
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.dueDisplay}
          </span>
        ),
      },
      {
        accessorKey: 'returnedDisplay',
        header: () => 'Returned',
        cell: ({ row }) => {
          const returned = row.original.returnedDisplay;
          return returned ? (
            <span className="text-muted-foreground text-sm">{returned}</span>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          );
        },
      },
    ],
    [],
  );

  const data = useMemo(
    () =>
      loans.map((loan) => {
        const rawTitle = bookMap.get(loan.bookId)?.title;
        const title = asOptionalString(rawTitle) ?? 'Loading title…';
        const userName = loan.userId
          ? getUserName(loan.userId)
          : 'Unknown user';
        return {
          ...loan,
          userName,
          bookTitle: title,
          borrowedDisplay: loan.borrowedAt
            ? formatDate(loan.borrowedAt)
            : 'Not available',
          dueDisplay: loan.dueAt ? formatDate(loan.dueAt) : 'Not available',
          returnedDisplay: loan.returnedAt ? formatDate(loan.returnedAt) : '',
          statusDisplay: loan.status || 'UNKNOWN',
        };
      }),
    [bookMap, loans, getUserName],
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
          <CardTitle>All Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No loans found in the system.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {(isLoadingBooks || isLoadingUsers) && (
        <p className="text-muted-foreground text-sm">Loading loan details…</p>
      )}
      <div className="overflow-x-auto">
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminLoansTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-40" />
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Loan ID
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                User
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Book
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Status
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Borrowed
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Due Date
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Returned
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-44" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-6 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-32" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
