import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { PlayerAgeGroup } from '../../../../shared/types/age-restriction.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const ageGroup = searchParams.get('ageGroup');
    
    const where: any = {};
    
    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    if (ageGroup && Object.values(PlayerAgeGroup).includes(ageGroup as PlayerAgeGroup)) {
      where.ageGroup = ageGroup;
    }
    
    const players = await prisma.player.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        ageGroup: true,
        birthdayMonth: true,
        birthdayDay: true,
        lastBirthdayChip: true,
        fargoRating: true,
        apaEightBallRank: true,
        apaNineBallRank: true,
        inHouseRating: true,
        createdAt: true,
        tournamentProfiles: {
          select: {
            id: true,
            tournamentId: true,
            displayName: true,
            skillLevel: true,
            registrationStatus: true
          }
        }
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    });

    return NextResponse.json({
      success: true,
      players,
      count: players.length
    });
  } catch (error) {
    console.error('Player search error:', error);
    return NextResponse.json(
      { error: 'Failed to search players' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const playerData = await request.json();

    // Validate required fields
    const required = ['email', 'firstName', 'lastName'];
    const missing = required.filter((field: string) => !playerData[field]);
    
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(playerData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate age group
    if (playerData.ageGroup && !Object.values(PlayerAgeGroup).includes(playerData.ageGroup)) {
      return NextResponse.json(
        { error: 'Invalid age group value' },
        { status: 400 }
      );
    }

    // Validate birthday month/day if provided
    if (playerData.birthdayMonth && (playerData.birthdayMonth < 1 || playerData.birthdayMonth > 12)) {
      return NextResponse.json(
        { error: 'Birthday month must be between 1 and 12' },
        { status: 400 }
      );
    }
    
    if (playerData.birthdayDay && (playerData.birthdayDay < 1 || playerData.birthdayDay > 31)) {
      return NextResponse.json(
        { error: 'Birthday day must be between 1 and 31' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingPlayer = await prisma.player.findUnique({
      where: { email: playerData.email }
    });
    
    if (existingPlayer) {
      return NextResponse.json(
        { error: 'A player with this email already exists' },
        { status: 409 }
      );
    }

    // Create the player in database
    const player = await prisma.player.create({
      data: {
        email: playerData.email,
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        phone: playerData.phone || null,
        ageGroup: playerData.ageGroup || PlayerAgeGroup.AGES_21_PLUS,
        birthdayMonth: playerData.birthdayMonth || null,
        birthdayDay: playerData.birthdayDay || null,
        fargoRating: playerData.fargoRating || null,
        apaEightBallRank: playerData.apaEightBallRank || null,
        apaNineBallRank: playerData.apaNineBallRank || null,
        inHouseRating: playerData.inHouseRating || null,
        settings: playerData.settings || null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        ageGroup: true,
        birthdayMonth: true,
        birthdayDay: true,
        fargoRating: true,
        apaEightBallRank: true,
        apaNineBallRank: true,
        inHouseRating: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      player
    });
  } catch (error) {
    console.error('Player creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    );
  }
}