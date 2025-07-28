// app/dashboard/page.tsx
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
import GrainOverlay from '@/components/shared/GrainOverlay';
import Greeting from '@/components/shared/greetings';
import DashboardContent from '@/components/dashboard/dashboardContent';
import { cookies } from "next/headers"
import { validateSessionToken } from "@/lib/server/session"

interface User {
  id: string;
  email: string;
}

async function getUserData(): Promise<User | null> {
  try {
    // Get the session token from cookies
    const cookiesStore = await cookies()
    const sessionToken = cookiesStore.get("session")?.value
    
    if (!sessionToken) {
      return null
    }
    
    // Validate the session and get user data
    const { user } = await validateSessionToken(sessionToken)
    
    if (!user) {
      return null
    }
    
    return {
      id: user.id,
      email: user.email
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

export default async function DashboardPage() {
  // Fetch user data on the server
  const user = await getUserData();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center bg-black text-white hover:text-white gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block hover:text-white">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-black text-white">
          <GrainOverlay/>
          
          {/* Greeting Header Section */}
          <div className="mt-4 sm:mt-6 mb-6 sm:mb-8 px-2 sm:px-0">
            {/* Greeting Message with integrated time */}
            <Greeting 
              email={user?.email}
              className="w-full"
            />
          </div>

          {/* Dashboard Content */}
          <DashboardContent />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}