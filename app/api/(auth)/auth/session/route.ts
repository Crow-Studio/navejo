// app/api/auth/session/route.ts
import { getCurrentSession } from "@/lib/server/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { session, user } = await getCurrentSession();
    
    if (!session || !user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}