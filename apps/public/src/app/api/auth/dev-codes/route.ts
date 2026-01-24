import { NextRequest, NextResponse } from 'next/server';
import { verificationManager } from '../../../../lib/verification';

// Development endpoint to view active verification codes
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const activeCodes = verificationManager.listActiveCodes();
    
    return NextResponse.json({
      success: true,
      activeCodes,
      count: activeCodes.length,
      note: 'This endpoint is only available in development mode'
    });

  } catch (error) {
    console.error('Dev codes error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}