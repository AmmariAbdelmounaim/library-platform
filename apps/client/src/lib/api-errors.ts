import type { ErrorType } from '@/api/axios-instance';

export function getErrorMessage(
  error: ErrorType<unknown> | null | undefined,
): string | null {
  if (!error?.response) {
    return null;
  }

  // Try to extract message from response data if available (NestJS error format)
  const responseData = error.response.data as
    | { message?: string | string[] }
    | undefined;

  if (responseData?.message) {
    // Handle array of messages (validation errors)
    if (Array.isArray(responseData.message)) {
      return responseData.message.join(', ');
    }
    return responseData.message;
  }

  return null;
}
