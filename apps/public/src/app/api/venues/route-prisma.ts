import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { VenueAgeRestriction } from '../../../../shared/types/age-restriction.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    let venues;
    
    if (query) {
      // Search venues by name, address, or city
      venues = await prisma.venue.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } },
          ]
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          tables: {
            select: {
              id: true,
              number: true,
              ageRestriction: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });
    } else {
      // Get all venues
      venues = await prisma.venue.findMany({
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          tables: {
            select: {
              id: true,
              number: true,
              ageRestriction: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json({
      success: true,
      venues,
      count: venues.length
    });
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
    const required = ['name', 'address', 'totalTables'];
    const missing = required.filter((field: string) => !venueData[field]);
    
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate age restriction enum
    if (venueData.ageRestriction && !Object.values(VenueAgeRestriction).includes(venueData.ageRestriction)) {
      return NextResponse.json(
        { error: 'Invalid age restriction value' },
        { status: 400 }
      );
    }

    // Create the venue in database
    const venue = await prisma.venue.create({
      data: {
        name: venueData.name,
        address: venueData.address,
        phone: venueData.phone || null,
        email: venueData.email || null,
        ageRestriction: venueData.ageRestriction || VenueAgeRestriction.MINORS_ALLOWED_ALL_DAY,
        minorStartTime: venueData.minorStartTime || null,
        minorEndTime: venueData.minorEndTime || null,
        ages18To20StartTime: venueData.ages18To20StartTime || null,
        ages18To20EndTime: venueData.ages18To20EndTime || null,
        useVenueAgeForAllTables: venueData.useVenueAgeForAllTables ?? true,
        totalTables: parseInt(venueData.totalTables),
        ownerId: venueData.ownerId || null,
        createdById: venueData.createdById || null,
        settings: venueData.settings || null
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      venue
    });
  } catch (error) {
    console.error('Venue creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    );
  }
}
    
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