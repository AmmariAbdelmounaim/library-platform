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

  const bookMap = useMemo<
    Map<number, booksControllerFindOneResponse200['data']>
  >(() => {
    return uniqueBookIds.reduce((acc, bookId, index) => {
      const data = bookQueries[index]?.data;
      if (data) {
        acc.set(bookId, data);
      }
      return acc;
    }, new Map<number, booksControllerFindOneResponse200['data']>());
  }, [bookQueries, uniqueBookIds]);

  const isLoading = bookQueries.some((query) => query.isLoading);
  const isFetching = bookQueries.some((query) => query.isFetching);

  return {
    bookMap,
    isLoading,
    isFetching,
  };
}
