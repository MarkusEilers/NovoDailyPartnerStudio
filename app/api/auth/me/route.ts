import { NextRequest, NextResponse } from 'next/server';
import { getPartnerFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        partner: {
          id: partner.id,
          partnerId: partner.partnerId,
          firstName: partner.firstName,
          lastName: partner.lastName,
          email: partner.email,
          phone: partner.phone,
          photoUrl: partner.photoUrl,
          bio: partner.bio,
          title: partner.title,
          company: partner.company,
          isAdmin: partner.isAdmin || false,
          approved: partner.approved,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Me endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
