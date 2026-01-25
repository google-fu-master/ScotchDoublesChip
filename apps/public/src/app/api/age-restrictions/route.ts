import { NextRequest, NextResponse } from 'next/server';
import { AgeRestrictionService } from '../../../../shared/services/age-restriction.service';
import {
  PlayerAgeGroup,
  VenueAgeRestriction,
  TableAgeRestriction,
  AgeRestrictionValidation
} from '../../../../shared/types/age-restriction.types';

// Interface for request validation
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
    uniformAgeRestriction?: TableAgeRestriction;
  };
  venue?: {
    id: string;
    name: string;
    ageRestriction: VenueAgeRestriction;
    useVenueAgeForAllTables: boolean;
    minorStartTime?: string;
    minorEndTime?: string;
    ages18To20StartTime?: string;
    ages18To20EndTime?: string;
  };
  ageOverrides?: Array<{
    id: string;
    playerId: string;
    tournamentId: string;
    originalAge: PlayerAgeGroup;
    overrideAge: PlayerAgeGroup;
    createdAt: string;
    expiresAt?: string;
  }>;
}

interface TableAssignmentRequest {
  player: {
    id: string;
    ageGroup: PlayerAgeGroup;
    firstName: string;
    lastName: string;
  };
  table: {
    id: string;
    number: string;
    venueId: string;
    ageRestriction?: TableAgeRestriction;
    isActive: boolean;
  };
  venue: {
    id: string;
    name: string;
    ageRestriction: VenueAgeRestriction;
    useVenueAgeForAllTables: boolean;
  };
  tournament: {
    id: string;
    name: string;
  };
  ageOverrides?: Array<{
    id: string;
    playerId: string;
    tournamentId: string;
    overrideAge: PlayerAgeGroup;
    expiresAt?: string;
  }>;
}

interface TournamentStartRequest {
  tournament: {
    id: string;
    name: string;
    venueId?: string;
    isAgeRestricted: boolean;
    useUniformAgeRestriction?: boolean;
    uniformAgeRestriction?: TableAgeRestriction;
  };
  players: Array<{
    id: string;
    ageGroup: PlayerAgeGroup;
    firstName: string;
    lastName: string;
  }>;
  tables: Array<{
    id: string;
    number: string;
    venueId: string;
    ageRestriction?: TableAgeRestriction;
    isActive: boolean;
  }>;
  venue?: {
    id: string;
    name: string;
    ageRestriction: VenueAgeRestriction;
    useVenueAgeForAllTables: boolean;
  };
  ageOverrides?: Array<{
    id: string;
    playerId: string;
    tournamentId: string;
    overrideAge: PlayerAgeGroup;
    expiresAt?: string;
  }>;
}

// POST /api/age-restrictions/validate-player-eligibility
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const endpoint = url.pathname.split('/').pop();
    
    switch (endpoint) {
      case 'validate-player-eligibility': {
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
            uniformAgeRestriction: data.tournament.uniformAgeRestriction
          },
          data.venue ? {
            id: data.venue.id,
            name: data.venue.name,
            ageRestriction: data.venue.ageRestriction,
            useVenueAgeForAllTables: data.venue.useVenueAgeForAllTables,
            minorStartTime: data.venue.minorStartTime,
            minorEndTime: data.venue.minorEndTime,
            ages18To20StartTime: data.venue.ages18To20StartTime,
            ages18To20EndTime: data.venue.ages18To20EndTime
          } : undefined,
          data.ageOverrides?.map(override => ({
            id: override.id,
            playerId: override.playerId,
            tournamentId: override.tournamentId,
            originalAge: data.player.ageGroup, // Use original from player
            overrideAge: override.overrideAge,
            createdAt: new Date(override.createdAt),
            expiresAt: override.expiresAt ? new Date(override.expiresAt) : undefined
          }))
        );
        
        return NextResponse.json({ 
          success: true, 
          validation 
        });
      }
      
      case 'validate-table-assignment': {
        const data: TableAssignmentRequest = await request.json();
        
        const validation = AgeRestrictionService.validatePlayerTableAssignment(
          data.player,
          data.table,
          data.venue,
          data.tournament,
          data.ageOverrides?.map(override => ({
            id: override.id,
            playerId: override.playerId,
            tournamentId: override.tournamentId,
            originalAge: data.player.ageGroup,
            overrideAge: override.overrideAge,
            createdAt: new Date(),
            expiresAt: override.expiresAt ? new Date(override.expiresAt) : undefined
          }))
        );
        
        return NextResponse.json({ 
          success: true, 
          validation 
        });
      }
      
      case 'validate-tournament-start': {
        const data: TournamentStartRequest = await request.json();
        
        const validation = AgeRestrictionService.validateTournamentStart(
          {
            id: data.tournament.id,
            name: data.tournament.name,
            venueId: data.tournament.venueId,
            isAgeRestricted: data.tournament.isAgeRestricted,
            useUniformAgeRestriction: data.tournament.useUniformAgeRestriction,
            uniformAgeRestriction: data.tournament.uniformAgeRestriction
          },
          data.players,
          data.tables,
          data.venue ? {
            id: data.venue.id,
            name: data.venue.name,
            ageRestriction: data.venue.ageRestriction,
            useVenueAgeForAllTables: data.venue.useVenueAgeForAllTables
          } : undefined,
          data.ageOverrides?.map(override => ({
            id: override.id,
            playerId: override.playerId,
            tournamentId: override.tournamentId,
            originalAge: PlayerAgeGroup.AGES_21_PLUS, // Would need to lookup from DB
            overrideAge: override.overrideAge,
            createdAt: new Date(),
            expiresAt: override.expiresAt ? new Date(override.expiresAt) : undefined
          }))
        );
        
        return NextResponse.json({ 
          success: true, 
          validation 
        });
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid endpoint' },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error('Age restriction validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}