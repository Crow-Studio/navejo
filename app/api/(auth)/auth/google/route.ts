import { generateState, generateCodeVerifier } from "arctic";
import { google } from "@/lib/server/oauth";
import { cookies } from "next/headers";
import { globalGETRateLimit } from "@/lib/server/request";

export async function GET(): Promise<Response> {
  if (!globalGETRateLimit()) {
    return new Response("Too many requests", { status: 429 });
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email"
  ]);

  const cookieStore = cookies();
  (await cookieStore).set("google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax"
  });
  (await cookieStore).set("google_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    sameSite: "lax"
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString()
    }
  });
}