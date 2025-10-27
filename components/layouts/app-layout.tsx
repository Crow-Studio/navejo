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
import { Plus } from "lucide-react"
import { BookmarkCreationProvider, useBookmarkCreation } from "@/components/bookmark-creation-provider"
import { FloatingBookmarkButton } from "@/components/floating-bookmark-button"
import { ReactNode } from "react"

interface User {
  id: string;
  email: string;
}

interface AppLayoutProps {
  user: User | null;
  workspaceId?: string;
  children: ReactNode;
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
  showGreeting?: boolean;
}

function AppHeader({ breadcrumbs }: { breadcrumbs?: AppLayoutProps['breadcrumbs'] }) {
  const { openBookmarkDialog } = useBookmarkCreation()

  return (
    <header className="flex h-16 shrink-0 items-center bg-black text-white hover:text-white gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center justify-between w-full gap-2 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs?.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                  <BreadcrumbItem className="hidden md:block hover:text-white">
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        
        {/* Header Bookmark Button */}
        <div className="hidden sm:block">
          <Button
            onClick={() => openBookmarkDialog()}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
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

export function AppLayout({ user, workspaceId, children, breadcrumbs, showGreeting = false }: AppLayoutProps) {
  return (
    <BookmarkCreationProvider>
      <SidebarProvider>
        <AppSidebar user={user} workspaceId={workspaceId} />
        <SidebarInset>
          <AppHeader breadcrumbs={breadcrumbs} />
          
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-black text-white min-h-screen">
            {children}
          </div>
          
          {/* Floating Bookmark Button */}
          <FloatingBookmarkButton />
        </SidebarInset>
      </SidebarProvider>
    </BookmarkCreationProvider>
  )
}