import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const data = await request.json();

    // Create tournament with related data
    const tournament = await prisma.tournament.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDateTime),
        endDate: data.endDateTime ? new Date(data.endDateTime) : null,
        venueId: data.venue?.id,
        playerType: data.playerType.toUpperCase(),
        gameType: data.gameType.toUpperCase(),
        tournamentType: data.tournamentType.toUpperCase(),
        raceToWins: data.race,
        estimatedEntrants: data.estimatedPlayers,
        playersPerTable: data.playersPerTable,
        defaultChipsPerPlayer: data.defaultChipsPerPlayer,
        birthdayChip: data.birthdayChip,
        bracketOrdering: data.bracketOrdering.toUpperCase(),
        autopilotMode: data.autopilotMode,
        randomOrderingEachRound: data.randomPlayerOrdering,
        rules: data.rules ? data.rules.toUpperCase() : null,
        ratingSystem: data.ratingSystem ? data.ratingSystem.toUpperCase() : null,
        entryFee: data.entryFee,
        adminFee: data.adminFee,
        addedMoney: data.addedMoney,
        payoutType: data.payoutType.toUpperCase(),
        // Handle payout structure settings
        settings: {
          payoutStructurePlaces: data.payoutStructurePlaces,
          payoutStructurePercentage: data.payoutStructurePercentage
        },
        showSkillLevels: data.showSkillLevels,
        access: data.access.toUpperCase(),
        status: 'SETUP',
        isPublic: data.access === 'public',
        // Create chip ranges
        chipRanges: {
          create: data.chipRanges.map((range: any) => ({
            minRating: range.minRating,
            maxRating: range.maxRating,
            chips: range.chips
          }))
        },
        // Create side pots
        sidePots: {
          create: data.sidePots.map((pot: any) => ({
            name: pot.name,
            entryFee: pot.entryFee,
            description: pot.description,
            amount: pot.entryFee // Initial amount, will be updated as entries come in
          }))
        }
      },
      include: {
        venue: true,
        chipRanges: true,
        sidePots: true
      }
    });

    // Save as template if requested
    if (data.saveAsTemplate && data.templateName) {
      await prisma.tournamentTemplate.create({
        data: {
          name: data.templateName,
          description: `Template created from tournament: ${data.name}`,
          settings: data, // Store the entire form data
          isPublic: false,
          // TODO: Set createdBy when auth is implemented
        }
      });
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}