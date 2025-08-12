// app/api/tags/route.ts
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/server/auth-helpers";
import { getUserTags } from "@/lib/server/tag";

// GET /api/tags - Get user's tags for autocomplete
export const GET = withAuth(async (user, request) => {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || undefined;
    const query = searchParams.get('query') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    const tags = await getUserTags(user.id, {
      workspaceId,
      query,
      limit
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
});