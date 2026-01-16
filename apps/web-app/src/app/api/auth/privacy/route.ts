// File: src/app/api/auth/privacy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json();
    
    // Validate input
    const validKeys = ['profileVisibility', 'dataSharing', 'marketingCommunications', 'activityVisibility', 'locationSharing', 'analyticsTracking'];
    for (const key of validKeys) {
      if (key === 'profileVisibility') {
        if (!['public', 'private', 'connections'].includes(settings[key])) {
          return NextResponse.json({ 
            error: `Invalid value for ${key}: must be public, private, or connections` 
          }, { status: 400 });
        }
      } else if (typeof settings[key] !== 'boolean') {
        return NextResponse.json({ 
          error: `Invalid value for ${key}: must be boolean` 
        }, { status: 400 });
      }
    }

    // TODO: Get user ID from authentication context
    // For now, we'll use a mock user ID
    const userId = 'mock-user-id';

    // Update user privacy settings in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        privacySettings: {
          profileVisibility: settings.profileVisibility,
          dataSharing: settings.dataSharing,
          marketingCommunications: settings.marketingCommunications,
          activityVisibility: settings.activityVisibility,
          locationSharing: settings.locationSharing,
          analyticsTracking: settings.analyticsTracking,
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully',
      settings: updatedUser.privacySettings
    });

  } catch (error) {
    console.error('Privacy settings update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update privacy settings' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from authentication context
    // For now, we'll use a mock user ID
    const userId = 'mock-user-id';

    // Get user privacy settings from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { privacySettings: true }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      settings: user.privacySettings || {
        profileVisibility: 'public',
        dataSharing: false,
        marketingCommunications: false,
        activityVisibility: true,
        locationSharing: false,
        analyticsTracking: true,
      }
    });

  } catch (error) {
    console.error('Privacy settings fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch privacy settings' 
    }, { status: 500 });
  }
}
