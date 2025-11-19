import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/__layout')({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
