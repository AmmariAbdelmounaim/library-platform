import { createFileRoute } from '@tanstack/react-router';

import { ProfileForm } from '@/features/profile';

export const Route = createFileRoute('/(protected)/user/profile/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and update your personal information.
        </p>
      </header>

      <ProfileForm />
    </section>
  );
}
