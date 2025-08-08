// app/api/invitations/route.ts
import { NextResponse } from "next/server";
import { withAuth, validateRequestBody } from "@/lib/server/auth-helpers";
import { inviteUser, getPendingInvitations } from "@/lib/server/workspace";
import { prisma } from "@/lib/server/db";
import { WorkspaceRole } from "@prisma/client";
import { z } from "zod";

const inviteUserSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  role: z.nativeEnum(WorkspaceRole),
  organizationId: z.string().min(1, "Organization ID is required"),
  workspaceId: z.string().optional()
});

type InviteUserRequest = z.infer<typeof inviteUserSchema>;

// POST /api/invitations - Send invitation
export const POST = withAuth(async (user, request) => {
  try {
    const body = await request.json();
    const validatedData = validateRequestBody<InviteUserRequest>(inviteUserSchema, body);

    if (validatedData instanceof NextResponse) {
      return validatedData; // Return validation error
    }

    const invite = await inviteUser(user.id, validatedData);

    // Send invitation email
    try {
      const { sendInvitationEmail } = await import("@/lib/email/send-invitation");
      const inviterProfile = await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true }
      });

      const organization = await prisma.organization.findUnique({
        where: { id: validatedData.organizationId }
      });

      const workspace = validatedData.workspaceId ? await prisma.workspace.findUnique({
        where: { id: validatedData.workspaceId }
      }) : null;

      await sendInvitationEmail({
        to: invite.email,
        invitedByName: inviterProfile?.profile?.name || inviterProfile?.email.split('@')[0] || 'Someone',
        invitedByEmail: inviterProfile?.email || '',
        organizationName: organization?.name || 'Unknown Organization',
        workspaceName: workspace?.name,
        inviteToken: invite.token,
        role: invite.role,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Don't fail the invitation if email fails
    }

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
        organization: invite.organization,
        workspace: invite.workspace
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error sending invitation:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("already")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
    }

    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
});

// GET /api/invitations?organizationId=xxx - Get pending invitations
export const GET = withAuth(async (user, request) => {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId parameter is required" },
        { status: 400 }
      );
    }

    const invitations = await getPendingInvitations(organizationId, user.id);

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
});

