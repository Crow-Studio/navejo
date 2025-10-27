import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/db';

export async function GET() {
  try {
    // Simple lightweight query to keep connection alive
    const result = await prisma.user.findFirst({
      select: { id: true }
    });
    
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Database connection active'
    });
  } catch (error) {
    console.error('Keepalive check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        message: 'Database connection failed'
      },
      { status: 500 }
    );
  }
}