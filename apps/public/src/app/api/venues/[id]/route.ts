import { NextRequest, NextResponse } from 'next/server';
import { venueManager } from '../../../../lib/venue';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const venue = venueManager.getVenueById(id);
    
    if (!venue) {
      return NextResponse.json(
        { error: 'Venue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      venue
    });
  } catch (error) {
    console.error('Get venue error:', error);
    return NextResponse.json(
      { error: 'Failed to get venue' },
      { status: 500 }
    );
  }
}