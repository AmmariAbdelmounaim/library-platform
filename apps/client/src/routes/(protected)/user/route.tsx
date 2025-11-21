import { usersControllerGetCurrentUser } from '@/api/generated/users/users';
import { UserLayout } from '@/components/layouts/user-layout';
import { getAuthToken, removeAuthToken } from '@/features/auth';
import { Outlet, redirect } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/user')({
  beforeLoad: async ({ location }) => {
    const token = getAuthToken();
    if (!token) {
      throw redirect({ to: '/' });
    }

    try {
      const response = await usersControllerGetCurrentUser();
      const user =
        'data' in response && response.status === 200 ? response.data : null;

      // If 401, clear token and redirect to login
      if (response.status === 401) {
        removeAuthToken();
        throw redirect({ to: '/' });
      }

      if (!user || user.role !== 'USER') {
        throw redirect({ to: '/' });
      }

      if (location.pathname === '/user/' || location.pathname === '/user') {
        throw redirect({ to: '/user/books' });
      }
    } catch (error) {
      // If it's a redirect, rethrow it
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error?.status === 307
      ) {
        throw error;
      }
      // For any other error, clear token and redirect to login
      removeAuthToken();
      throw redirect({ to: '/' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <UserLayout>
      <Outlet />
    </UserLayout>
  );
}
