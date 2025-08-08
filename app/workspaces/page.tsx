// app/workspaces/page.tsx
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import GrainOverlay from '@/components/shared/GrainOverlay'
import { CreateWorkspaceDrawer } from '@/components/workspace/create-workspace-drawer'
import { cookies } from "next/headers"
import { validateSessionToken } from "@/lib/server/session"
import { getUserWorkspaces } from "@/lib/server/workspace"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  Building2, 
  Users, 
  Bookmark, 
  Folder, 
  Plus,
  ArrowRight,
  Calendar
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

export default async function WorkspacesPage() {
  const user = await getUserData();
  
  if (!user) {
    redirect('/auth/signin');
  }

  const workspaces = await getUserWorkspaces(user.id);

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
                    Workspaces
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-6 bg-black text-white">
          <GrainOverlay />
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold" style={{ color: '#ffffff' }}>Your Organizations</h1>
              <p className="text-lg" style={{ color: '#f2f2f2' }}>
                Manage and organize your bookmark collections across teams
              </p>
            </div>
            <CreateWorkspaceDrawer>
              <Button 
                className="hover:bg-[#f2f2f2] px-6 py-3 text-base font-medium"
                style={{ backgroundColor: '#ffffff', color: '#000000' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Organization
              </Button>
            </CreateWorkspaceDrawer>
          </div>

          {/* Workspaces Grid */}
          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center mb-8 border-2"
                style={{ backgroundColor: '#080808', borderColor: '#000000' }}
              >
                <Building2 className="w-16 h-16" style={{ color: '#f2f2f2' }} />
              </div>
              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-semibold" style={{ color: '#ffffff' }}>No organizations yet</h3>
                <p className="text-lg max-w-lg leading-relaxed" style={{ color: '#f2f2f2' }}>
                  Create your first organization to start organizing and sharing bookmarks with your team.
                </p>
              </div>
              <CreateWorkspaceDrawer>
                <Button 
                  className="hover:bg-[#f2f2f2] px-8 py-4 text-lg font-medium"
                  style={{ backgroundColor: '#ffffff', color: '#000000' }}
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Create Your First Organization
                </Button>
              </CreateWorkspaceDrawer>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {workspaces.map((workspace) => (
                <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
                  <div 
                    className="rounded-2xl border p-8 hover:bg-[#020202] transition-all duration-300 cursor-pointer group"
                    style={{ backgroundColor: '#080808', borderColor: '#000000' }}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback 
                          className="border text-xl font-semibold"
                          style={{ backgroundColor: '#000000', color: '#ffffff', borderColor: '#020202' }}
                        >
                          {workspace.organization.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ArrowRight 
                        className="w-6 h-6 group-hover:translate-x-1 transition-all duration-200" 
                        style={{ color: '#f2f2f2' }}
                      />
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <h3 
                        className="text-xl font-bold group-hover:text-[#f2f2f2] transition-colors"
                        style={{ color: '#ffffff' }}
                      >
                        {workspace.organization.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-base" style={{ color: '#f2f2f2' }}>
                        <Building2 className="w-4 h-4" />
                        <span>{workspace.name}</span>
                      </div>
                      {workspace.description && (
                        <p className="text-base leading-relaxed line-clamp-2" style={{ color: '#fdfdfd' }}>
                          {workspace.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center space-x-2" style={{ color: '#ffffff' }}>
                          <Bookmark className="w-5 h-5" />
                          <span className="text-lg font-bold">{workspace._count.bookmarks}</span>
                        </div>
                        <p className="text-sm" style={{ color: '#f2f2f2' }}>Bookmarks</p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center space-x-2" style={{ color: '#ffffff' }}>
                          <Folder className="w-5 h-5" />
                          <span className="text-lg font-bold">{workspace._count.folders}</span>
                        </div>
                        <p className="text-sm" style={{ color: '#f2f2f2' }}>Collections</p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center space-x-2" style={{ color: '#ffffff' }}>
                          <Users className="w-5 h-5" />
                          <span className="text-lg font-bold">{workspace.members.length}</span>
                        </div>
                        <p className="text-sm" style={{ color: '#f2f2f2' }}>Members</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t" style={{ borderColor: '#000000' }}>
                      <div className="flex items-center space-x-2 text-sm" style={{ color: '#fdfdfd' }}>
                        <Calendar className="w-4 h-4" />
                        <span>Updated {new Date(workspace.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="border w-fit px-3 py-1"
                        style={{ 
                          borderColor: '#000000', 
                          color: '#f2f2f2',
                          backgroundColor: 'transparent'
                        }}
                      >
                        {workspace.isPrivate ? 'Private' : 'Public'}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}