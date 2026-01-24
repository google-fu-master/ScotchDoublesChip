import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TournamentCreateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        venue: true,
        sidePots: true,
        chipRanges: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = TournamentCreateSchema.parse(body);

    // Create tournament data object
    const tournamentData: any = {
      name: validatedData.name,
      description: validatedData.description,
      startDate: new Date(validatedData.startDateTime),
      endDate: validatedData.endDateTime ? new Date(validatedData.endDateTime) : null,
      playerType: validatedData.playerType.toUpperCase() as any,
      gameType: validatedData.gameType.toUpperCase() as any,
      tournamentType: 'CHIP' as any,
      raceToWins: validatedData.race,
      estimatedEntrants: validatedData.estimatedPlayers,
      playersPerTable: validatedData.playersPerTable,
      defaultChipsPerPlayer: validatedData.defaultChipsPerPlayer,
      birthdayChip: validatedData.birthdayChip,
      bracketOrdering: validatedData.bracketOrdering.toUpperCase() as any,
      autopilotMode: validatedData.autopilotMode,
      randomOrderingEachRound: validatedData.randomPlayerOrdering,
      rules: validatedData.rules ? validatedData.rules.toUpperCase() as any : null,
      ratingSystem: validatedData.ratingSystem ? validatedData.ratingSystem.toUpperCase() as any : null,
      entryFee: validatedData.entryFee,
      adminFee: validatedData.adminFee,
      addedMoney: validatedData.addedMoney,
      payoutType: validatedData.payoutType.toUpperCase() as any,
      // Handle payout structure settings
      settings: {
        payoutStructurePlaces: validatedData.payoutStructurePlaces,
        payoutStructurePercentage: validatedData.payoutStructurePercentage
      },
      showSkillLevels: validatedData.showSkillLevels,
      access: validatedData.access.toUpperCase() as any,
      status: 'SETUP' as any,
      isPublic: validatedData.access === 'public',
      // Create chip ranges
      chipRanges: {
        create: validatedData.chipRanges.map((range: any) => ({
          minRating: range.minRating,
          maxRating: range.maxRating,
          chips: range.chips
        }))
      },
      // Create side pots
      sidePots: {
        create: validatedData.sidePots.map((pot: any) => ({
          name: pot.name,
          entryFee: pot.entryFee,
          description: pot.description,
          amount: pot.amount,
          criteria: pot.criteria ? { type: pot.criteria } : {} // Convert string to JSON object
        }))
      }
    };

    // Add venue connection if provided
    if (validatedData.venue && validatedData.venue.id) {
      tournamentData.venue = {
        connect: { id: validatedData.venue.id }
      };
    }

    // Create tournament with related data
    const tournament = await prisma.tournament.create({
      data: tournamentData,
      include: {
        venue: true,
        chipRanges: true,
        sidePots: true
      }
    });

    // Save as template if requested
    if (validatedData.saveAsTemplate && validatedData.templateName) {
      await prisma.tournamentTemplate.create({
        data: {
          name: validatedData.templateName,
          description: `Template created from tournament: ${validatedData.name}`,
          settings: validatedData, // Store the entire validated form data
          isPublic: false,
          // TODO: Set createdBy when auth is implemented
        }
      });
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error('Error creating tournament:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}