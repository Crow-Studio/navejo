import { NextResponse } from "next/server";
import { withAuth } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";

// Debug endpoint to check bookmark data
export const GET = withAuth(async (user, request) => {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;

    // Get raw bookmark count
    const totalCount = await prisma.bookmark.count({
      where: {
        userId: user.id,
        isArchived: false
      }
    });

    // Get personal bookmarks count
    const personalCount = await prisma.bookmark.count({
      where: {
        userId: user.id,
        workspaceId: null,
        isArchived: false
      }
    });

    // Get workspace bookmarks count (if workspaceId provided)
    const workspaceCount = workspaceId ? await prisma.bookmark.count({
      where: {
        userId: user.id,
        workspaceId: workspaceId,
        isArchived: false
      }
    }) : 0;

    // Get sample bookmarks
    const sampleBookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.id,
        workspaceId: workspaceId || null,
        isArchived: false
      },
      select: {
        id: true,
        title: true,
        url: true,
        workspaceId: true,
        folderId: true,
        isPrivate: true,
        createdAt: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      debug: {
        userId: user.id,
        requestedWorkspaceId: workspaceId,
        totalBookmarks: totalCount,
        personalBookmarks: personalCount,
        workspaceBookmarks: workspaceCount,
        sampleBookmarks: sampleBookmarks
      }
    });

  } catch (error) {
    console.error("Debug bookmarks error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error },
      { status: 500 }
    );
  }
});