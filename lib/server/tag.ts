// lib/server/tag.ts
import { prisma } from "@/lib/server/db";

export interface TagResponse {
  id: string;
  name: string;
  color: string | null;
  bookmarkCount: number;
}

export interface GetTagsOptions {
  workspaceId?: string;
  query?: string;
  limit?: number;
}

/**
 * Gets user's tags with optional filtering and search
 */
export async function getUserTags(
  userId: string,
  options: GetTagsOptions = {}
): Promise<TagResponse[]> {
  const { workspaceId, query, limit = 20 } = options;

  // Build where clause for tag search
  const whereClause: Record<string, unknown> = {
    userId,
  };

  // Add search query if provided
  if (query) {
    whereClause.name = {
      contains: query.toLowerCase(),
      mode: 'insensitive'
    };
  }

  // Get tags with bookmark counts
  const tags = await prisma.tag.findMany({
    where: whereClause,
    include: {
      bookmarks: {
        where: workspaceId ? {
          bookmark: {
            workspaceId
          }
        } : undefined,
        select: {
          id: true
        }
      }
    },
    orderBy: [
      { name: 'asc' }
    ],
    take: limit
  });

  return tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    bookmarkCount: tag.bookmarks.length
  }));
}

/**
 * Gets popular tags for suggestions
 */
export async function getPopularTags(
  userId: string,
  workspaceId?: string,
  limit: number = 10
): Promise<TagResponse[]> {
  const tags = await prisma.tag.findMany({
    where: {
      userId,
    },
    include: {
      bookmarks: {
        where: workspaceId ? {
          bookmark: {
            workspaceId
          }
        } : undefined,
        select: {
          id: true
        }
      }
    },
    orderBy: [
      { bookmarks: { _count: 'desc' } },
      { name: 'asc' }
    ],
    take: limit
  });

  return tags
    .filter(tag => tag.bookmarks.length > 0)
    .map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      bookmarkCount: tag.bookmarks.length
    }));
}