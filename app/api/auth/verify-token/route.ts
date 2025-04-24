import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get the token from the request
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // If no token is found, return 401
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token found' },
        { status: 401 }
      );
    }
    
    // Check if the token is valid
    const isValid = token.jwt && token.exp && (token.exp as number) > Math.floor(Date.now() / 1000);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Unauthorized: Token is invalid or expired' },
        { status: 401 }
      );
    }
    
    // Return success
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Error verifying token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 