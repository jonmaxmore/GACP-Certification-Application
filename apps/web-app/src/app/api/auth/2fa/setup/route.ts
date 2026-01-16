// File: src/app/api/auth/2fa/setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // TODO: Get user ID from authentication context
    // For now, we'll use a mock user ID
    const userId = 'mock-user-id';

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `GACP Platform (${userId})`,
      issuer: 'GACP Platform',
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Store secret and backup codes in database (not yet enabled)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
        twoFactorBackupCodes: backupCodes,
        twoFactorEnabled: false // Will be enabled after verification
      }
    });

    return NextResponse.json({
      success: true,
      qrCode: qrCodeUrl,
      backupCodes: backupCodes,
      secret: secret.base32
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ 
      error: '2FA setup failed' 
    }, { status: 500 });
  }
}
