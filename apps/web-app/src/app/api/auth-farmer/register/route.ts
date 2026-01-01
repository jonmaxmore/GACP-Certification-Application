import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Forward registration request to backend
        const response = await fetch(`${BACKEND_URL}/auth-farmer/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        // Return the response with the same status code
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error('[Register Proxy] Error:', error);
        return NextResponse.json(
            { success: false, error: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}

