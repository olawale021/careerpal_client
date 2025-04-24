/**
 * CSRF protection utilities for the client
 */

// Get the CSRF token from cookies
export function getCsrfToken(): string | undefined {
  // Make sure we're running in the browser
  if (typeof document === 'undefined') return undefined;
  
  // Parse cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies['csrf_token'];
}

// Add CSRF token to headers for mutation requests
export function addCsrfHeader(headers: Record<string, string> = {}): Record<string, string> {
  const token = getCsrfToken();
  if (token) {
    return {
      ...headers,
      'X-CSRF-Token': token,
    };
  }
  return headers;
} 