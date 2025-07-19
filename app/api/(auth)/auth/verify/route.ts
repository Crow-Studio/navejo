import { prisma } from "@/lib/server/db";
import { createSession, generateSessionToken } from "@/lib/server/session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/invalid-token", request.url));
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/invalid-token", request.url));
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      return NextResponse.redirect(new URL("/token-expired", request.url));
    }

    // Create a new session
    const sessionToken = generateSessionToken();
    await createSession(sessionToken, verificationToken.user.id);
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    
    // Set the cookie in the response
    const cookieExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    response.cookies.set("session", sessionToken, {
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: cookieExpiry
    });

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Update user email verification status
    await prisma.user.update({
      where: { id: verificationToken.user.id },
      data: { emailVerified: true },
    });

    return response;
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}