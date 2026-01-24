import { NextRequest, NextResponse } from 'next/server';
import { verificationManager } from '../../../../lib/verification';
import { VerifyCodeSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, code } = VerifyCodeSchema.parse(body);

    if (!contact || !code) {
      return NextResponse.json(
        { error: 'Contact and verification code are required' },
        { status: 400 }
      );
    }

    // Verify the code
    const result = verificationManager.verifyCode(contact, code);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          attemptsLeft: result.attemptsLeft
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification successful'
    });

  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}