import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import {
  getUsersControllerFindOneQueryOptions,
  getUsersControllerFindOneQueryKey,
  type usersControllerFindOneResponse200,
} from '@/api/generated/users/users';
import type { LoanResponseDto } from '@/api/generated/model';

export function useLoanUsers(loans: LoanResponseDto[]) {
  const uniqueUserIds = useMemo(() => {
    const ids = loans.map((loan) => loan.userId);
    return Array.from(new Set(ids));
  }, [loans]);

  const userQueries = useQueries({
    queries:
      uniqueUserIds.length === 0
        ? []
        : uniqueUserIds.map((userId) =>
            getUsersControllerFindOneQueryOptions(Number(userId), {
              query: {
                queryKey: getUsersControllerFindOneQueryKey(Number(userId)),
                select: (response) =>
                  response.status === 200 ? response.data : undefined,
                staleTime: 1000 * 60 * 5,
              },
            }),
          ),
  });

  // Extract just the data values for stable comparison
  const userDataArray = useMemo(
    () => uniqueUserIds.map((userId, index) => userQueries[index]?.data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uniqueUserIds, ...userQueries.map((q) => q.data)],
  );

  const userMap = useMemo<
    Map<number, usersControllerFindOneResponse200['data']>
  >(() => {
    return uniqueUserIds.reduce((acc, userId, index) => {
      const data = userDataArray[index];
      if (data) {
        acc.set(Number(userId), data);
      }
      return acc;
    }, new Map<number, usersControllerFindOneResponse200['data']>());
  }, [userDataArray, uniqueUserIds]);

  const isLoading = userQueries.some((query) => query.isLoading);
  const isFetching = userQueries.some((query) => query.isFetching);

  return {
    userMap,
    isLoading,
    isFetching,
  };
}
