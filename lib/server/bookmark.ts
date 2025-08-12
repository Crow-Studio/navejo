// lib/server/bookmark.ts
import { prisma } from "@/lib/server/db";
import { v4 as uuidv4 } from "uuid";
// Removed unused WorkspaceRole import
import type { ExtractedMetadata } from "@/lib/metadata-extractor";
import { validateFolderAccess, getOrCreateDefaultFolder } from "@/lib/server/folder";

export interface CreateBookmarkData {
  url: string;
  title: string;
  description?: string;
  notes?: string;
  folderId?: string;
  tags: string[];
  isPrivate: boolean;
  workspaceId?: string;
  metadata: ExtractedMetadata;
}

export interface BookmarkResponse {
  id: string;
  title: string;
  url: string;
  description: string | null;
  notes: string | null;
  favicon: string | null;
  imageUrl: string | null;
  siteName: string | null;
  author: string | null;
  publishedAt: Date | null;
  isPrivate: boolean;
  isFavorite: boolean;
  folder: {
    id: string;
    name: string;
  } | null;
  tags: {
    id: string;
    name: string;
    color: string | null;
  }[];
  workspace: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Creates a new bookmark with metadata and tags
 */
export async function createBookmark(
  userId: string,
  data: CreateBookmarkData
): Promise<BookmarkResponse> {
  // Validate workspace permissions if workspaceId is provided
  if (data.workspaceId) {
    await validateWorkspacePermission(userId, data.workspaceId);
  }

  // Validate folder permissions if folderId is provided, or get default folder
  let finalFolderId = data.folderId;
  if (data.folderId) {
    await validateFolderAccess(userId, data.folderId, data.workspaceId);
  } else {
    // If no folder specified, use default folder
    const defaultFolder = await getOrCreateDefaultFolder(userId, data.workspaceId);
    finalFolderId = defaultFolder.id;
  }

  // Check for duplicate bookmarks
  await checkDuplicateBookmark(userId, data.url, data.workspaceId);

  // Create bookmark with transaction to ensure data consistency
  const bookmark = await prisma.$transaction(async (tx) => {
    // Create the bookmark
    const newBookmark = await tx.bookmark.create({
      data: {
        id: uuidv4(),
        title: data.title,
        url: data.url,
        description: data.description || data.metadata.description || null,
        notes: data.notes || null,
        favicon: data.metadata.favicon,
        imageUrl: data.metadata.imageUrl,
        siteName: data.metadata.siteName,
        author: data.metadata.author,
        publishedAt: data.metadata.publishedAt,
        isPrivate: data.isPrivate,
        userId,
        workspaceId: data.workspaceId || null,
        folderId: finalFolderId
      }
    });

    // Handle tags if provided
    if (data.tags.length > 0) {
      await createAndAssociateTags(tx, userId, newBookmark.id, data.tags);
    }

    return newBookmark;
  });

  // Fetch the complete bookmark with relations
  const completeBookmark = await prisma.bookmark.findUnique({
    where: { id: bookmark.id },
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

  if (!completeBookmark) {
    throw new Error("Failed to retrieve created bookmark");
  }

  return {
    id: completeBookmark.id,
    title: completeBookmark.title,
    url: completeBookmark.url,
    description: completeBookmark.description,
    notes: completeBookmark.notes,
    favicon: completeBookmark.favicon,
    imageUrl: completeBookmark.imageUrl,
    siteName: completeBookmark.siteName,
    author: completeBookmark.author,
    publishedAt: completeBookmark.publishedAt,
    isPrivate: completeBookmark.isPrivate,
    isFavorite: completeBookmark.isFavorite,
    folder: completeBookmark.folder,
    tags: completeBookmark.tags.map(bt => bt.tag),
    workspace: completeBookmark.workspace,
    createdAt: completeBookmark.createdAt,
    updatedAt: completeBookmark.updatedAt
  };
}

/**
 * Validates if user has permission to create bookmarks in the workspace
 */
async function validateWorkspacePermission(userId: string, workspaceId: string): Promise<void> {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId
    }
  });

  if (!membership) {
    throw new Error("Unauthorized: You don't have access to this workspace");
  }
}



/**
 * Checks for duplicate bookmarks to prevent duplicates
 */
async function checkDuplicateBookmark(
  userId: string, 
  url: string, 
  workspaceId?: string
): Promise<void> {
  const existingBookmark = await prisma.bookmark.findFirst({
    where: {
      userId,
      url,
      workspaceId: workspaceId || null
    }
  });

  if (existingBookmark) {
    throw new Error("Bookmark already exists for this URL in the specified location");
  }
}

/**
 * Creates tags and associates them with the bookmark
 */
async function createAndAssociateTags(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  userId: string,
  bookmarkId: string,
  tagNames: string[]
): Promise<void> {
  for (const tagName of tagNames) {
    // Find or create tag
    let tag = await tx.tag.findFirst({
      where: {
        name: tagName.toLowerCase().trim(),
        userId
      }
    });

    if (!tag) {
      tag = await tx.tag.create({
        data: {
          id: uuidv4(),
          name: tagName.toLowerCase().trim(),
          userId
        }
      });
    }

    // Associate tag with bookmark
    await tx.bookmarkTag.create({
      data: {
        id: uuidv4(),
        bookmarkId,
        tagId: tag.id
      }
    });
  }
}

/**
 * Gets user's bookmarks with filtering options
 */
export async function getUserBookmarks(
  userId: string,
  options: {
    workspaceId?: string;
    folderId?: string;
    isPrivate?: boolean;
    filter?: 'recent' | 'favorites' | 'shared';
    limit?: number;
    offset?: number;
  } = {}
) {
  // Build where clause based on filter
  let whereClause: any = {
    userId,
    isArchived: false
  };

  // Handle workspaceId filtering
  if (options.workspaceId) {
    whereClause.workspaceId = options.workspaceId;
  } else {
    whereClause.workspaceId = null; // Personal bookmarks only
  }

  // Handle folderId filtering
  if (options.folderId) {
    whereClause.folderId = options.folderId;
  }

  // Handle privacy filtering
  if (options.isPrivate !== undefined) {
    whereClause.isPrivate = options.isPrivate;
  }

  // Apply filter-specific conditions
  if (options.filter === 'favorites') {
    whereClause.isFavorite = true;
  } else if (options.filter === 'recent') {
    // Recent bookmarks from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    whereClause.createdAt = {
      gte: sevenDaysAgo
    };
  } else if (options.filter === 'shared') {
    // Only bookmarks that have been shared
    whereClause.shares = {
      some: {}
    };
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: whereClause,
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
      },
      shares: options.filter === 'shared' ? {
        select: {
          id: true,
          token: true,
          createdAt: true
        }
      } : false
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit || 50,
    skip: options.offset || 0
  });

  return bookmarks.map(bookmark => ({
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
  }));
}