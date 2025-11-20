import { AdminLayout } from '@/components/layouts/admin-layout';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/admin')({
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
