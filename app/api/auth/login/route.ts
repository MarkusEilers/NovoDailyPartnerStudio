import { NextRequest, NextResponse } from 'next/server';
import { getPartnerByEmail } from '@/lib/kv';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find partner by email
    const partner = await getPartnerByEmail(email);
    if (!partner) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is approved
    if (!partner.approved) {
      return NextResponse.json(
        { error: 'Dein Account wurde noch nicht freigeschaltet' },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await verifyPassword(password, partner.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = createToken(partner);

    // Create response with session cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        partner: {
          id: partner.id,
          partnerId: partner.partnerId,
          firstName: partner.firstName,
          lastName: partner.lastName,
          email: partner.email,
          isAdmin: partner.isAdmin || false,
        },
      },
      { status: 200 }
    );

    // Set httpOnly cookie
    response.cookies.set('ndps-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
