// File: src/app/api/auth/2fa/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    // Validate input
    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json({ 
        error: 'Invalid verification code' 
      }, { status: 400 });
    }

    // TODO: Get user ID from authentication context
    // For now, we'll use a mock user ID
    const userId = 'mock-user-id';

    // Get user's 2FA secret from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true }
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ 
        error: '2FA not set up for this user' 
      }, { status: 400 });
    }

    // Verify TOTP code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2 // Allow 2 steps before/after for time drift
    });

    if (!verified) {
      return NextResponse.json({ 
        error: 'Invalid verification code' 
      }, { status: 400 });
    }
    
    // Enable 2FA for user in database
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    });
    
    return NextResponse.json({
      success: true,
      message: '2FA verification successful'
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ 
      error: '2FA verification failed' 
    }, { status: 500 });
  }
}
