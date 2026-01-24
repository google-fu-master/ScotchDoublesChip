import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const data = await request.json();

    const template = await prisma.tournamentTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        settings: data.settings,
        isPublic: data.isPublic || false,
        // TODO: Set createdBy when auth is implemented
        // createdBy: userId
      }
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating tournament template:', error);
    return NextResponse.json(
      { error: 'Failed to create tournament template' },
      { status: 500 }
    );
  }
}