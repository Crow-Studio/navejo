import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateSessionToken } from "@/lib/server/session";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { sourceBookmarkId, workspaceId } = body;

    if (!sourceBookmarkId) {
      return NextResponse.json(
        { error: "Source bookmark ID is required" },
        { status: 400 }
      );
    }

    // Get the source bookmark (must be public)
    const sourceBookmark = await prisma.bookmark.findFirst({
      where: {
        id: sourceBookmarkId,
        isPrivate: false,
        isArchived: false
      },
      include: {
        tags: true,
        folder: true
      }
    });

    if (!sourceBookmark) {
      return NextResponse.json(
        { error: "Bookmark not found or not public" },
        { status: 404 }
      );
    }

    // Check if user already has this bookmark
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        url: sourceBookmark.url,
        isArchived: false
      }
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: "You already have this bookmark saved" },
        { status: 409 }
      );
    }

    // Get user's default workspace if not specified
    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId) {
      const defaultWorkspace = await prisma.workspaceMember.findFirst({
        where: {
          userId: user.id,
          role: 'OWNER'
        },
        select: {
          workspaceId: true
        }
      });
      targetWorkspaceId = defaultWorkspace?.workspaceId;
    }

    if (!targetWorkspaceId) {
      return NextResponse.json(
        { error: "No workspace found" },
        { status: 400 }
      );
    }

    // Create the imported bookmark
    const importedBookmark = await prisma.bookmark.create({
      data: {
        title: sourceBookmark.title,
        url: sourceBookmark.url,
        description: sourceBookmark.description,
        notes: `Imported from community bookmark`,
        favicon: sourceBookmark.favicon,
        imageUrl: sourceBookmark.imageUrl,
        siteName: sourceBookmark.siteName,
        author: sourceBookmark.author,
        publishedAt: sourceBookmark.publishedAt,
        isPrivate: true, // Import as private by default
        isFavorite: false,
        userId: user.id,
        workspaceId: targetWorkspaceId,
        // Don't copy folder - let user organize it themselves
        tags: {
          connectOrCreate: sourceBookmark.tags.map(tag => ({
            where: {
              name_userId: {
                name: tag.name,
                userId: user.id
              }
            },
            create: {
              name: tag.name,
              color: tag.color,
              userId: user.id
            }
          }))
        }
      },
      include: {
        tags: true,
        folder: true,
        workspace: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      bookmark: {
        id: importedBookmark.id,
        title: importedBookmark.title,
        url: importedBookmark.url,
        description: importedBookmark.description,
        notes: importedBookmark.notes,
        favicon: importedBookmark.favicon,
        imageUrl: importedBookmark.imageUrl,
        siteName: importedBookmark.siteName,
        author: importedBookmark.author,
        publishedAt: importedBookmark.publishedAt,
        isPrivate: importedBookmark.isPrivate,
        isFavorite: importedBookmark.isFavorite,
        folder: importedBookmark.folder,
        tags: importedBookmark.tags,
        workspace: importedBookmark.workspace,
        createdAt: importedBookmark.createdAt,
        updatedAt: importedBookmark.updatedAt
      }
    });

  } catch (error) {
    console.error("Error importing bookmark:", error);
    return NextResponse.json(
      { error: "Failed to import bookmark" },
      { status: 500 }
    );
  }
}