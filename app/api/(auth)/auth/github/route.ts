// api/auth/github/route.ts
import { NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = `${process.env.BASE_URL}/api/auth/github/callback`;

export async function GET() {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 500 });
  }

  // Generate a state parameter for security
  const state = crypto.randomUUID();
  
  // Store state in a cookie or session for verification
  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=user:email&state=${state}`
  );
  
  // Set state cookie for verification
  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 // 10 minutes
  });

  return response;
}