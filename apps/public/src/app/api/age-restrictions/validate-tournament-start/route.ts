import { NextRequest, NextResponse } from 'next/server';
import { AgeRestrictionService } from '../../../../../shared/services/age-restriction.service';

interface TournamentStartRequest {
  tournament: {
    id: string;
    name: string;
    venueId?: string;
    isAgeRestricted: boolean;
    useUniformAgeRestriction?: boolean;
    uniformAgeRestriction?: string;
  };
  players: Array<{
    id: string;
    ageGroup: string;
    firstName: string;
    lastName: string;
  }>;
  tables: Array<{
    id: string;
    number: string;
    venueId: string;
    ageRestriction?: string;
    isActive: boolean;
  }>;
  venue?: {
    id: string;
    name: string;
    ageRestriction: string;
    useVenueAgeForAllTables: boolean;
  };
  ageOverrides?: any[];
}

export async function POST(request: NextRequest) {
  try {
    const data: TournamentStartRequest = await request.json();
    
    const validation = AgeRestrictionService.validateTournamentStart(
      {
        id: data.tournament.id,
        name: data.tournament.name,
        venueId: data.tournament.venueId,
        isAgeRestricted: data.tournament.isAgeRestricted,
        useUniformAgeRestriction: data.tournament.useUniformAgeRestriction,
        uniformAgeRestriction: data.tournament.uniformAgeRestriction as any
      },
      data.players.map(p => ({
        id: p.id,
        ageGroup: p.ageGroup as any,
        firstName: p.firstName,
        lastName: p.lastName
      })),
      data.tables.map(t => ({
        id: t.id,
        number: t.number,
        venueId: t.venueId,
        ageRestriction: t.ageRestriction as any,
        isActive: t.isActive
      })),
      data.venue ? {
        id: data.venue.id,
        name: data.venue.name,
        ageRestriction: data.venue.ageRestriction as any,
        useVenueAgeForAllTables: data.venue.useVenueAgeForAllTables
      } : undefined,
      data.ageOverrides
    );
    
    return NextResponse.json({ 
      success: true, 
      validation 
    });
  } catch (error) {
    console.error('Tournament start validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}