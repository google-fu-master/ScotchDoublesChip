import { NextRequest, NextResponse } from 'next/server';
import { AgeRestrictionService } from '../../../../../shared/services/age-restriction.service';

interface TableAssignmentRequest {
  player: {
    id: string;
    ageGroup: string;
    firstName: string;
    lastName: string;
  };
  table: {
    id: string;
    number: string;
    venueId: string;
    ageRestriction?: string;
    isActive: boolean;
  };
  venue: {
    id: string;
    name: string;
    ageRestriction: string;
    useVenueAgeForAllTables: boolean;
  };
  tournament: {
    id: string;
    name: string;
  };
  ageOverrides?: any[];
}

export async function POST(request: NextRequest) {
  try {
    const data: TableAssignmentRequest = await request.json();
    
    const validation = AgeRestrictionService.validatePlayerTableAssignment(
      {
        id: data.player.id,
        ageGroup: data.player.ageGroup as any,
        firstName: data.player.firstName,
        lastName: data.player.lastName
      },
      {
        id: data.table.id,
        number: data.table.number,
        venueId: data.table.venueId,
        ageRestriction: data.table.ageRestriction as any,
        isActive: data.table.isActive
      },
      {
        id: data.venue.id,
        name: data.venue.name,
        ageRestriction: data.venue.ageRestriction as any,
        useVenueAgeForAllTables: data.venue.useVenueAgeForAllTables
      },
      {
        id: data.tournament.id,
        name: data.tournament.name,
        isAgeRestricted: false
      },
      data.ageOverrides
    );
    
    return NextResponse.json({ 
      success: true, 
      validation 
    });
  } catch (error) {
    console.error('Table assignment validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}