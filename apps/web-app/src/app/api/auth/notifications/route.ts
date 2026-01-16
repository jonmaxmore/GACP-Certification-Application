// File: src/app/api/auth/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json();
    
    // Validate input
    const validKeys = ['email', 'sms', 'push', 'applicationStatus', 'paymentReminder', 'systemUpdates', 'marketingEmails'];
    for (const key of validKeys) {
      if (typeof settings[key] !== 'boolean') {
        return NextResponse.json({ 
          error: `Invalid value for ${key}: must be boolean` 
        }, { status: 400 });
      }
    }

    // TODO: Get user ID from authentication context
    // For now, we'll use a mock user ID
    const userId = 'mock-user-id';

    // Update user notification settings in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        notificationSettings: {
          email: settings.email,
          sms: settings.sms,
          push: settings.push,
          applicationStatus: settings.applicationStatus,
          paymentReminder: settings.paymentReminder,
          systemUpdates: settings.systemUpdates,
          marketingEmails: settings.marketingEmails,
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      settings: updatedUser.notificationSettings
    });

  } catch (error) {
    console.error('Notification settings update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update notification settings' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from authentication context
    // For now, we'll use a mock user ID
    const userId = 'mock-user-id';

    // Get user notification settings from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationSettings: true }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      settings: user.notificationSettings || {
        email: true,
        sms: false,
        push: true,
        applicationStatus: true,
        paymentReminder: true,
        systemUpdates: false,
        marketingEmails: false,
      }
    });

  } catch (error) {
    console.error('Notification settings fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch notification settings' 
    }, { status: 500 });
  }
}
