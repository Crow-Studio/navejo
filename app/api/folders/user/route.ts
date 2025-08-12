import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken } from "@/lib/server/session";
import { prisma } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = request.cookies.get("session")?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate session and get user
    const { user } = await validateSessionToken(sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    // Get workspace filter from query params
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;

    // Fetch user folders with bookmark counts
    const folders = await prisma.folder.findMany({
      where: {
        userId: workspaceId ? undefined : user.id,
        workspaceId: workspaceId || null
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        isDefault: true,
        _count: {
          select: {
            bookmarks: {
              where: {
                isArchived: false
              }
            }
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' }, // Default folders first
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ folders });

  } catch (error) {
    console.error("Error fetching user folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}