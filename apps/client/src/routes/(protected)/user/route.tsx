import { UserLayout } from '@/components/layouts/user-layout';
import { Outlet } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/user')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <UserLayout>
      <Outlet />
    </UserLayout>
  );
}
