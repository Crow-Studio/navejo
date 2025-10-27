import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateSessionToken } from "@/lib/server/session";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Validate session
    const sessionToken = request.cookies.get("session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = await validateSessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search query
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause for search
    const whereClause: Record<string, unknown> = {
      isPublic: true,
      // Exclude current user
      userId: {
        not: user.id
      }
    };

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          username: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          bio: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Fetch public profiles with their public bookmarks
    const profiles = await prisma.profile.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        imageUrl: true,
        website: true,
        location: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            bookmarks: {
              where: {
                isPrivate: false,
                isArchived: false
              },
              select: {
                id: true,
                title: true,
                url: true,
                description: true,
                favicon: true,
                createdAt: true,
                tags: {
                  select: {
                    tag: {
                      select: {
                        id: true,
                        name: true,
                        color: true
                      }
                    }
                  }
                },
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
              take: 10
            },
            _count: {
              select: {
                bookmarks: {
                  where: {
                    isPrivate: false,
                    isArchived: false
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Transform the data
    const transformedProfiles = profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      username: profile.username,
      bio: profile.bio,
      imageUrl: profile.imageUrl,
      website: profile.website,
      location: profile.location,
      createdAt: profile.createdAt.toISOString(),
      _count: {
        publicBookmarks: profile.user._count.bookmarks
      },
      recentBookmarks: profile.user.bookmarks.map(bookmark => ({
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        favicon: bookmark.favicon,
        createdAt: bookmark.createdAt.toISOString(),
        tags: bookmark.tags.map(bookmarkTag => bookmarkTag.tag),
        folder: bookmark.folder
      }))
    }));

    return NextResponse.json({
      profiles: transformedProfiles,
      total: profiles.length,
      hasMore: profiles.length === limit
    });

  } catch (error) {
    console.error("Error fetching public profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch public profiles" },
      { status: 500 }
    );
  }
}