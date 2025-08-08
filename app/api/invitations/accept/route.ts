// app/api/invitations/accept/route.ts
import { NextResponse } from "next/server";
import { withAuth, validateRequestBody } from "@/lib/server/auth-helpers";
import { acceptInvitation } from "@/lib/server/workspace";
import { z } from "zod";

const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invitation token is required")
});

// POST /api/invitations/accept - Accept invitation
export const POST = withAuth(async (user, request) => {
  try {
    const body = await request.json();
    const validatedData = validateRequestBody(acceptInviteSchema, body);
    
    if (validatedData instanceof NextResponse) {
      return validatedData; // Return validation error
    }

    const invite = await acceptInvitation(validatedData.token, user.id);

    return NextResponse.json({
      message: "Invitation accepted successfully",
      workspace: invite.workspace,
      organization: invite.organization
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);

    if (error instanceof Error) {
      if (error.message.includes("Invalid") || error.message.includes("expired")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes("already accepted")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error.message.includes("email does not match")) {
        return NextResponse.json({ 
          error: "This invitation was sent to a different email address" 
        }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
});