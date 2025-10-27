import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateSessionToken } from "@/lib/server/session";
import { getOrCreateImportedFolder } from "@/lib/server/folder";

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

    console.log("Import request data:", { sourceBookmarkId, workspaceId, userId: user.id });

    if (!sourceBookmarkId) {
      console.log("Missing sourceBookmarkId in request");
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
        tags: {
          include: {
            tag: true
          }
        },
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

    console.log("Target workspace ID:", targetWorkspaceId);

    // If no workspace found, create bookmark without workspace (personal bookmark)
    if (!targetWorkspaceId) {
      console.log("No workspace found, creating personal bookmark");
    }

    // Get or create "Imported" folder for better organization
    const importedFolder = await getOrCreateImportedFolder(user.id, targetWorkspaceId || undefined);
    console.log("Imported folder:", importedFolder.id);

    // Create the imported bookmark
    const importedBookmark = await prisma.bookmark.create({
      data: {
        title: sourceBookmark.title,
        url: sourceBookmark.url,
        description: sourceBookmark.description,
        notes: `Imported from community on ${new Date().toLocaleDateString()}`,
        favicon: sourceBookmark.favicon,
        imageUrl: sourceBookmark.imageUrl,
        siteName: sourceBookmark.siteName,
        author: sourceBookmark.author,
        publishedAt: sourceBookmark.publishedAt,
        isPrivate: true, // Import as private by default
        isFavorite: false,
        userId: user.id,
        workspaceId: targetWorkspaceId || null,
        folderId: importedFolder.id,
        // Tags will be handled separately after bookmark creation
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

    // Handle tags separately
    if (sourceBookmark.tags && sourceBookmark.tags.length > 0) {
      for (const bookmarkTag of sourceBookmark.tags) {
        const sourceTag = bookmarkTag.tag;
        
        // Find or create tag
        let tag = await prisma.tag.findFirst({
          where: {
            name: sourceTag.name.toLowerCase().trim(),
            userId: user.id
          }
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: sourceTag.name.toLowerCase().trim(),
              color: sourceTag.color,
              userId: user.id
            }
          });
        }

        // Associate tag with bookmark
        await prisma.bookmarkTag.create({
          data: {
            bookmarkId: importedBookmark.id,
            tagId: tag.id
          }
        });
      }
    }

    // Fetch the complete bookmark with tags
    const completeBookmark = await prisma.bookmark.findUnique({
      where: { id: importedBookmark.id },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
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
        id: completeBookmark!.id,
        title: completeBookmark!.title,
        url: completeBookmark!.url,
        description: completeBookmark!.description,
        notes: completeBookmark!.notes,
        favicon: completeBookmark!.favicon,
        imageUrl: completeBookmark!.imageUrl,
        siteName: completeBookmark!.siteName,
        author: completeBookmark!.author,
        publishedAt: completeBookmark!.publishedAt,
        isPrivate: completeBookmark!.isPrivate,
        isFavorite: completeBookmark!.isFavorite,
        folder: completeBookmark!.folder,
        tags: completeBookmark!.tags.map(bt => bt.tag),
        workspace: completeBookmark!.workspace,
        createdAt: completeBookmark!.createdAt,
        updatedAt: completeBookmark!.updatedAt
      }
    });

  } catch (error) {
    console.error("Error importing bookmark:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        error: "Failed to import bookmark",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}