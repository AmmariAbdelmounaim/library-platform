import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/user/')({
  component: UserDashboard,
});

function UserDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-3xl font-bold">User Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to your user dashboard! This is a protected route for regular
        users.
      </p>
    </div>
  );
}
