import { NextRequest, NextResponse } from 'next/server';
import { getPartnerFromRequest } from '@/lib/auth';
import {
  getProspectsByPartnerId,
  createProspect,
  updateProspect,
  deleteProspect,
} from '@/lib/kv';
import { Prospect } from '@/lib/kv';

// Simple UUID generator
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET /api/prospects
 * Returns all prospects for the authenticated partner
 */
export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prospects = await getProspectsByPartnerId(partner.partnerId);
    return NextResponse.json(prospects);
  } catch (error) {
    console.error('GET /api/prospects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prospects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prospects
 * Creates a new prospect for the authenticated partner
 */
export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, matchPercent, status, notes, erfolg } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const newProspect: Prospect = {
      id: generateId(),
      partnerId: partner.partnerId,
      name,
      matchPercent: matchPercent || undefined,
      status: status || 'informiert',
      notes: notes || undefined,
      erfolg: erfolg || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await createProspect(newProspect);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/prospects error:', error);
    return NextResponse.json(
      { error: 'Failed to create prospect' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/prospects
 * Updates an existing prospect
 */
export async function PUT(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Prospect ID is required' },
        { status: 400 }
      );
    }

    const updated = await updateProspect(id, updates);
    if (!updated) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/prospects error:', error);
    return NextResponse.json(
      { error: 'Failed to update prospect' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prospects
 * Deletes a prospect by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Prospect ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteProspect(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/prospects error:', error);
    return NextResponse.json(
      { error: 'Failed to delete prospect' },
      { status: 500 }
    );
  }
}
