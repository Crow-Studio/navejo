// app/api/folders/route.ts
import { NextResponse } from "next/server";
import { withAuth, validateRequestBody } from "@/lib/server/auth-helpers";
import { 
  createFolder, 
  getPersonalFolders, 
  getWorkspaceFolders,
  getAllUserFolders 
} from "@/lib/server/folder";
import { z } from "zod";

const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(100, "Folder name too long"),
  description: z.string().max(500, "Description too long").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  icon: z.string().max(50, "Icon name too long").optional(),
  parentId: z.string().optional(),
  workspaceId: z.string().optional(),
  isDefault: z.boolean().default(false)
});

// POST /api/folders - Create new folder
export const POST = withAuth(async (user, request) => {
  try {
    const body = await request.json();
    const validatedData = validateRequestBody(createFolderSchema, body);
    
    if (validatedData instanceof NextResponse) {
      return validatedData; // Return validation error
    }

    const folder = await createFolder(user.id, validatedData);

    return NextResponse.json({ 
      folder,
      message: "Folder created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message.includes("already exists")) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
});

// GET /api/folders - Get user's folders
export const GET = withAuth(async (user, request) => {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const includeAll = searchParams.get('includeAll') === 'true';

    if (includeAll) {
      // Return all folders organized by context
      const allFolders = await getAllUserFolders(user.id);
      return NextResponse.json({ folders: allFolders });
    } else if (workspaceId) {
      // Return workspace-specific folders
      const folders = await getWorkspaceFolders(user.id, workspaceId);
      return NextResponse.json({ folders });
    } else {
      // Return personal folders
      const folders = await getPersonalFolders(user.id);
      return NextResponse.json({ folders });
    }
  } catch (error) {
    console.error("Error fetching folders:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
});