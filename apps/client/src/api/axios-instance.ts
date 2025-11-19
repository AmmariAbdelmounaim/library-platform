import axios, { AxiosError } from 'axios';

// Create a custom axios instance with default configuration
// Matches Orval's expected signature: (url: string, options?: RequestInit) => Promise<T>
export const customInstance = <T>(
  config: string,
  options?: RequestInit,
): Promise<T> => {
  const source = axios.CancelToken.source();

  // Convert RequestInit to axios format
  const axiosConfig = {
    url: config,
    method: options?.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    headers: options?.headers as Record<string, string> | undefined,
    data: options?.body,
  };

  const promise = axios({
    ...axiosConfig,
    cancelToken: source.token,
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  }).then((response) => {
    // Orval expects a response object with data, status, and headers
    // Convert axios headers to Web API Headers format
    const headers = new Headers();
    Object.entries(response.headers).forEach(([key, value]) => {
      if (value) {
        headers.set(
          key,
          Array.isArray(value) ? value.join(', ') : String(value),
        );
      }
    });

    return {
      data: response.data,
      status: response.status,
      headers,
    } as T;
  });

  // @ts-expect-error - cancel is added dynamically for React Query cancellation
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

// Default instance for direct axios usage if needed
export default customInstance;

// Error handling type
export type ErrorType<Error> = AxiosError<Error>;
