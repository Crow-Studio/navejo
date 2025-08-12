// app/api/folders/[folderId]/route.ts
import { NextResponse } from "next/server";
import { withAuth, validateRequestBody } from "@/lib/server/auth-helpers";
import { 
  getFolderById, 
  updateFolder, 
  deleteFolder 
} from "@/lib/server/folder";
import { z } from "zod";

const updateFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(100, "Folder name too long").optional(),
  description: z.string().max(500, "Description too long").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  icon: z.string().max(50, "Icon name too long").optional(),
  parentId: z.string().optional()
});

// GET /api/folders/[folderId] - Get specific folder
export const GET = withAuth(async (user, request, { params }) => {
  try {
    const { folderId } = params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;

    const folder = await getFolderById(user.id, folderId, workspaceId);

    return NextResponse.json({ folder });
  } catch (error) {
    console.error("Error fetching folder:", error);
    
    if (error instanceof Error) {
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
    }
    
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 }
    );
  }
});

// PUT /api/folders/[folderId] - Update folder
export const PUT = withAuth(async (user, request, { params }) => {
  try {
    const { folderId } = params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;
    
    const body = await request.json();
    const validatedData = validateRequestBody(updateFolderSchema, body);
    
    if (validatedData instanceof NextResponse) {
      return validatedData; // Return validation error
    }

    const folder = await updateFolder(user.id, folderId, validatedData, workspaceId);

    return NextResponse.json({ 
      folder,
      message: "Folder updated successfully"
    });
  } catch (error) {
    console.error("Error updating folder:", error);
    
    if (error instanceof Error) {
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
      { error: "Failed to update folder" },
      { status: 500 }
    );
  }
});

// DELETE /api/folders/[folderId] - Delete folder
export const DELETE = withAuth(async (user, request, { params }) => {
  try {
    const { folderId } = params;
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;

    await deleteFolder(user.id, folderId, workspaceId);

    return NextResponse.json({ 
      message: "Folder deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    
    if (error instanceof Error) {
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
      
      if (error.message.includes("Cannot delete")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
});