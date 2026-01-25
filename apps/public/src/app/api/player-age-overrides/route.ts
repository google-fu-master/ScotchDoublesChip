import { NextRequest, NextResponse } from 'next/server';
import { PlayerAgeGroup } from '../../../../../shared/types/age-restriction.types';

interface AgeOverrideRequest {
  playerId: string;
  tournamentId: string;
  overrideAge: PlayerAgeGroup;
  reason?: string;
}

// POST /api/player-age-overrides - Create age override
export async function POST(request: NextRequest) {
  try {
    const data: AgeOverrideRequest = await request.json();
    
    // TODO: Implement database operations
    // This is a mock implementation
    const override = {
      id: 'override_' + Date.now(),
      playerId: data.playerId,
      tournamentId: data.tournamentId,
      originalAge: PlayerAgeGroup.AGES_21_PLUS, // Would lookup from database
      overrideAge: data.overrideAge,
      createdById: 'current_user_id', // Would get from auth
      reason: data.reason,
      createdAt: new Date(),
      expiresAt: null // Set when tournament ends
    };
    
    // TODO: Save to database
    console.log('Creating age override:', override);
    
    return NextResponse.json({ 
      success: true, 
      override 
    });
  } catch (error) {
    console.error('Age override creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// GET /api/player-age-overrides?tournamentId=X - Get overrides for tournament
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tournamentId = url.searchParams.get('tournamentId');
    
    if (!tournamentId) {
      return NextResponse.json(
        { success: false, error: 'Tournament ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Implement database query
    // This is a mock implementation
    const overrides = [
      // Mock data would go here
    ];
    
    return NextResponse.json({ 
      success: true, 
      overrides 
    });
  } catch (error) {
    console.error('Age override fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/player-age-overrides/[overrideId] - Remove age override
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const overrideId = url.pathname.split('/').pop();
    
    if (!overrideId) {
      return NextResponse.json(
        { success: false, error: 'Override ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Implement database deletion
    console.log('Removing age override:', overrideId);
    
    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Age override deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}