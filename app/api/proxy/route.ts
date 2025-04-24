import { NextRequest, NextResponse } from 'next/server';

// Helper to forward cookies from client to backend
function forwardCookies(request: NextRequest, initialHeaders: Record<string, string> = {}): Record<string, string> {
  const cookieHeader = request.headers.get('cookie');
  const newHeaders: Record<string, string> = { ...initialHeaders };
  
  if (cookieHeader) {
    newHeaders['cookie'] = cookieHeader;
  }
  
  return newHeaders;
}

// Forward cookies
function prepareHeaders(request: NextRequest, contentType: string | null = null): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Forward content type if specified
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  // Forward CSRF token if present in headers
  const csrfToken = request.headers.get('X-CSRF-Token');
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  // Log headers for debugging
  console.log('Forwarding headers:', { 
    ...headers, 
    'X-CSRF-Token': csrfToken ? '(token present)' : '(no token)',
    cookie: request.headers.get('cookie') ? '(cookie present)' : '(no cookie)' 
  });
  
  return forwardCookies(request, headers);
}

// Helper to forward Set-Cookie headers
function forwardSetCookieHeaders(response: Response, responseHeaders: Headers): Headers {
  // Forward Set-Cookie headers from backend to client
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    // Split multiple cookies and add them individually
    setCookieHeader.split(',').forEach(cookie => {
      responseHeaders.append('Set-Cookie', cookie.trim());
    });
  }
  
  return responseHeaders;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';

  try {
    // Prepare headers with cookies forwarded
    const headers = prepareHeaders(request, 'application/json');
    
    // Extract authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Construct the full URL, preserving any query parameters that are part of the path
    const fullUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;
    console.log(`🔗 Attempting GET request to: ${fullUrl}`);
    console.log(`📤 Sending headers:`, Object.keys(headers));
    
    const response = await fetch(fullUrl, {
      headers,
      credentials: 'include',
    });

    // Handle cookies from the response
    const responseHeaders = new Headers();
    forwardSetCookieHeaders(response, responseHeaders);

    if (!response.ok) {
      console.error(`❌ GET request failed with status ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch data' }, 
        { status: response.status, headers: responseHeaders }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error) {
    console.error('❌ GET Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';

  try {
    // Get the original content type from the request
    const contentType = request.headers.get('content-type') || '';
    const fullUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;
    console.log(`🔗 Attempting POST request to: ${fullUrl}`);
    console.log('📋 Original Content-Type:', contentType);
    
    // Prepare headers with cookies forwarded
    const headers: Record<string, string> = {
      Accept: 'application/json',
      // Forward other headers
      ...prepareHeaders(request),
    };
    
    // Extract authorization header if present and forward it
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('📤 Forwarding Authorization header');
    }
    
    // Clone the request for later use if needed
    const requestClone = request.clone();
    let body: FormData | string | null = null;
    
    // First, check if the request appears to be a JSON request based on content type
    if (contentType.includes('application/json')) {
      try {
        // For JSON, set the proper Content-Type
        headers['Content-Type'] = 'application/json';
        const jsonData = await request.json();
        console.log('📦 JSON data:', JSON.stringify(jsonData).substring(0, 200) + '...');
        body = JSON.stringify(jsonData);
      } catch (jsonError) {
        console.error('❌ Error parsing JSON request body:', jsonError);
        throw new Error('Failed to parse JSON request body');
      }
    }
    // Next, check if it's a multipart/form-data request
    else if (contentType.includes('multipart/form-data')) {
      try {
        // For FormData, don't set Content-Type header - let fetch set it with boundary
        delete headers['Content-Type'];
        body = await request.formData();
        
        // Log FormData entries for debugging
        console.log('📦 FormData entries:');
        let hasEntries = false;
        for (const pair of body.entries()) {
          hasEntries = true;
          const value = pair[1];
          // Safely log file objects without accessing properties that might not exist
          const displayValue = typeof value === 'object' && value !== null 
            ? `[File or Blob: ${(value as File).name || 'unnamed'}]` 
            : String(value).substring(0, 50);
          console.log(`- ${pair[0]}: ${displayValue}`);
        }
        
        if (!hasEntries) {
          console.warn('⚠️ FormData appears to be empty!');
        }
      } catch (formError) {
        console.error('❌ Error processing FormData:', formError);
        throw new Error('Failed to process form data');
      }
    } 
    // If no match, try to read as form data anyway as a fallback
    else {
      try {
        console.log('⚠️ Unrecognized content type. Trying to parse as FormData...');
        delete headers['Content-Type']; // Let fetch set the correct boundary
        body = await requestClone.formData();
        console.log('📦 Successfully parsed as FormData');
      } catch (fallbackError) {
        // If all else fails, try reading as text
        console.error('❌ Failed to parse as FormData:', fallbackError);
        try {
          console.log('⚠️ Trying to read as text...');
          body = await requestClone.text();
          if (body) {
            console.log('📦 Got text body of length:', body.length);
            // If it might be JSON, set the appropriate content type
            if (body.trim().startsWith('{') || body.trim().startsWith('[')) {
              headers['Content-Type'] = 'application/json';
            } else {
              headers['Content-Type'] = 'text/plain';
            }
          } else {
            console.warn('⚠️ Empty body detected');
            body = '';
          }
        } catch (textError) {
          console.error('❌ Failed to read request body:', textError);
          throw new Error('Failed to read request body');
        }
      }
    }
    
    // Ensure we have a body to send
    if (body === null) {
      console.error('❌ Could not determine request body format');
      throw new Error('Failed to process request body');
    }
    
    // Final log of headers we're sending
    console.log('📤 Sending headers:', Object.keys(headers));
    console.log('📤 Request method:', 'POST');
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body,
      credentials: 'include',
    });

    // Handle cookies from the response
    const responseHeaders = new Headers();
    forwardSetCookieHeaders(response, responseHeaders);

    if (!response.ok) {
      console.error(`❌ POST request failed with status ${response.status}`);
      const errorText = await response.text();
      let errorData;
      try {
        // Try to parse as JSON, but be forgiving if it's just text
        errorData = errorText && errorText.trim().startsWith('{') 
          ? JSON.parse(errorText)
          : { error: errorText || 'Unknown error' };
        console.error('🔄 Error response data:', errorData);
      } catch {
        errorData = { error: errorText || 'Unknown error' };
        console.error('🔄 Error response text:', errorText);
      }
      return NextResponse.json(errorData, { status: response.status, headers: responseHeaders });
    }

    // Handle both JSON and text responses
    const contentTypeResponse = response.headers.get('content-type') || '';
    let data;
    
    if (contentTypeResponse.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // Try to convert text to JSON if it looks like JSON
      try {
        if (text && text.trim().startsWith('{')) {
          data = JSON.parse(text);
        } else {
          data = { data: text };
        }
      } catch {
        data = { data: text };
      }
    }
    
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error) {
    console.error('❌ POST Proxy Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process request',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// Handle PUT requests
export async function PUT(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';

  try {
    const body = await request.json();
    const fullUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;
    console.log(`🔗 Attempting PUT request to: ${fullUrl}`);

    // Prepare headers with cookies forwarded
    const headers = prepareHeaders(request, 'application/json');
    
    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    // Handle cookies from the response
    const responseHeaders = new Headers();
    forwardSetCookieHeaders(response, responseHeaders);

    if (!response.ok) {
      console.error(`❌ PUT request failed with status ${response.status}`);
      const errorData = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
      return NextResponse.json(errorData, { status: response.status, headers: responseHeaders });
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error) {
    console.error('❌ PUT Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Handle DELETE requests
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';

  try {
    const fullUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;
    console.log(`🔗 Attempting DELETE request to: ${fullUrl}`);

    // Prepare headers with cookies forwarded
    const headers = prepareHeaders(request, 'application/json');
    
    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    // Handle cookies from the response
    const responseHeaders = new Headers();
    forwardSetCookieHeaders(response, responseHeaders);

    if (!response.ok) {
      console.error(`❌ DELETE request failed with status ${response.status}`);
      const errorData = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
      return NextResponse.json(errorData, { status: response.status, headers: responseHeaders });
    }

    const data = await response.json();
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error) {
    console.error('❌ DELETE Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
