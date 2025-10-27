import { cookies } from "next/headers";
import { validateSessionToken } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
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
import { PublicProfileContent } from "@/components/profile/public-profile-content";

const prisma = new PrismaClient();

interface User {
  id: string;
  email: string;
}

async function getUserData(): Promise<User | null> {
  try {
    const cookiesStore = await cookies();
    const sessionToken = cookiesStore.get("session")?.value;

    if (!sessionToken) {
      return null;
    }

    const { user } = await validateSessionToken(sessionToken);
    return user ? { id: user.id, email: user.email } : null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

async function getPublicProfile(userId: string) {
  try {
    const profile = await prisma.profile.findFirst({
      where: {
        userId,
        isPublic: true
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        imageUrl: true,
        website: true,
        location: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            bookmarks: {
              where: {
                isPrivate: false,
                isArchived: false
              },
              select: {
                id: true,
                title: true,
                url: true,
                description: true,
                favicon: true,
                imageUrl: true,
                createdAt: true,
                tags: {
                  select: {
                    tag: {
                      select: {
                        id: true,
                        name: true,
                        color: true
                      }
                    }
                  }
                },
                folder: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            },
            _count: {
              select: {
                bookmarks: {
                  where: {
                    isPrivate: false,
                    isArchived: false
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      name: profile.name,
      username: profile.username,
      bio: profile.bio,
      imageUrl: profile.imageUrl,
      website: profile.website,
      location: profile.location,
      createdAt: profile.createdAt.toISOString(),
      _count: {
        publicBookmarks: profile.user._count.bookmarks
      },
      bookmarks: profile.user.bookmarks.map(bookmark => ({
        id: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        favicon: bookmark.favicon,
        imageUrl: bookmark.imageUrl,
        createdAt: bookmark.createdAt.toISOString(),
        tags: bookmark.tags.map(bookmarkTag => bookmarkTag.tag),
        folder: bookmark.folder
      }))
    };
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getUserData();

  if (!user) {
    redirect('/auth/signin');
  }

  const profile = await getPublicProfile(userId);

  if (!profile) {
    redirect('/communities');
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
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/communities" className="text-white hover:text-gray-300">
                      Communities
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white">{profile.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-black text-white min-h-screen">
            <PublicProfileContent profile={profile} currentUser={user} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BookmarkCreationProvider>
  );
}