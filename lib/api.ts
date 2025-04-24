import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { addCsrfHeader } from './csrf';

const API_BASE = '/api/proxy';

// Create base axios instance
const apiClient = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  withCredentials: true, // Always include cookies
});

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  params?: Record<string, string>;
  _isRetry?: boolean; // Add internal property for retry logic
  body?: FormData | string | null; // Add body property for FormData
}

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Just pass through the error
    return Promise.reject(error);
  }
);

// Define a response error interface
interface ResponseError {
  error?: string;
  message?: string;
  status?: number;
  [key: string]: unknown;
}

export async function fetchApi<T = unknown>(
  endpoint: string, 
  options: ExtendedAxiosRequestConfig = {}
): Promise<T> {
  try {
    const { params, body, ...axiosOptions } = options;
    
    // Build URL with query parameters
    const url = `${API_BASE}?path=${endpoint}`;
    
    // Add additional query parameters
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
    }
    
    // Add CSRF token header for mutation requests
    let headersObj: Record<string, string> = {};
    
    // Convert existing headers to string values
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          headersObj[key] = String(value);
        }
      });
    }
    
    // Add CSRF header for mutation requests
    if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
      headersObj = addCsrfHeader(headersObj);
    }
    
    // Special handling for FormData
    const isFormData = body instanceof FormData || options.data instanceof FormData;
    
    // Log request details for debugging
    console.log('Request Details:', {
      url,
      method: options.method || 'GET',
      headers: Object.keys(headersObj),
      hasData: body ? true : options.data ? true : false,
      dataType: body 
        ? (body instanceof FormData ? 'FormData' : typeof body) 
        : options.data 
        ? (isFormData ? 'FormData' : typeof options.data) 
        : 'none',
    });

    // Don't set Content-Type for FormData, let browser set it with boundary
    if (isFormData && headersObj['Content-Type']) {
      delete headersObj['Content-Type'];
    }

    // Make request with body or data
    const response = await apiClient({
      url,
      ...axiosOptions,
      data: body || options.data, // Use body if provided, otherwise use data
      headers: headersObj,
      params: queryParams.toString() ? Object.fromEntries(queryParams) : undefined,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Improved error logging
      const status = error.response?.status;
      const responseData = error.response?.data as ResponseError | string | undefined;
      
      console.error(`API call error [${status}]:`, responseData || error.message);
      
      // Format error message for easier debugging
      let errorMsg: string;
      if (responseData && typeof responseData === 'object' && ('error' in responseData || 'message' in responseData)) {
        // Handle structured error response
        const errorMessage = responseData.error || responseData.message || 'Unknown API error';
        errorMsg = `API call failed: ${errorMessage}`;
      } else if (typeof responseData === 'string') {
        // Handle string error
        errorMsg = `API call failed: ${responseData}`;
      } else {
        // Generic error
        errorMsg = `API call failed: ${error.message}`;
      }
      
      throw new Error(errorMsg);
    }
    
    console.error('API call error:', error);
    throw error;
  }
}