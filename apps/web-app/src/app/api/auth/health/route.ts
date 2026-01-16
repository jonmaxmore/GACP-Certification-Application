// File: src/app/api/auth/health/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test backend connection
    const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3000';
    
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      frontend: 'healthy',
      backend: data,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      success: false,
      frontend: 'healthy',
      backend: 'unreachable',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
