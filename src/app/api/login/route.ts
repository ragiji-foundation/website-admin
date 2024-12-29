import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Add OPTIONS handler to properly handle CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    // Add CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('Environment variables not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders }
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { error: 'Incorrect username or password' },
        { status: 401, headers: corsHeaders }
      );
    }

    const tokenData = await generateToken(username);
    const { jwt, expirationSeconds } = JSON.parse(tokenData);

    const response = NextResponse.json(
      { token: jwt },
      { status: 200, headers: corsHeaders }
    );

    // Set cookie with proper configuration
    response.cookies.set({
      name: "authToken",
      value: jwt,
      httpOnly: true,
      secure: true, // Always use secure in production
      sameSite: 'strict',
      maxAge: expirationSeconds,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

async function generateToken(username: string): Promise<string> {
  const payload = { username };
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  const expirationTime = '1h'; // 1 hour expiration
  const expirationSeconds = 60 * 60; // 1 hour in seconds

  // Generate token with jose's SignJWT class
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(new TextEncoder().encode(secret));

  return JSON.stringify({ jwt, expirationSeconds });
}
