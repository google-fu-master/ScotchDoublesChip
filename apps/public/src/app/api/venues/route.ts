import { NextRequest, NextResponse } from 'next/server';
import { venueManager } from '../../../lib/venue';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location');

    if (query) {
      const venues = venueManager.searchVenues(query, location || undefined);
      return NextResponse.json({
        success: true,
        venues,
        count: venues.length
      });
    } else {
      const venues = venueManager.getAllVenues();
      return NextResponse.json({
        success: true,
        venues,
        count: venues.length
      });
    }
  } catch (error) {
    console.error('Venue search error:', error);
    return NextResponse.json(
      { error: 'Failed to search venues' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const venueData = await request.json();

    // Validate required fields
    const required = ['name', 'address', 'city', 'state', 'zipCode'];
    const missing = required.filter(field => !venueData[field]);
    
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const venue = venueManager.createVenue(venueData);
    
    return NextResponse.json({
      success: true,
      venue,
      message: 'Venue created successfully'
    });

  } catch (error) {
    console.error('Create venue error:', error);
    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    );
  }
}