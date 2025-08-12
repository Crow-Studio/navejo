"use client"

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
import { InviteUserDrawer } from '@/components/workspace/invite-user-drawer'
import { BookmarkCreationProvider, useBookmarkCreation } from "@/components/bookmark-creation-provider"
import { FloatingBookmarkButton } from "@/components/floating-bookmark-button"
import DashboardContent from '@/components/dashboard/dashboardContent'
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
  Eye,
  Plus
} from "lucide-react"

interface User {
  id: string;
  email: string;
}

interface Workspace {
  id: string;
  name: string;
  description?: string | null;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  members: Array<{
    id: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
    joinedAt: Date;
    user: {
      id: string;
      email: string;
      profile?: {
        name?: string;
        imageUrl?: string;
      } | null;
    };
  }>;
  _count: {
    bookmarks: number;
    folders: number;
  };
}

interface WorkspaceLayoutProps {
  user: User;
  workspace: Workspace;
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

function WorkspaceHeader({ workspace }: { workspace: Workspace }) {
  const { openBookmarkDialog } = useBookmarkCreation()

  return (
    <header className="flex h-16 shrink-0 items-center bg-black text-white gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center justify-between w-full gap-2 px-4">
        <div className="flex items-center gap-2">
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
        
        {/* Header Bookmark Button */}
        <div className="hidden sm:block">
          <Button
            onClick={() => openBookmarkDialog(undefined, workspace.id)}
            className="bg-white text-black hover:bg-gray-100 gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Bookmark
            <span className="hidden lg:inline text-xs opacity-60 ml-1">⌘B</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export function WorkspaceLayout({ user, workspace }: WorkspaceLayoutProps) {
  return (
    <BookmarkCreationProvider currentWorkspaceId={workspace.id}>
      <SidebarProvider>
        <AppSidebar user={user} workspaceId={workspace.id} />
        <SidebarInset>
          <WorkspaceHeader workspace={workspace} />
          
          <div className="flex flex-1 flex-col gap-6 p-6 bg-black text-white min-h-screen">
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

            {/* Workspace Dashboard Stats */}
            <DashboardContent workspaceId={workspace.id} />

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
          
          {/* Floating Bookmark Button */}
          <FloatingBookmarkButton workspaceId={workspace.id} />
        </SidebarInset>
      </SidebarProvider>
    </BookmarkCreationProvider>
  )
}