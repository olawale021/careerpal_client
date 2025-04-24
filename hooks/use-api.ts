import axiosInstance from '@/lib/axios';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { useCallback, useState } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error | AxiosError) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | AxiosError | null;
  fetch: <R = T>(
    url: string,
    options?: AxiosRequestConfig
  ) => Promise<R>;
  reset: () => void;
}

/**
 * Hook for making API calls with loading and error states
 */
export function useApi<T = unknown>(defaultOptions?: UseApiOptions<T>): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | AxiosError | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  const fetch = useCallback(async <R = T>(
    url: string,
    options?: AxiosRequestConfig
  ): Promise<R> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance({
        url,
        ...options
      });
      
      const responseData = response.data as R;
      
      // For the default type, update state
      if (!options?.responseType) {
        setData(responseData as unknown as T);
      }
      
      // Call onSuccess callback if provided
      if (defaultOptions?.onSuccess) {
        defaultOptions.onSuccess(responseData as unknown as T);
      }
      
      setLoading(false);
      return responseData;
    } catch (err) {
      const error = err as Error | AxiosError;
      setError(error);
      
      // Call onError callback if provided
      if (defaultOptions?.onError) {
        defaultOptions.onError(error);
      }
      
      setLoading(false);
      throw error;
    }
  }, [defaultOptions]);

  return {
    data,
    loading,
    error,
    fetch,
    reset
  };
}

export default useApi; 