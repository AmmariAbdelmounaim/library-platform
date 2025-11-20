import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createFileRoute } from '@tanstack/react-router';
import { AuthorForm } from '@/features/authors';
import {
  useAuthorsControllerCreate,
  getAuthorsControllerFindAllQueryKey,
} from '@/api/generated/authors/authors';
import { getErrorMessage } from '@/lib/api-errors';
import type { AuthorFormData } from '@/features/authors/lib/schemas';
import type { CreateAuthorDto } from '@/api/generated/model';

export const Route = createFileRoute('/(protected)/admin/authors/add/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createAuthorMutation = useAuthorsControllerCreate({
    mutation: {
      onSuccess: (response) => {
        if (response.status === 201 && response.data) {
          // Invalidate authors list to refresh
          queryClient.invalidateQueries({
            queryKey: getAuthorsControllerFindAllQueryKey(),
          });

          // Show success toast
          const lastName =
            typeof response.data.lastName === 'string'
              ? response.data.lastName
              : 'Author';
          toast.success('Author created successfully!', {
            description: `${lastName} has been added to the library.`,
          });

          // Navigate to the authors list
          navigate({ to: '/admin/authors' });
        }
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        toast.error('Failed to create author', {
          description:
            errorMessage || 'An unexpected error occurred. Please try again.',
        });
      },
    },
  });

  const handleSubmit = (data: AuthorFormData) => {
    // Convert AuthorFormData to CreateAuthorDto
    const createAuthorDto: CreateAuthorDto = {
      firstName: data.firstName
        ? (data.firstName as unknown as CreateAuthorDto['firstName'])
        : undefined,
      lastName: data.lastName as unknown as CreateAuthorDto['lastName'],
      birthDate: data.birthDate || undefined,
      deathDate: data.deathDate || undefined,
    };

    createAuthorMutation.mutate({ data: createAuthorDto });
  };

  return (
    <div className="container py-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Author</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Fill in the details below to add a new author to the library.
        </p>
      </div>
      <AuthorForm
        onSubmit={handleSubmit}
        isLoading={createAuthorMutation.isPending}
        submitButtonText="Add Author"
      />
    </div>
  );
}
