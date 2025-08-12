import { cookies } from "next/headers";
import { validateSessionToken } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { BookmarkManager } from "@/components/bookmark-manager";
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
import { prisma } from "@/lib/server/db";
import { notFound } from "next/navigation";

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

async function getCollection(collectionId: string, userId: string) {
  try {
    const collection = await prisma.folder.findFirst({
      where: {
        id: collectionId,
        OR: [
          { userId: userId },
          { workspace: { members: { some: { userId: userId } } } }
        ]
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            bookmarks: {
              where: {
                isArchived: false
              }
            }
          }
        }
      }
    });

    return collection;
  } catch (error) {
    console.error("Error fetching collection:", error);
    return null;
  }
}

// Updated interface for Next.js 15 - params is now a Promise
interface CollectionPageProps {
  params: Promise<{
    collectionId: string;
  }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  // Await the params to get the actual values
  const { collectionId } = await params;
  
  const user = await getUserData();
  
  if (!user) {
    redirect("/auth/signin");
  }

  const collection = await getCollection(collectionId, user.id);
  
  if (!collection) {
    notFound();
  }

  return (
    <BookmarkCreationProvider>
      <SidebarProvider>
        <AppSidebar user={user} workspaceId={collection.workspace?.id} />
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
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/collections" className="text-white hover:text-gray-300">
                      Collections
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  {collection.workspace && (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href={`/workspace/${collection.workspace.id}`} className="text-white hover:text-gray-300">
                          {collection.workspace.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white">{collection.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-black text-white min-h-screen">
            <div className="mb-8 mt-4">
              <h1 className="text-3xl font-bold text-white mb-2">{collection.name}</h1>
              {collection.description && (
                <p className="text-gray-400">{collection.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {collection._count.bookmarks} bookmark{collection._count.bookmarks !== 1 ? 's' : ''}
              </p>
            </div>
            
            <BookmarkManager 
              userId={user.id}
              folderId={collection.id}
              workspaceId={collection.workspace?.id}
              showCreateButton={true}
              showWorkspace={!!collection.workspace}
              emptyMessage="No bookmarks in this collection"
              emptyDescription="Add bookmarks to organize them in this collection"
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BookmarkCreationProvider>
  );
}