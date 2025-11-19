import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/admin/__layout')({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
