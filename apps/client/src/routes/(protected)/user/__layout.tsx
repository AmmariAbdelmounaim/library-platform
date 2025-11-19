import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/user/__layout')({
  component: UserLayout,
});

function UserLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
