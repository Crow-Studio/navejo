// app/api/bookmarks/[bookmarkId]/route.ts
import { NextResponse } from "next/server";
import { withAuth, validateRequestBody } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { z } from "zod";

const updateBookmarkSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  folderId: z.string().nullable().optional(),
  tags: z.array(z.string().min(1).max(50)).max(20, "Too many tags").optional(),
  isPrivate: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

// GET /api/bookmarks/[bookmarkId] - Get specific bookmark
export const GET = withAuth(async (user, request, { params }) => {
  try {
    const bookmarkId = params.bookmarkId as string;

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: user.id
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      bookmark: {
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        notes: bookmark.notes,
        favicon: bookmark.favicon,
        imageUrl: bookmark.imageUrl,
        siteName: bookmark.siteName,
        author: bookmark.author,
        publishedAt: bookmark.publishedAt,
        isPrivate: bookmark.isPrivate,
        isFavorite: bookmark.isFavorite,
        folder: bookmark.folder,
        tags: bookmark.tags.map(bt => bt.tag),
        workspace: bookmark.workspace,
        createdAt: bookmark.createdAt,
        updatedAt: bookmark.updatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching bookmark:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmark" },
      { status: 500 }
    );
  }
});

// PATCH /api/bookmarks/[bookmarkId] - Update bookmark
export const PATCH = withAuth(async (user, request, { params }) => {
  try {
    const bookmarkId = params.bookmarkId as string;
    const body = await request.json();
    const validatedData = validateRequestBody(updateBookmarkSchema, body);
    
    if (validatedData instanceof NextResponse) {
      return validatedData; // Return validation error
    }

    // Check if bookmark exists and belongs to user
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: user.id
      }
    });

    if (!existingBookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Validate folder access if folderId is being updated
    if (validatedData.folderId !== undefined && validatedData.folderId !== null) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: validatedData.folderId,
          OR: [
            { userId: user.id },
            { 
              workspace: {
                members: {
                  some: { userId: user.id }
                }
              }
            }
          ]
        }
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Update bookmark with transaction to handle tags
    const updatedBookmark = await prisma.$transaction(async (tx) => {
      // Update bookmark
      const bookmark = await tx.bookmark.update({
        where: { id: bookmarkId },
        data: {
          ...(validatedData.title !== undefined && { title: validatedData.title }),
          ...(validatedData.description !== undefined && { description: validatedData.description }),
          ...(validatedData.notes !== undefined && { notes: validatedData.notes }),
          ...(validatedData.folderId !== undefined && { folderId: validatedData.folderId }),
          ...(validatedData.isPrivate !== undefined && { isPrivate: validatedData.isPrivate }),
          ...(validatedData.isFavorite !== undefined && { isFavorite: validatedData.isFavorite }),
        }
      });

      // Handle tags update if provided
      if (validatedData.tags !== undefined) {
        // Remove existing tag associations
        await tx.bookmarkTag.deleteMany({
          where: { bookmarkId }
        });

        // Add new tag associations
        if (validatedData.tags.length > 0) {
          for (const tagName of validatedData.tags) {
            // Find or create tag
            let tag = await tx.tag.findFirst({
              where: {
                name: tagName.toLowerCase().trim(),
                userId: user.id
              }
            });

            if (!tag) {
              tag = await tx.tag.create({
                data: {
                  name: tagName.toLowerCase().trim(),
                  userId: user.id
                }
              });
            }

            // Associate tag with bookmark
            await tx.bookmarkTag.create({
              data: {
                bookmarkId,
                tagId: tag.id
              }
            });
          }
        }
      }

      return bookmark;
    });

    // Fetch the complete updated bookmark with relations
    const completeBookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
      include: {
        folder: {
          select: {
            id: true,
            name: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
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
      },
      message: "Bookmark updated successfully"
    });
  } catch (error) {
    console.error("Error updating bookmark:", error);
    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 }
    );
  }
});

// DELETE /api/bookmarks/[bookmarkId] - Delete bookmark
export const DELETE = withAuth(async (user, request, { params }) => {
  try {
    const bookmarkId = params.bookmarkId as string;

    // Check if bookmark exists and belongs to user
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId: user.id
      }
    });

    if (!existingBookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    // Delete bookmark (cascade will handle related records)
    await prisma.bookmark.delete({
      where: { id: bookmarkId }
    });

    return NextResponse.json({
      message: "Bookmark deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
});