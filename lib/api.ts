const API_BASE = '/api/proxy';

interface ExtendedRequestInit extends RequestInit {
  params?: Record<string, string>;
}

export async function fetchApi(endpoint: string, options: ExtendedRequestInit = {}) {
  try {
    const isFormData = options.body instanceof FormData;
    const { params, ...fetchOptions } = options;
    
    // Build URL with query parameters
    const url = new URL(API_BASE, window.location.origin);
    url.searchParams.append('path', endpoint);
    
    // Add any additional query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    // Log the request details for debugging
    console.log('Request Details:', {
      url: url.toString(),
      method: options.method,
      headers: options.headers,
      body: options.body,
    });

    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response Error:', errorText);
      throw new Error(`API call failed: ${errorText}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      throw new Error('Expected JSON response');
    }
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}