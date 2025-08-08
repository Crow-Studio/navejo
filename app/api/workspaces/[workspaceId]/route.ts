// app/api/workspaces/[workspaceId]/route.ts
import { NextResponse } from "next/server";
import { withAuth, validateRequestBody } from "@/lib/server/auth-helpers";
import { getWorkspace, createWorkspace } from "@/lib/server/workspace";
import { z } from "zod";

const createWorkspaceInOrgSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  organizationId: z.string()
});

// GET /api/workspaces/[workspaceId] - Get workspace details
export const GET = withAuth(async (user, _request, { params }: { params: Promise<{ workspaceId: string }> }) => {
  try {
    const { workspaceId } = await params;
    const workspace = await getWorkspace(workspaceId, user.id);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500 }
    );
  }
});

// POST /api/workspaces/[organizationId] - Create workspace in existing organization
export const POST = withAuth(async (user, request) => {
  try {
    const body = await request.json();
    const validatedData = validateRequestBody(createWorkspaceInOrgSchema, body);
    
    if (validatedData instanceof NextResponse) {
      return validatedData; // Return validation error
    }

    const workspace = await createWorkspace(user.id, validatedData.organizationId, validatedData);

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
});