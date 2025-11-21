import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getLoansControllerFindAllOngoingQueryKey,
  getLoansControllerFindMyOngoingLoansQueryKey,
  useLoansControllerCreate,
  useLoansControllerFindMyOngoingLoans,
  useLoansControllerReturnLoan,
} from '@/api/generated/loans/loans';
import { getErrorMessage } from '@/lib/api-errors';
import { CreateLoanDtoBookId, LoanResponseDto } from '@/api/generated/model';
import { Button } from '@/components/ui/button';

interface LoanBookButtonProps {
  bookId: number | CreateLoanDtoBookId;
}

export function LoanBookButton({ bookId }: LoanBookButtonProps) {
  const queryClient = useQueryClient();

  const { data: loans = [], isLoading: isLoadingLoans } =
    useLoansControllerFindMyOngoingLoans<LoanResponseDto[]>({
      query: {
        queryKey: getLoansControllerFindMyOngoingLoansQueryKey(),
        select: (response) => (response.status === 200 ? response.data : []),
      },
    });

  const currentLoan = loans.find((loan) => Number(loan.bookId) === bookId);
  const isLoaned = !!currentLoan;

  const { mutate: createLoan, isPending: isCreating } =
    useLoansControllerCreate({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getLoansControllerFindMyOngoingLoansQueryKey(),
          });
          queryClient.invalidateQueries({
            queryKey: getLoansControllerFindAllOngoingQueryKey(),
          });
          toast.success('Book loaned successfully!');
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(error);
          toast.error('Failed to loan book', {
            description:
              errorMessage || 'An unexpected error occurred. Please try again.',
          });
        },
      },
    });

  const { mutate: returnLoan, isPending: isReturning } =
    useLoansControllerReturnLoan({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getLoansControllerFindMyOngoingLoansQueryKey(),
          });
          toast.success('Book returned successfully!');
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(error);
          toast.error('Failed to return book', {
            description:
              errorMessage || 'An unexpected error occurred. Please try again.',
          });
        },
      },
    });

  const handleClick = () => {
    if (isLoaned && currentLoan) {
      // Return the book
      returnLoan({
        id: currentLoan.id,
      });
    } else {
      // Loan the book
      createLoan({
        data: {
          bookId: bookId as CreateLoanDtoBookId,
        },
      });
    }
  };

  const isPending = isCreating || isReturning;

  return (
    <Button
      onClick={handleClick}
      disabled={isLoadingLoans || isPending}
      variant={isLoaned ? 'secondary' : 'default'}
    >
      {isPending
        ? isReturning
          ? 'Returning...'
          : 'Loaning...'
        : isLoaned
          ? 'Return Book'
          : 'Loan Book'}
    </Button>
  );
}
