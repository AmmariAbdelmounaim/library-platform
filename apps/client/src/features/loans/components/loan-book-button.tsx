import { useQueryClient } from '@tanstack/react-query';

import {
  getLoansControllerFindMyOngoingLoansQueryKey,
  useLoansControllerCreate,
  useLoansControllerFindMyOngoingLoans,
  useLoansControllerReturnLoan,
} from '@/api/generated/loans/loans';
import { Button } from '@/components/ui/button';

interface LoanBookButtonProps {
  bookId: number;
}

export function LoanBookButton({ bookId }: LoanBookButtonProps) {
  const queryClient = useQueryClient();

  const { data: loans = [], isLoading: isLoadingLoans } =
    useLoansControllerFindMyOngoingLoans({
      query: {
        select: (response) => (response.status === 200 ? response.data : []),
      },
    });

  const currentLoan = loans.find((loan) => loan.bookId === bookId);
  const isLoaned = !!currentLoan;

  const { mutate: createLoan, isPending: isCreating } =
    useLoansControllerCreate({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getLoansControllerFindMyOngoingLoansQueryKey(),
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
          bookId,
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
