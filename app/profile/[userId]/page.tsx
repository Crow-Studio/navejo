import { cookies } from "next/headers";
import { validateSessionToken } from "@/lib/server/session";
import { prisma } from "@/lib/server/db";
import { notFound } from "next/navigation";
import { BookmarkCard } from "@/components/bookmark-card";
import { User, Bookmark, Share2 } from "lucide-react";

async function getCurrentUser() {
  try {
    const cookiesStore = await cookies();
    const sessionToken = cookiesStore.get("session")?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    const { user } = await validateSessionToken(sessionToken);
    return user;
  } catch (error) {
    return null;
  }
}

async function getPublicProfile(userId: string) {
  try {
    const profile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        bookmarks: {
          where: {
            isPrivate: false,
            isArchived: false
          },
          include: {
            folder: {
              select: {
                id: true,
                name: true
              }
            },
            tags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    color: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        },
        folders: {
          where: {
            bookmarks: {
              some: {
                isPrivate: false,
                isArchived: false
              }
            }
          },
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
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
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    return profile;
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
}

interface PublicProfilePageProps {
  params: {
    userId: string;
  };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const currentUser = await getCurrentUser();
  const profile = await getPublicProfile(params.userId);
  
  if (!profile) {
    notFound();
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const displayName = profile.profile?.name || profile.email.split('@')[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
              {profile.profile?.imageUrl ? (
                <img 
                  src={profile.profile.imageUrl} 
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{displayName}</h1>
              {profile.profile?.bio && (
                <p className="text-gray-400 mt-1">{profile.profile.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>{profile.bookmarks.length} public bookmarks</span>
                <span>{profile.folders.length} collections</span>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium">Your Public Profile</span>
              </div>
              <p className="text-sm text-gray-300">
                This is how others see your public bookmarks. Only bookmarks marked as public are visible here.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Share this URL: {window.location.href}
              </p>
            </div>
          )}
        </div>

        {/* Collections */}
        {profile.folders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.folders.map((folder) => (
                <div key={folder.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: folder.color || '#6b7280' }}
                    />
                    <h3 className="font-medium text-white">{folder.name}</h3>
                  </div>
                  {folder.description && (
                    <p className="text-sm text-gray-400 mb-2">{folder.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {folder._count.bookmarks} bookmark{folder._count.bookmarks !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Public Bookmarks */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Public Bookmarks</h2>
          {profile.bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No public bookmarks</h3>
              <p className="text-gray-400">
                {isOwnProfile 
                  ? "Mark some of your bookmarks as public to share them here."
                  : "This user hasn't shared any public bookmarks yet."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.bookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={{
                    id: bookmark.id,
                    title: bookmark.title,
                    url: bookmark.url,
                    description: bookmark.description,
                    notes: bookmark.notes,
                    favicon: bookmark.favicon,
                    imageUrl: bookmark.imageUrl,
                    siteName: bookmark.siteName,
                    author: bookmark.author,
                    publishedAt: bookmark.publishedAt,
                    isPrivate: bookmark.isPrivate,
                    isFavorite: bookmark.isFavorite,
                    folder: bookmark.folder,
                    tags: bookmark.tags.map(bt => bt.tag),
                    workspace: null,
                    createdAt: bookmark.createdAt,
                    updatedAt: bookmark.updatedAt
                  }}
                  showWorkspace={false}
                  compact={false}
                  // Disable actions for public view
                  onEdit={undefined}
                  onDelete={undefined}
                  onToggleFavorite={undefined}
                  onShare={undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}