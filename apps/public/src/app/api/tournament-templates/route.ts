import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TournamentTemplateCreateSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.tournamentTemplate.findMany({
      where: {
        OR: [
          { isPublic: true },
          // TODO: Filter by user ownership when auth is implemented
          // { createdBy: userId }
        ]
      },
      orderBy: [
        { usageCount: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching tournament templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = TournamentTemplateCreateSchema.parse(body);

    const template = await prisma.tournamentTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        settings: validatedData.settings,
        isPublic: validatedData.isPublic,
        // TODO: Set createdBy when auth is implemented
        // createdBy: userId
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating tournament template:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create tournament template' },
      { status: 500 }
    );
  }
}