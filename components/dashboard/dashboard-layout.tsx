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
import Greeting from '@/components/shared/greetings';
import DashboardContent from '@/components/dashboard/dashboardContent';
import { useState, useEffect } from 'react';
import { BookmarkCreationProvider, useBookmarkCreation } from "@/components/bookmark-creation-provider"
import { FloatingBookmarkButton } from "@/components/floating-bookmark-button"
import { UserProvider } from "@/contexts/user-context"

interface User {
  id: string;
  email: string;
}

interface DashboardLayoutProps {
  user: User | null;
  workspaceId?: string;
}

function GreetingWithProfile({ email, className }: { email?: string; className?: string }) {
  const [profileName, setProfileName] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setProfileName(data.profile?.name || null)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [])

  return (
    <Greeting 
      email={email}
      name={profileName || undefined}
      className={className}
    />
  )
}

function DashboardHeader() {
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
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
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

export function DashboardLayout({ user, workspaceId }: DashboardLayoutProps) {
  return (
    <UserProvider initialUser={user}>
      <BookmarkCreationProvider>
        <SidebarProvider>
          <AppSidebar user={user} workspaceId={workspaceId} />
          <SidebarInset>
            <DashboardHeader />
            
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-black text-white min-h-screen">
              {/* Greeting Header Section */}
              <div className="mt-4 sm:mt-6 mb-6 sm:mb-8 px-2 sm:px-0">
                {/* Greeting Message with integrated time */}
                <GreetingWithProfile 
                  email={user?.email}
                  className="w-full"
                />
              </div>

              {/* Dashboard Content */}
              <DashboardContent workspaceId={workspaceId} />
            </div>
            
            {/* Floating Bookmark Button */}
            <FloatingBookmarkButton />
          </SidebarInset>
        </SidebarProvider>
      </BookmarkCreationProvider>
    </UserProvider>
  )
}