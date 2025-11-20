import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import {
  getBooksControllerFindOneQueryOptions,
  type booksControllerFindOneResponse200,
} from '@/api/generated/books/books';
import type { LoanResponseDto } from '@/api/generated/model';

export function useLoanBooks(loans: LoanResponseDto[]) {
  const uniqueBookIds = useMemo(() => {
    const ids = loans
      .map((loan) => loan.bookId)
      .filter((bookId): bookId is number => typeof bookId === 'number');
    return Array.from(new Set(ids));
  }, [loans]);

  const bookQueries = useQueries({
    queries:
      uniqueBookIds.length === 0
        ? []
        : uniqueBookIds.map((bookId) =>
            getBooksControllerFindOneQueryOptions(bookId, {
              query: {
                select: (response) =>
                  response.status === 200 ? response.data : undefined,
                staleTime: 1000 * 60 * 5,
              },
            }),
          ),
  });

  // Extract just the data values for stable comparison
  const bookDataArray = useMemo(
    () => uniqueBookIds.map((bookId, index) => bookQueries[index]?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uniqueBookIds, ...bookQueries.map((q) => q.data)],
  );

  const bookMap = useMemo<
    Map<number, booksControllerFindOneResponse200['data']>
  >(() => {
    return uniqueBookIds.reduce((acc, bookId, index) => {
      const data = bookDataArray[index];
      if (data) {
        acc.set(bookId, data);
      }
      return acc;
    }, new Map<number, booksControllerFindOneResponse200['data']>());
  }, [bookDataArray, uniqueBookIds]);

  const isLoading = bookQueries.some((query) => query.isLoading);
  const isFetching = bookQueries.some((query) => query.isFetching);

  return {
    bookMap,
    isLoading,
    isFetching,
  };
}
