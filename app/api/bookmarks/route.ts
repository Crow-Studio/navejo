// app/api/bookmarks/route.ts
import { NextResponse } from "next/server";
import { withAuth, validateRequestBody } from "@/lib/server/auth-helpers";
import { createBookmark, getUserBookmarks } from "@/lib/server/bookmark";
import { z } from "zod";

const createBookmarkSchema = z.object({
  url: z.string().url("Invalid URL format"),
  title: z.string().min(1, "Title is required").max(500, "Title too long"),
  description: z.string().optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string().min(1).max(50)).max(20, "Too many tags").default([]),
  isPrivate: z.boolean().default(true),
  workspaceId: z.string().optional(),
  metadata: z.object({
    title: z.string(),
    description: z.string(),
    favicon: z.string().nullable(),
    imageUrl: z.string().nullable(),
    siteName: z.string().nullable(),
    author: z.string().nullable(),
    publishedAt: z.date().nullable()
  })
});

// POST /api/bookmarks - Create new bookmark
export const POST = withAuth(async (user, request) => {
  try {
    const body = await request.json();
    const validatedData = validateRequestBody(createBookmarkSchema, body);
    
    if (validatedData instanceof NextResponse) {
      return validatedData; // Return validation error
    }

    const bookmark = await createBookmark(user.id, validatedData);

    return NextResponse.json({ 
      bookmark,
      message: "Bookmark created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating bookmark:", error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message.includes("already exists")) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
});

// GET /api/bookmarks - Get user's bookmarks
export const GET = withAuth(async (user, request) => {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;
    const folderId = searchParams.get('folderId') || undefined;
    const isPrivate = searchParams.get('isPrivate') === 'true' ? true : 
                     searchParams.get('isPrivate') === 'false' ? false : undefined;
    const filter = searchParams.get('filter') as 'recent' | 'favorites' | 'shared' | undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const bookmarks = await getUserBookmarks(user.id, {
      workspaceId,
      folderId,
      isPrivate,
      filter,
      limit,
      offset
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
});