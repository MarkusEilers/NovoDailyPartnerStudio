import { NextRequest, NextResponse } from 'next/server';
import { createPartner, getPartnerByEmail, getPartnerByPartnerId } from '@/lib/kv';
import { hashPassword } from '@/lib/auth';

// Simple UUID generator
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const PARTNER_ID_REGEX = /^NP[A-Z]{2}\d{4}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, firstName, lastName, email, password } = body;

    // Validation
    if (!partnerId || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate partner ID format
    if (!PARTNER_ID_REGEX.test(partnerId)) {
      return NextResponse.json(
        { error: 'Invalid partner ID format. Expected format: NPXX0000 (e.g., NPDE1234)' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await getPartnerByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if partner ID already exists
    const existingPartnerId = await getPartnerByPartnerId(partnerId);
    if (existingPartnerId) {
      return NextResponse.json(
        { error: 'Partner ID already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create partner
    const newPartner = await createPartner({
      id: generateId(),
      partnerId,
      firstName,
      lastName,
      email,
      passwordHash,
      approved: false,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message: 'Registration successful. Your account is pending admin approval.',
        partner: {
          id: newPartner.id,
          partnerId: newPartner.partnerId,
          firstName: newPartner.firstName,
          lastName: newPartner.lastName,
          email: newPartner.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
