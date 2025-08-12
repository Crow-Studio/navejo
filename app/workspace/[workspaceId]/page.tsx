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
  const workspace = await getWorkspace(workspaceId, user.id);
  
  if (!workspace) {
    notFound();
  }

  return <WorkspaceLayout user={user} workspace={workspace} />
}