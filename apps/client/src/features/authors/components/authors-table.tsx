import { useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { AuthorResponseDto } from '@/api/generated/model';
import {
  getAuthorsControllerFindAllQueryKey,
  useAuthorsControllerRemove,
} from '@/api/generated/authors/authors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getErrorMessage } from '@/lib/api-errors';
import { formatDate } from '@/features/books';
import { Pen, Trash2 } from 'lucide-react';

interface AuthorsTableProps {
  authors: AuthorResponseDto[];
}

type AuthorRow = AuthorResponseDto & {
  fullName: string;
};

export function AuthorsTable({ authors }: AuthorsTableProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] =
    useState<AuthorResponseDto | null>(null);

  const { mutate: deleteAuthor, isPending: isDeleting } =
    useAuthorsControllerRemove({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getAuthorsControllerFindAllQueryKey(),
          });
          toast.success('Author deleted successfully!', {
            description: 'The author has been removed.',
          });
          setDeleteDialogOpen(false);
          setAuthorToDelete(null);
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(error);
          toast.error('Failed to delete author', {
            description:
              errorMessage || 'An unexpected error occurred. Please try again.',
          });
        },
      },
    });

  const handleDeleteClick = (author: AuthorResponseDto) => {
    setAuthorToDelete(author);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (authorToDelete) {
      deleteAuthor({ id: authorToDelete.id });
    }
  };

  const getFullName = (author: AuthorResponseDto): string => {
    const firstName =
      typeof author.firstName === 'string' ? author.firstName : '';
    const lastName = typeof author.lastName === 'string' ? author.lastName : '';
    return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown Author';
  };

  const columns: ColumnDef<AuthorRow>[] = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: () => 'Name',
        cell: ({ row }) => {
          const author = row.original;
          return (
            <Link
              to="/admin/authors/$authorId"
              params={{ authorId: String(author.id) } as any}
              className="text-primary font-medium hover:underline"
            >
              {row.original.fullName}
            </Link>
          );
        },
      },
      {
        accessorKey: 'birthDate',
        header: () => 'Birth Date',
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.birthDate
              ? formatDate(row.original.birthDate)
              : 'Not available'}
          </span>
        ),
      },
      {
        accessorKey: 'deathDate',
        header: () => 'Death Date',
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.deathDate
              ? formatDate(row.original.deathDate)
              : 'Living / Unknown'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => 'Actions',
        cell: ({ row }) => {
          const author = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link
                  to="/admin/authors/$authorId"
                  params={{ authorId: String(author.id) } as any}
                  className="flex items-center gap-1"
                >
                  <Pen className="size-3" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteClick(author)}
                disabled={isDeleting}
              >
                <Trash2 className="size-3" />
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [isDeleting],
  );

  const data = useMemo(
    () =>
      authors.map((author) => ({
        ...author,
        fullName: getFullName(author),
      })),
    [authors],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (authors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authors</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No authors found. Create your first author to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
            {table.getRowModel().rows.map((row) => {
              const author = row.original;
              return (
                <tr
                  key={row.id}
                  className="hover:bg-muted/50 cursor-pointer border-t"
                  onClick={() => {
                    navigate({
                      to: '/admin/authors/$authorId',
                      params: { authorId: String(author.id) } as any,
                    });
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3"
                      onClick={(e) => {
                        // Prevent row click when clicking on action buttons
                        if (cell.column.id === 'actions') {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Author</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              {authorToDelete ? getFullName(authorToDelete) : ''}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setAuthorToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AuthorsTableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-40" />
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Name
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Birth Date
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Death Date
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-44" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
