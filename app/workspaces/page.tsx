import { cookies } from "next/headers";
import { validateSessionToken } from "@/lib/server/session";
import { getUserWorkspaces } from "@/lib/server/workspace";
import { redirect } from "next/navigation";
import { BookmarkCreationProvider } from "@/components/bookmark-creation-provider";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreateWorkspaceDrawer } from '@/components/workspace/create-workspace-drawer';
import { FloatingBookmarkButton } from "@/components/floating-bookmark-button";
import Link from "next/link";
import {
  Building2,
  Users,
  Bookmark,
  Folder,
  Plus,
  ArrowRight,
  Calendar
} from "lucide-react";

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
    <BookmarkCreationProvider>
      <SidebarProvider>
        <AppSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center bg-black text-white gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard" className="text-white hover:text-gray-300">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white">Workspaces</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-black text-white min-h-screen">
            {/* Header */}
            <div className="mb-8 mt-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Your Organizations</h1>
                  <p className="text-gray-400">
                    Manage and organize your bookmark collections across teams
                  </p>
                </div>
                <CreateWorkspaceDrawer>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Create Organization
                  </Button>
                </CreateWorkspaceDrawer>
              </div>
            </div>

            {/* Workspaces Grid */}
            {workspaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-32 h-32 rounded-full bg-gray-800 border-gray-700 border-2 flex items-center justify-center mb-8">
                  <Building2 className="w-16 h-16 text-gray-400" />
                </div>
                <div className="space-y-4 mb-8">
                  <h3 className="text-2xl font-semibold text-white">No organizations yet</h3>
                  <p className="text-gray-400 max-w-lg">
                    Create your first organization to start organizing and sharing bookmarks with your team.
                  </p>
                </div>
                <CreateWorkspaceDrawer>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Organization
                  </Button>
                </CreateWorkspaceDrawer>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {workspaces.map((workspace) => (
                  <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
                    <div className="bg-gray-800 border-gray-700 border rounded-lg p-6 hover:bg-gray-700 transition-all duration-300 cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gray-700 text-white border-gray-600">
                            {workspace.organization.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-all duration-200" />
                      </div>

                      <div className="space-y-2 mb-4">
                        <h3 className="text-lg font-semibold text-white group-hover:text-gray-200 transition-colors">
                          {workspace.organization.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Building2 className="w-4 h-4" />
                          <span>{workspace.name}</span>
                        </div>
                        {workspace.description && (
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {workspace.description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-white">
                            <Bookmark className="w-4 h-4" />
                            <span className="font-semibold">{workspace._count.bookmarks}</span>
                          </div>
                          <p className="text-xs text-gray-400">Bookmarks</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-white">
                            <Folder className="w-4 h-4" />
                            <span className="font-semibold">{workspace._count.folders}</span>
                          </div>
                          <p className="text-xs text-gray-400">Collections</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-white">
                            <Users className="w-4 h-4" />
                            <span className="font-semibold">{workspace.members.length}</span>
                          </div>
                          <p className="text-xs text-gray-400">Members</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>Updated {new Date(workspace.updatedAt).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {workspace.isPrivate ? 'Private' : 'Public'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Floating Bookmark Button */}
          <FloatingBookmarkButton />
        </SidebarInset>
      </SidebarProvider>
    </BookmarkCreationProvider>
  );
}