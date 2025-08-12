// app/api/folders/default/route.ts
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/server/auth-helpers";
import { getOrCreateDefaultFolder } from "@/lib/server/folder";

// GET /api/folders/default - Get or create default folder
export const GET = withAuth(async (user, request) => {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;

    const defaultFolder = await getOrCreateDefaultFolder(user.id, workspaceId);

    return NextResponse.json({ 
      folder: defaultFolder,
      message: "Default folder retrieved successfully"
    });
  } catch (error) {
    console.error("Error getting default folder:", error);
    
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to get default folder" },
      { status: 500 }
    );
  }
});