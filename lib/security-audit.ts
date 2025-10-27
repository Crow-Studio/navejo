// lib/security-audit.ts
// Security audit utilities for route protection and authorization

import { NextRequest } from "next/server";
import { validateSessionToken } from "@/lib/server/session";

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
}

/**
 * Validates authentication for API routes
 */
export async function validateAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const sessionToken = request.cookies.get("session")?.value;
    
    if (!sessionToken) {
      return {
        success: false,
        error: "No session token provided"
      };
    }

    const { user } = await validateSessionToken(sessionToken);
    
    if (!user) {
      return {
        success: false,
        error: "Invalid or expired session"
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    };
  } catch (error) {
    console.error("Authentication validation error:", error);
    return {
      success: false,
      error: "Authentication failed"
    };
  }
}

/**
 * Routes that should be publicly accessible
 */
export const PUBLIC_ROUTES = [
  '/api/health/db',
  '/api/auth/magic-link',
  '/api/auth/google',
  '/api/auth/google/callback',
  '/api/auth/github',
  '/api/auth/github/callback',
  '/api/auth/verify',
  '/api/auth/session',
] as const;

/**
 * Check if a route should be publicly accessible
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Workspace-level authorization check
 */
export async function validateWorkspaceAccess(
  userId: string, 
  workspaceId: string
): Promise<boolean> {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId,
      }
    });
    
    return !!membership;
  } catch (error) {
    console.error("Workspace access validation error:", error);
    return false;
  }
}

/**
 * Organization-level authorization check
 * Checks if user is the owner of the organization or has access through workspace membership
 */
export async function validateOrganizationAccess(
  userId: string, 
  organizationId: string
): Promise<boolean> {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    
    // Check if user is the owner of the organization
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerId: userId,
      }
    });
    
    if (organization) {
      return true;
    }
    
    // Check if user has access through workspace membership
    const workspaceMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspace: {
          organizationId,
        }
      }
    });
    
    return !!workspaceMembership;
  } catch (error) {
    console.error("Organization access validation error:", error);
    return false;
  }
}