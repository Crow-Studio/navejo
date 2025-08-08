// lib/server/auth-helpers.ts
import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken } from "@/lib/server/session";
import { z } from "zod";
import type { User } from "@prisma/client";

export interface AuthenticatedRequest {
  user: User;
  request: NextRequest;
}

/**
 * Middleware to authenticate API requests
 * Returns the authenticated user or throws an error response
 */
export async function authenticateRequest(request: NextRequest): Promise<{ user: User } | NextResponse> {
  try {
    const sessionToken = request.cookies.get("session")?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Authentication required. Please log in." }, 
        { status: 401 }
      );
    }

    const { user } = await validateSessionToken(sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please log in again." }, 
        { status: 401 }
      );
    }

    return { user };
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." }, 
      { status: 401 }
    );
  }
}

/**
 * Higher-order function to wrap API handlers with authentication
 */
export function withAuth<T extends unknown[]>(
  handler: (user: User, request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    
    return handler(authResult.user, request, ...args);
  };
}

/**
 * Validate request body with Zod schema and handle errors consistently
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T | NextResponse {
  try {
    return schema.parse(body);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request data", 
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}