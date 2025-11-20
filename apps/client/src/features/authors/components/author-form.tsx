import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { authorSchema, type AuthorFormData } from '../lib/schemas';

export interface AuthorFormProps {
  defaultValues?: Partial<AuthorFormData>;
  onSubmit: (data: AuthorFormData) => void;
  isLoading?: boolean;
  submitButtonText?: string;
}

export function AuthorForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitButtonText = 'Submit',
}: AuthorFormProps) {
  const form = useForm<AuthorFormData>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      deathDate: '',
      ...defaultValues,
    },
  });

  // Update form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        firstName: defaultValues.firstName || '',
        lastName: defaultValues.lastName || '',
        birthDate: defaultValues.birthDate || '',
        deathDate: defaultValues.deathDate || '',
      });
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter first name"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Author's first name (optional)</FormDescription>
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
                <Input
                  placeholder="Enter last name"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>Author's last name (required)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birth Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Author's birth date (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deathDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Death Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>Author's death date (optional)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
