import { NextRequest, NextResponse } from 'next/server';
import {
  getPartnerLinkById,
  incrementLinkClickCount,
} from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id parameter is required' },
        { status: 400 }
      );
    }

    const link = await getPartnerLinkById(id);

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Increment click count
    await incrementLinkClickCount(id);

    // Build the URL with the invite parameter
    const urlObject = new URL(link.baseUrl);
    urlObject.searchParams.append('invite', link.partnerId);
    const fullUrl = urlObject.toString();

    // Redirect to the actual URL
    return NextResponse.redirect(fullUrl);
  } catch (error) {
    console.error('Click tracking endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to process link click' },
      { status: 500 }
    );
  }
}
