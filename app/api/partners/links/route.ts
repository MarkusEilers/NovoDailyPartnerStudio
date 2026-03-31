import { NextRequest, NextResponse } from 'next/server';
import { getPartnerFromRequest } from '@/lib/auth';
import {
  getPartnerLinksByPartnerId,
  createPartnerLink,
  deletePartnerLink,
} from '@/lib/kv';
import { PartnerLink } from '@/lib/kv';
import { randomUUID } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const links = await getPartnerLinksByPartnerId(partner.partnerId);

    return NextResponse.json(
      {
        links,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Links GET endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, label, baseUrl } = body;

    // Validate required fields
    if (!type || !label || !baseUrl) {
      return NextResponse.json(
        { error: 'type, label, and baseUrl are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['masterclass', 'shop', 'product', 'custom'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: masterclass, shop, product, custom' },
        { status: 400 }
      );
    }

    // Validate label length
    if (label.length > 100) {
      return NextResponse.json(
        { error: 'Label must not exceed 100 characters' },
        { status: 400 }
      );
    }

    // Build the full URL with invite parameter
    const urlObject = new URL(baseUrl);
    urlObject.searchParams.append('invite', partner.partnerId);
    const fullUrl = urlObject.toString();

    // Create new link
    const newLink: PartnerLink = {
      id: randomUUID(),
      partnerId: partner.partnerId,
      type,
      label,
      baseUrl,
      clickCount: 0,
      createdAt: new Date().toISOString(),
    };

    const created = await createPartnerLink(newLink);

    return NextResponse.json(
      {
        message: 'Link created successfully',
        link: {
          ...created,
          fullUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Links POST endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const partner = await getPartnerFromRequest(request);

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const success = await deletePartnerLink(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Link deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Links DELETE endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}
