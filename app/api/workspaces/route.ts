// app/api/workspaces/route.ts
import { NextResponse } from "next/server";
import { withAuth, validateRequestBody } from "@/lib/server/auth-helpers";
import { createOrganizationWithWorkspace, getUserWorkspaces } from "@/lib/server/workspace";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  organizationName: z.string().min(1).max(100),
  workspaceName: z.string().min(1).max(100),
  description: z.string().optional()
});

// GET /api/workspaces - Get user's workspaces
export const GET = withAuth(async (user) => {
  try {
    const workspaces = await getUserWorkspaces(user.id);
    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
});

// POST /api/workspaces - Create new organization with workspace
export const POST = withAuth(async (user, request) => {
  try {
    const body = await request.json();
    const validatedData = validateRequestBody(createWorkspaceSchema, body);
    
    if (validatedData instanceof NextResponse) {
      return validatedData; // Return validation error
    }

    const { organizationName, workspaceName, description } = validatedData;

    const organization = await createOrganizationWithWorkspace(
      user.id,
      organizationName,
      workspaceName,
      description
    );

    return NextResponse.json({ 
      organization,
      workspace: organization.workspaces[0]
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
});