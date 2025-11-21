import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuthControllerLogin } from '@/api/generated/auth/auth';
import { loginSchema, type LoginFormData } from '../lib/schemas';
import { setAuthToken } from '../lib/auth-storage';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getErrorMessage } from '@/lib/api-errors';

export function LoginForm() {
  const navigate = useNavigate();
  const loginMutation = useAuthControllerLogin({
    mutation: {
      onSuccess: (response) => {
        // Check if the response is successful (status 200)
        if (response.status === 200) {
          const { accessToken, user } = response.data;
          // Store JWT token in localStorage
          setAuthToken(accessToken);
          // Navigate based on user role
          if (user.role === 'ADMIN') {
            navigate({ to: '/admin' });
          } else {
            navigate({ to: '/user' });
          }
        }
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        toast.error('Failed to sign in', {
          description:
            errorMessage || 'Invalid email or password. Please try again.',
        });
      },
    },
  });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate({ data });
  };

  const errorMessage = getErrorMessage(loginMutation.error);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Enter your email and password to sign in to your account
        </CardDescription>
        {errorMessage && (
          <div className="bg-destructive/15 text-destructive mt-2 rounded-md p-3 text-sm">
            {errorMessage}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
