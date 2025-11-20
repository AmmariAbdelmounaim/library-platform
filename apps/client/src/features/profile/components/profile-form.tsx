import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  getUsersControllerGetCurrentUserQueryKey,
  useUsersControllerGetCurrentUser,
  useUsersControllerUpdate,
} from '@/api/generated/users/users';
import type { UpdateUserDto } from '@/api/generated/model';
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getErrorMessage } from '@/lib/api-errors';
import { profileSchema, type ProfileFormData } from '../lib/schemas';

export function ProfileForm() {
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: userResponse, isLoading: isLoadingUser } =
    useUsersControllerGetCurrentUser({
      query: {
        select: (response) => (response.status === 200 ? response.data : null),
      },
    });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const updateMutation = useUsersControllerUpdate({
    mutation: {
      onSuccess: () => {
        // Invalidate the current user query to refresh the data
        queryClient.invalidateQueries({
          queryKey: getUsersControllerGetCurrentUserQueryKey(),
        });
        // Clear password fields after successful update
        form.resetField('password');
        form.resetField('confirmPassword');
        // Show success message
        setShowSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error);
        toast.error('Failed to update profile', {
          description:
            errorMessage || 'An unexpected error occurred. Please try again.',
        });
      },
    },
  });

  // Populate form with user data when it's loaded
  useEffect(() => {
    if (userResponse) {
      form.reset({
        email: String(userResponse.email) || '',
        firstName: String(userResponse.firstName) || '',
        lastName: String(userResponse.lastName) || '',
        password: '', // Password should not be pre-populated
        confirmPassword: '', // Confirm password should not be pre-populated
      });
    }
  }, [userResponse, form]);

  const onSubmit = (data: ProfileFormData) => {
    if (!userResponse) return;

    // Prepare update payload - only include password if it's provided
    const updateData: {
      email?: string;
      firstName?: string;
      lastName?: string;
      password?: string;
    } = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    };

    // Only include password if it's provided and not empty
    if (data.password && data.password.length > 0) {
      updateData.password = data.password;
    }

    updateMutation.mutate({
      id: userResponse.id,
      data: updateData as unknown as UpdateUserDto,
    });
  };

  const errorMessage = getErrorMessage(updateMutation.error);

  if (isLoadingUser) {
    return (
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardDescription>Loading user profile...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div>
        {errorMessage && (
          <div className="bg-destructive/15 text-destructive mt-2 rounded-md p-3 text-sm">
            {errorMessage}
          </div>
        )}
        {showSuccess && (
          <div className="mt-2 rounded-md bg-green-500/15 p-3 text-sm text-green-700 dark:text-green-400">
            Profile updated successfully!
          </div>
        )}
      </div>
      <div>
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
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Change Password</h3>
              <p className="text-muted-foreground text-sm">
                Leave blank to keep your current password
              </p>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
