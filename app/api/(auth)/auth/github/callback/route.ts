// api/auth/github/callback/route.ts
import { NextResponse } from 'next/server';
import { github } from '@/lib/server/oauth';
import { prisma } from '@/lib/server/db';
import { generateSessionToken, createSession, setSessionTokenCookie } from '@/lib/server/session';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Exchange code for tokens
    const tokens = await github.validateAuthorizationCode(code);
    
    // Fetch user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'User-Agent': 'YourApp/1.0',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info from GitHub');
    }

    const githubUser = await userResponse.json();

    // Fetch user email (GitHub doesn't always include email in user endpoint)
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'User-Agent': 'YourApp/1.0',
      },
    });

    let userEmail = githubUser.email;
    if (!userEmail && emailResponse.ok) {
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((email: any) => email.primary);
      userEmail = primaryEmail?.email || emails[0]?.email;
    }

    if (!userEmail) {
      return NextResponse.redirect(new URL('/login?error=no_email', request.url));
    }

    // Check if user exists or create new user
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        profile: true,
        oauthAccount: true,
      },
    });

    if (!user) {
      // Create new user with OAuth account
      user = await prisma.user.create({
        data: {
          email: userEmail,
          emailVerified: true,
          profile: {
            create: {
              name: githubUser.name || githubUser.login || userEmail.split('@')[0],
              imageUrl: githubUser.avatar_url,
              username: githubUser.login,
              bio: githubUser.bio,
              website: githubUser.blog,
              location: githubUser.location,
            },
          },
          oauthAccount: {
            create: {
              providerId: 'github',
              providerUserId: githubUser.id.toString(),
              userEmail: userEmail,
              userName: githubUser.name || githubUser.login || '',
              userAvatarURL: githubUser.avatar_url || '',
            },
          },
        },
        include: {
          profile: true,
          oauthAccount: true,
        },
      });
    } else if (!user.oauthAccount) {
      // Link OAuth account to existing user
      await prisma.oauthAccount.create({
        data: {
          providerId: 'github',
          providerUserId: githubUser.id.toString(),
          userEmail: userEmail,
          userName: githubUser.name || githubUser.login || '',
          userAvatarURL: githubUser.avatar_url || '',
          userId: user.id,
        },
      });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);

    // Redirect to dashboard with success parameter
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('success', 'true');
    
    return NextResponse.redirect(dashboardUrl);
    
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'oauth_failed');
    return NextResponse.redirect(loginUrl);
  }
}