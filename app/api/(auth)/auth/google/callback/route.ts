import { generateSessionToken, createSession } from "@/lib/server/session";
import { google } from "@/lib/server/oauth";
import { cookies } from "next/headers";
import { createUser, getUserFromGoogleId } from "@/lib/server/user";
import { ObjectParser } from "@pilcrowjs/object-parser";
import { globalGETRateLimit } from "@/lib/server/request";
import { decodeIdToken } from "arctic";

export async function GET(request: Request): Promise<Response> {
  try {
    if (!globalGETRateLimit()) {
      return new Response("Too many requests", { status: 429 });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    // Fix: await the cookies() call
    const cookieStore = await cookies();
    const storedState = cookieStore.get("google_oauth_state")?.value;
    const codeVerifier = cookieStore.get("google_code_verifier")?.value;

    if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
      console.error("Invalid OAuth state or missing parameters", {
        code: !!code,
        state: !!state,
        storedState: !!storedState,
        codeVerifier: !!codeVerifier,
        stateMatch: state === storedState
      });
      return new Response("Invalid authentication state. Please try again.", {
        status: 400
      });
    }

    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    
    if (!tokens || !tokens.idToken) {
      console.error("No tokens received from Google");
      throw new Error("Failed to validate authorization code");
    }

    // Fix: Call the idToken function to get the string value
    const idTokenString = tokens.idToken();
    const claims = await decodeIdToken(idTokenString);
    
    if (!claims) {
      console.error("Failed to decode ID token");
      throw new Error("Failed to decode ID token");
    }

    const parser = new ObjectParser(claims);
    const googleId = parser.getString("sub");
    const name = parser.getString("name");
    const picture = parser.getString("picture");
    const email = parser.getString("email");

    if (!googleId || !email) {
      console.error("Missing required user information", { googleId: !!googleId, email: !!email });
      throw new Error("Missing required user information");
    }

    let user = await getUserFromGoogleId(googleId);
    if (!user) {
      user = await createUser("google", googleId, email, name, picture);
    }

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);

    // Create headers array for cookies
    const headers = new Headers({
      'Location': '/'
    });

    // Set session cookie
    headers.append('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${session.expiresAt.toUTCString()}`);

    // Clear OAuth cookies
    headers.append('Set-Cookie', 'google_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
    headers.append('Set-Cookie', 'google_code_verifier=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');

    return new Response(null, {
      status: 302,
      headers
    });

  } catch (error) {
    console.error("Google OAuth callback error:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });

    return new Response("Authentication failed. Please try again.", {
      status: 500
    });
  }
}