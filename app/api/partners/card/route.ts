import { NextRequest, NextResponse } from 'next/server';
import { getPartnerFromRequest } from '@/lib/auth';
import { updatePartner } from '@/lib/kv';

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
        card: {
          firstName: partner.firstName,
          lastName: partner.lastName,
          email: partner.email,
          phone: partner.phone || '',
          bio: partner.bio || '',
          title: partner.title || '',
          company: partner.company || '',
          photoUrl: partner.photoUrl || '',
          partnerId: partner.partnerId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Card GET endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, bio, title, company, photoUrl } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'firstName, lastName, and email are required' },
        { status: 400 }
      );
    }

    // Validate bio length
    if (bio && bio.length > 200) {
      return NextResponse.json(
        { error: 'Bio must not exceed 200 characters' },
        { status: 400 }
      );
    }

    // Update partner in KV
    const updated = await updatePartner(partner.id, {
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      bio: bio || undefined,
      title: title || undefined,
      company: company || undefined,
      photoUrl: photoUrl || undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update partner' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Card updated successfully',
        card: {
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          phone: updated.phone || '',
          bio: updated.bio || '',
          title: updated.title || '',
          company: updated.company || '',
          photoUrl: updated.photoUrl || '',
          partnerId: updated.partnerId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Card PUT endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}
