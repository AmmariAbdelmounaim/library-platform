import { usersControllerGetCurrentUser } from '@/api/generated/users/users';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { getAuthToken, removeAuthToken } from '@/features/auth';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/admin')({
  beforeLoad: async ({ location }) => {
    const token = getAuthToken();
    if (!token) {
      throw redirect({ to: '/' });
    }

    try {
      const response = await usersControllerGetCurrentUser();
      const user = response.status === 200 ? response.data : null;

      if (response.status === 401) {
        removeAuthToken();
        throw redirect({ to: '/' });
      }

      if (!user || user.role !== 'ADMIN') {
        throw redirect({ to: '/' });
      }
      if (location.pathname === '/admin/' || location.pathname === '/admin') {
        throw redirect({ to: '/admin/books' });
      }
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'status' in error &&
        error?.status === 307
      ) {
        throw error;
      }
      removeAuthToken();
      throw redirect({ to: '/' });
    }
  },
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
