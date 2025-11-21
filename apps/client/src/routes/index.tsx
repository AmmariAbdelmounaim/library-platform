import { createFileRoute, redirect } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getAuthToken,
  removeAuthToken,
} from '@/features/auth/lib/auth-storage';
import { usersControllerGetCurrentUser } from '@/api/generated/users/users';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const token = getAuthToken();

    if (token) {
      try {
        const response = await usersControllerGetCurrentUser();

        // Check if response is successful (200)
        if (response.status === 200) {
          const user = response.data;

          if (user) {
            if (user.role === 'ADMIN') {
              throw redirect({
                to: '/admin',
              });
            } else if (user.role === 'USER') {
              throw redirect({
                to: '/user',
              });
            }
          }
        } else if (response.status === 401) {
          removeAuthToken();
        }
      } catch (error) {
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          error?.status === 307
        ) {
          throw error;
        }
        removeAuthToken();
      }
    }
  },
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
