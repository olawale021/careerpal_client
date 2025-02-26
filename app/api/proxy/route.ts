import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error(`❌ GET request failed with status ${response.status}`);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ GET Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '';

  try {
    const formData = await request.formData();
    const fullUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${path}`;
    console.log(`🔗 Attempting POST request to: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    });

    if (!response.ok) {
      console.error(`❌ POST request failed with status ${response.status}`);
      const errorData = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ POST Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
