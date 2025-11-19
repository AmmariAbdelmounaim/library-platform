import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the admin dashboard! This is a protected route for administrators.
      </p>
    </div>
  );
}
