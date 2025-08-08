// lib/server/workspace.ts
import { prisma } from "@/lib/server/db";
import { v4 as uuidv4 } from "uuid";
import { WorkspaceRole } from "@prisma/client";

export interface CreateWorkspaceData {
  name: string;
  description?: string;
  isPrivate?: boolean;
  organizationId?: string;
}

export interface InviteUserData {
  email: string;
  role: WorkspaceRole;
  workspaceId?: string;
  organizationId: string;
}

// Create a new organization and default workspace
export async function createOrganizationWithWorkspace(
  userId: string,
  orgName: string,
  workspaceName: string,
  description?: string
) {
  const orgSlug = generateSlug(orgName);
  const workspaceSlug = generateSlug(workspaceName);

  const organization = await prisma.organization.create({
    data: {
      id: uuidv4(),
      name: orgName,
      slug: orgSlug,
      description,
      ownerId: userId,
      workspaces: {
        create: {
          id: uuidv4(),
          name: workspaceName,
          slug: workspaceSlug,
          description,
          isPrivate: false,
          members: {
            create: {
              id: uuidv4(),
              userId,
              role: WorkspaceRole.OWNER
            }
          }
        }
      }
    },
    include: {
      workspaces: {
        include: {
          members: true
        }
      }
    }
  });

  return organization;
}

// Create a new workspace within an existing organization
export async function createWorkspace(
  userId: string,
  organizationId: string,
  data: CreateWorkspaceData
) {
  // Verify user has permission to create workspace in this organization
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      OR: [
        { ownerId: userId },
        {
          workspaces: {
            some: {
              members: {
                some: {
                  userId,
                  role: { in: [WorkspaceRole.OWNER, WorkspaceRole.ADMIN] }
                }
              }
            }
          }
        }
      ]
    }
  });

  if (!organization) {
    throw new Error("Unauthorized to create workspace in this organization");
  }

  const workspaceSlug = generateSlug(data.name);

  const workspace = await prisma.workspace.create({
    data: {
      id: uuidv4(),
      name: data.name,
      slug: workspaceSlug,
      description: data.description,
      isPrivate: data.isPrivate ?? false,
      organizationId,
      members: {
        create: {
          id: uuidv4(),
          userId,
          role: WorkspaceRole.OWNER
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      },
      organization: true
    }
  });

  return workspace;
}

// Invite user to organization/workspace
export async function inviteUser(
  inviterId: string,
  data: InviteUserData
) {
  // Verify inviter has permission
  const organization = await prisma.organization.findFirst({
    where: {
      id: data.organizationId,
      OR: [
        { ownerId: inviterId },
        {
          workspaces: {
            some: {
              members: {
                some: {
                  userId: inviterId,
                  role: { in: [WorkspaceRole.OWNER, WorkspaceRole.ADMIN] }
                }
              }
            }
          }
        }
      ]
    }
  });

  if (!organization) {
    throw new Error("Unauthorized to invite users to this organization");
  }

  // Check if user is already a member
  if (data.workspaceId) {
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: data.workspaceId,
        user: { email: data.email }
      }
    });

    if (existingMember) {
      throw new Error("User is already a member of this workspace");
    }
  }

  // Check for existing pending invite
  const existingInvite = await prisma.invite.findFirst({
    where: {
      email: data.email,
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      acceptedAt: null,
      expiresAt: { gt: new Date() }
    }
  });

  if (existingInvite) {
    throw new Error("User already has a pending invitation");
  }

  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const invite = await prisma.invite.create({
    data: {
      id: uuidv4(),
      email: data.email,
      token,
      role: data.role,
      organizationId: data.organizationId,
      workspaceId: data.workspaceId,
      invitedById: inviterId,
      expiresAt
    },
    include: {
      organization: true,
      workspace: true
    }
  });

  return invite;
}

// Accept invitation
export async function acceptInvitation(token: string, userId: string) {
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      organization: true,
      workspace: true
    }
  });

  if (!invite) {
    throw new Error("Invalid invitation token");
  }

  if (invite.acceptedAt) {
    throw new Error("Invitation already accepted");
  }

  if (invite.expiresAt < new Date()) {
    throw new Error("Invitation has expired");
  }

  // Get user email to verify
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || user.email !== invite.email) {
    throw new Error("Invitation email does not match user email");
  }

  // Add user to workspace
  if (invite.workspaceId) {
    await prisma.workspaceMember.create({
      data: {
        id: uuidv4(),
        userId,
        workspaceId: invite.workspaceId,
        role: invite.role
      }
    });
  }

  // Mark invitation as accepted
  await prisma.invite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() }
  });

  return invite;
}

// Get user's workspaces
export async function getUserWorkspaces(userId: string) {
  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    include: {
      organization: true,
      members: {
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      },
      _count: {
        select: {
          bookmarks: true,
          folders: true
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return workspaces;
}

// Get workspace details
export async function getWorkspace(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      members: {
        some: { userId }
      }
    },
    include: {
      organization: true,
      members: {
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      },
      folders: {
        where: { parentId: null },
        orderBy: { sortOrder: 'asc' }
      },
      _count: {
        select: {
          bookmarks: true,
          folders: true
        }
      }
    }
  });

  return workspace;
}

// Helper function to generate URL-friendly slugs
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// Get pending invitations for organization
export async function getPendingInvitations(organizationId: string, userId: string) {
  // Verify user has permission to view invitations
  const organization = await prisma.organization.findFirst({
    where: {
      id: organizationId,
      OR: [
        { ownerId: userId },
        {
          workspaces: {
            some: {
              members: {
                some: {
                  userId,
                  role: { in: [WorkspaceRole.OWNER, WorkspaceRole.ADMIN] }
                }
              }
            }
          }
        }
      ]
    }
  });

  if (!organization) {
    throw new Error("Unauthorized to view invitations");
  }

  const invitations = await prisma.invite.findMany({
    where: {
      organizationId,
      acceptedAt: null,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch workspaces for invitations that have workspaceId
  const invitationsWithWorkspaces = await Promise.all(
    invitations.map(async (invitation) => {
      if (invitation.workspaceId) {
        const workspace = await prisma.workspace.findUnique({
          where: { id: invitation.workspaceId }
        });
        return { ...invitation, workspace };
      }
      return { ...invitation, workspace: null };
    })
  );

  return invitationsWithWorkspaces;
}