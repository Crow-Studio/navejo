import { cookies } from "next/headers";
import { validateSessionToken } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { CollectionManager } from "@/components/collection-manager";
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

async function getUserData() {
  try {
    const cookiesStore = await cookies();
    const sessionToken = cookiesStore.get("session")?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    const { user } = await validateSessionToken(sessionToken);
    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export default async function CollectionsPage() {
  const user = await getUserData();
  
  if (!user) {
    redirect("/auth/signin");
  }

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
                    <BreadcrumbPage className="text-white">Collections</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-black text-white min-h-screen">
            <div className="mb-8 mt-4">
              <h1 className="text-3xl font-bold text-white mb-2">Collections</h1>
              <p className="text-gray-400">Organize your bookmarks into collections</p>
            </div>
            
            <CollectionManager userId={user.id} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BookmarkCreationProvider>
  );
}