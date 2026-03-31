import { NextRequest, NextResponse } from 'next/server';
import { getPartnerFromRequest } from '@/lib/auth';
import { getPartners, updatePartner, deletePartner } from '@/lib/kv';

/**
 * GET /api/admin/partners
 * Returns all partners (requires admin session)
 */
export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!partner.isAdmin || !partner.approved) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const allPartners = await getPartners();
    return NextResponse.json(allPartners);
  } catch (error) {
    console.error('GET /api/admin/partners error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/partners
 * Updates a partner (approve, grant admin, etc.) - requires admin
 */
export async function PATCH(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!partner.isAdmin || !partner.approved) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, approved, isAdmin, partnerId, firstName, lastName, email, phone, bio, title, company } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (approved !== undefined) updates.approved = approved;
    if (isAdmin !== undefined) updates.isAdmin = isAdmin;
    if (partnerId !== undefined) updates.partnerId = partnerId;
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (title !== undefined) updates.title = title;
    if (company !== undefined) updates.company = company;

    const updated = await updatePartner(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/admin/partners error:', error);
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/partners
 * Deletes a partner - requires admin
 */
export async function DELETE(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);

    if (!partner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!partner.isAdmin || !partner.approved) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Partner ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deletePartner(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/partners error:', error);
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
