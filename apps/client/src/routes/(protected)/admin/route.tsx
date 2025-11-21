import { usersControllerGetCurrentUser } from '@/api/generated/users/users';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { getAuthToken } from '@/features/auth';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/admin')({
  beforeLoad: async ({ location }) => {
    const token = getAuthToken();
    if (!token) {
      throw redirect({ to: '/' });
    }

    const response = await usersControllerGetCurrentUser();
    const user =
      'data' in response && response.status === 200 ? response.data : null;

    if (!user || user.role !== 'ADMIN') {
      throw redirect({ to: '/' });
    }
    console.log('location.pathname: ', location.pathname);
    if (location.pathname === '/admin/' || location.pathname === '/admin') {
      throw redirect({ to: '/admin/books' });
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
