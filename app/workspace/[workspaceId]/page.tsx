// app/workspace/[workspaceId]/page.tsx
import { WorkspaceLayout } from "@/components/workspace/workspace-layout"
import { cookies } from "next/headers"
import { validateSessionToken } from "@/lib/server/session"
import { getWorkspace } from "@/lib/server/workspace"
import { notFound, redirect } from "next/navigation"

interface User {
  id: string;
  email: string;
}

async function getUserData(): Promise<User | null> {
  try {
    const cookiesStore = await cookies()
    const sessionToken = cookiesStore.get("session")?.value

    if (!sessionToken) {
      return null
    }

    const { user } = await validateSessionToken(sessionToken)
    return user ? { id: user.id, email: user.email } : null
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

export default async function WorkspacePage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const user = await getUserData();

  if (!user) {
    redirect('/auth/signin');
  }

  const { workspaceId } = await params;
  const workspaceData = await getWorkspace(workspaceId, user.id);

  if (!workspaceData) {
    notFound();
  }

  // Transform the data to match the expected interface
  const workspace = {
    ...workspaceData,
    members: workspaceData.members.map(member => ({
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      user: {
        id: member.user.id,
        email: member.user.email,
        profile: member.user.profile ? {
          name: member.user.profile.name || undefined,
          imageUrl: member.user.profile.imageUrl || undefined,
        } : null
      }
    }))
  };

  return <WorkspaceLayout user={user} workspace={workspace} />
}