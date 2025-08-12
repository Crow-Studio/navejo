import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken } from "@/lib/server/session";
import { prisma } from "@/lib/server/db";

export interface DashboardStats {
  totalBookmarks: number;
  collections: number;
  sharedBookmarks: number;
  weeklyBookmarks: number;
  recentBookmarks: {
    id: string;
    title: string;
    url: string;
    folder: {
      id: string;
      name: string;
    } | null;
    createdAt: Date;
  }[];
  topCollections: {
    id: string;
    name: string;
    count: number;
  }[];
}

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

    // Get current date for weekly calculation
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Build base where clause for workspace filtering
    const baseWhere = {
      userId: user.id,
      workspaceId: workspaceId || null,
      isArchived: false
    };

    const folderWhere = {
      userId: workspaceId ? undefined : user.id,
      workspaceId: workspaceId || null
    };

    // Fetch dashboard statistics
    const [
      totalBookmarks,
      collections,
      sharedBookmarks,
      weeklyBookmarks,
      recentBookmarks,
      topCollections
    ] = await Promise.all([
      // Total bookmarks count
      prisma.bookmark.count({
        where: baseWhere
      }),

      // Collections (folders) count
      prisma.folder.count({
        where: folderWhere
      }),

      // Shared bookmarks count
      prisma.sharedBookmark.count({
        where: {
          sharedById: user.id,
          bookmark: {
            workspaceId: workspaceId || null
          }
        }
      }),

      // Weekly bookmarks count
      prisma.bookmark.count({
        where: {
          ...baseWhere,
          createdAt: {
            gte: oneWeekAgo
          }
        }
      }),

      // Recent bookmarks (last 5)
      prisma.bookmark.findMany({
        where: baseWhere,
        select: {
          id: true,
          title: true,
          url: true,
          createdAt: true,
          folder: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),

      // Top collections by bookmark count
      prisma.folder.findMany({
        where: folderWhere,
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              bookmarks: {
                where: {
                  isArchived: false,
                  workspaceId: workspaceId || null
                }
              }
            }
          }
        },
        orderBy: {
          bookmarks: {
            _count: 'desc'
          }
        },
        take: 4
      })
    ]);

    // Format the response
    const stats: DashboardStats = {
      totalBookmarks,
      collections,
      sharedBookmarks,
      weeklyBookmarks,
      recentBookmarks,
      topCollections: topCollections.map(folder => ({
        id: folder.id,
        name: folder.name,
        count: folder._count.bookmarks
      }))
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}