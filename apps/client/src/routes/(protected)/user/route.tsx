import { usersControllerGetCurrentUser } from '@/api/generated/users/users';
import { UserLayout } from '@/components/layouts/user-layout';
import { getAuthToken } from '@/features/auth';
import { Outlet, redirect } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/user')({
  beforeLoad: async ({ location }) => {
    const token = getAuthToken();
    if (!token) {
      throw redirect({ to: '/' });
    }

    const response = await usersControllerGetCurrentUser();
    const user =
      'data' in response && response.status === 200 ? response.data : null;

    if (!user || user.role !== 'USER') {
      throw redirect({ to: '/' });
    }

    if (location.pathname === '/user/' || location.pathname === '/user') {
      throw redirect({ to: '/user/books' });
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
