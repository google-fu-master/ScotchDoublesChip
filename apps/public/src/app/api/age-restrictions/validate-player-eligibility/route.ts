import { NextRequest, NextResponse } from 'next/server';
import { AgeRestrictionService } from '../../../../../shared/services/age-restriction.service';
import { PlayerAgeGroup } from '../../../../../shared/types/age-restriction.types';

interface PlayerEligibilityRequest {
  player: {
    id: string;
    ageGroup: PlayerAgeGroup;
    firstName: string;
    lastName: string;
  };
  tournament: {
    id: string;
    name: string;
    venueId?: string;
    startDate?: string;
    isAgeRestricted: boolean;
    useUniformAgeRestriction?: boolean;
    uniformAgeRestriction?: string;
  };
  venue?: {
    id: string;
    name: string;
    ageRestriction: string;
    useVenueAgeForAllTables: boolean;
    minorStartTime?: string;
    minorEndTime?: string;
    ages18To20StartTime?: string;
    ages18To20EndTime?: string;
  };
  ageOverrides?: any[];
}

export async function POST(request: NextRequest) {
  try {
    const data: PlayerEligibilityRequest = await request.json();
    
    const validation = AgeRestrictionService.validatePlayerTournamentEligibility(
      data.player,
      {
        id: data.tournament.id,
        name: data.tournament.name,
        venueId: data.tournament.venueId,
        startDate: data.tournament.startDate ? new Date(data.tournament.startDate) : undefined,
        isAgeRestricted: data.tournament.isAgeRestricted,
        useUniformAgeRestriction: data.tournament.useUniformAgeRestriction,
        uniformAgeRestriction: data.tournament.uniformAgeRestriction as any
      },
      data.venue ? {
        id: data.venue.id,
        name: data.venue.name,
        ageRestriction: data.venue.ageRestriction as any,
        useVenueAgeForAllTables: data.venue.useVenueAgeForAllTables,
        minorStartTime: data.venue.minorStartTime,
        minorEndTime: data.venue.minorEndTime,
        ages18To20StartTime: data.venue.ages18To20StartTime,
        ages18To20EndTime: data.venue.ages18To20EndTime
      } : undefined,
      data.ageOverrides
    );
    
    return NextResponse.json({ 
      success: true, 
      validation 
    });
  } catch (error) {
    console.error('Player eligibility validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}