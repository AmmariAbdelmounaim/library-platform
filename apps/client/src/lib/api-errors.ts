import type { ErrorType } from '@/api/axios-instance';

/**
 * Extract error message from API error response
 * Handles NestJS error format and validation errors
 * 
 * @param error - The error from the API call
 * @returns The error message string, or null if no message can be extracted
 */
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

