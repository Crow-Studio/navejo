// app/workspace/[workspaceId]/page.tsx
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import GrainOverlay from '@/components/shared/GrainOverlay'
import { InviteUserDrawer } from '@/components/workspace/invite-user-drawer'
import { cookies } from "next/headers"
import { validateSessionToken } from "@/lib/server/session"
import { getWorkspace } from "@/lib/server/workspace"
import { notFound, redirect } from "next/navigation"
import { 
  Users, 
  Settings, 
  Bookmark, 
  Folder, 
  UserPlus,
  Building2,
  Calendar,
  Crown,
  Shield,
  User,
  Eye
} from "lucide-react"

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

const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
  VIEWER: Eye
};

const roleColors = {
  OWNER: { bg: '#ffffff', text: '#000000', border: '#f2f2f2' },
  ADMIN: { bg: '#000000', text: '#ffffff', border: '#020202' },
  MEMBER: { bg: '#080808', text: '#f2f2f2', border: '#000000' },
  VIEWER: { bg: '#020202', text: '#fdfdfd', border: '#080808' }
};

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

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center bg-black text-white gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="text-gray-400 hover:text-white">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">
                    {workspace.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-6 bg-black text-white">
          <GrainOverlay />
          
          {/* Workspace Header */}
          <div 
            className="rounded-2xl border p-8"
            style={{ backgroundColor: '#080808', borderColor: '#000000' }}
          >
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
              <div className="flex items-start space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarFallback 
                    className="border text-2xl font-bold"
                    style={{ backgroundColor: '#000000', color: '#ffffff', borderColor: '#020202' }}
                  >
                    {workspace.organization.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3">
                  <h1 className="text-3xl font-bold" style={{ color: '#ffffff' }}>
                    {workspace.organization.name}
                  </h1>
                  <div className="flex items-center space-x-3 text-lg" style={{ color: '#f2f2f2' }}>
                    <Building2 className="w-5 h-5" />
                    <span>{workspace.name}</span>
                  </div>
                  {workspace.description && (
                    <p className="text-lg leading-relaxed max-w-2xl" style={{ color: '#fdfdfd' }}>
                      {workspace.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <InviteUserDrawer 
                  organizationId={workspace.organizationId}
                  workspaceId={workspace.id}
                >
                  <Button 
                    className="hover:bg-[#f2f2f2] px-6 py-3 text-base font-medium"
                    style={{ backgroundColor: '#ffffff', color: '#000000' }}
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Invite Members
                  </Button>
                </InviteUserDrawer>
                <Button 
                  variant="outline" 
                  className="border hover:bg-[#020202] bg-transparent px-6 py-3 text-base font-medium"
                  style={{ borderColor: '#000000', color: '#f2f2f2' }}
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className="rounded-2xl p-8 border"
              style={{ backgroundColor: '#080808', borderColor: '#000000' }}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-4 border rounded-xl"
                  style={{ backgroundColor: '#000000', borderColor: '#020202' }}
                >
                  <Bookmark className="w-8 h-8" style={{ color: '#ffffff' }} />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>
                    {workspace._count.bookmarks}
                  </p>
                  <p className="text-base" style={{ color: '#f2f2f2' }}>Bookmarks</p>
                </div>
              </div>
            </div>
            <div 
              className="rounded-2xl p-8 border"
              style={{ backgroundColor: '#080808', borderColor: '#000000' }}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-4 border rounded-xl"
                  style={{ backgroundColor: '#000000', borderColor: '#020202' }}
                >
                  <Folder className="w-8 h-8" style={{ color: '#ffffff' }} />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>
                    {workspace._count.folders}
                  </p>
                  <p className="text-base" style={{ color: '#f2f2f2' }}>Collections</p>
                </div>
              </div>
            </div>
            <div 
              className="rounded-2xl p-8 border"
              style={{ backgroundColor: '#080808', borderColor: '#000000' }}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className="p-4 border rounded-xl"
                  style={{ backgroundColor: '#000000', borderColor: '#020202' }}
                >
                  <Users className="w-8 h-8" style={{ color: '#ffffff' }} />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>
                    {workspace.members.length}
                  </p>
                  <p className="text-base" style={{ color: '#f2f2f2' }}>Members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div 
            className="rounded-2xl border"
            style={{ backgroundColor: '#080808', borderColor: '#000000' }}
          >
            <div className="p-8 border-b" style={{ borderColor: '#000000' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center" style={{ color: '#ffffff' }}>
                  <Users className="w-6 h-6 mr-3" />
                  Team Members ({workspace.members.length})
                </h3>
              </div>
            </div>
            <div className="p-8">
              <div className="grid gap-6">
                {workspace.members.map((member) => {
                  const RoleIcon = roleIcons[member.role];
                  const roleStyle = roleColors[member.role];
                  return (
                    <div 
                      key={member.id} 
                      className="flex flex-col lg:flex-row lg:items-center justify-between p-6 rounded-xl border gap-6"
                      style={{ backgroundColor: '#000000', borderColor: '#020202' }}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={member.user.profile?.imageUrl || undefined} />
                          <AvatarFallback 
                            className="border text-lg font-semibold"
                            style={{ backgroundColor: '#080808', color: '#ffffff', borderColor: '#020202' }}
                          >
                            {member.user.profile?.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-lg font-semibold" style={{ color: '#ffffff' }}>
                            {member.user.profile?.name || member.user.email.split('@')[0]}
                          </p>
                          <p className="text-base" style={{ color: '#f2f2f2' }}>{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Badge 
                          variant="outline" 
                          className="border px-4 py-2 text-sm font-medium"
                          style={{ 
                            backgroundColor: roleStyle.bg,
                            color: roleStyle.text,
                            borderColor: roleStyle.border
                          }}
                        >
                          <RoleIcon className="w-4 h-4 mr-2" />
                          {member.role.toLowerCase()}
                        </Badge>
                        <div className="flex items-center text-sm" style={{ color: '#fdfdfd' }}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}