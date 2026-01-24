import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '../../../../lib/email';
import { verificationManager } from '../../../../lib/verification';
import { SendCodeSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact, method } = SendCodeSchema.parse(body);

    if (!contact || !method) {
      return NextResponse.json(
        { error: 'Contact and method are required' },
        { status: 400 }
      );
    }

    // Generate verification code
    const code = verificationManager.createVerification(contact, method);

    if (method === 'email') {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact)) {
        return NextResponse.json(
          { error: 'Invalid email address format' },
          { status: 400 }
        );
      }

      // Send email
      const result = await emailService.sendVerificationCode(contact, code);
      
      if (!result.success) {
        console.error('Email send failed:', result.error);
        return NextResponse.json(
          { 
            error: 'Failed to send verification email. Please check your email address and try again.',
            details: process.env.NODE_ENV === 'development' ? result.error : undefined
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email',
        messageId: result.messageId
      });

    } else if (method === 'sms') {
      // SMS functionality placeholder - for now just log and return success
      console.log(`📱 SMS verification code for ${contact}: ${code}`);
      console.log('📱 SMS functionality not implemented yet - check server logs for code');
      
      return NextResponse.json({
        success: true,
        message: 'SMS functionality coming soon! Check server logs for your verification code in development.',
        note: 'SMS verification is not yet implemented. The code has been logged to the server console for development purposes.'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid verification method' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}