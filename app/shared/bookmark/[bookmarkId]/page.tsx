import { prisma } from "@/lib/server/db";
import { notFound } from "next/navigation";
import { BookmarkCard } from "@/components/bookmark-card";
import { ExternalLink, User, Calendar } from "lucide-react";

async function getSharedBookmark(bookmarkId: string) {
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: { 
        id: bookmarkId,
        isPrivate: false // Only allow public bookmarks to be shared
      },
      include: {
        user: {
          include: {
            profile: true
          }
        },
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
        },
        workspace: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return bookmark;
  } catch (error) {
    console.error("Error fetching shared bookmark:", error);
    return null;
  }
}

interface SharedBookmarkPageProps {
  params: {
    bookmarkId: string;
  };
}

export default async function SharedBookmarkPage({ params }: SharedBookmarkPageProps) {
  const bookmark = await getSharedBookmark(params.bookmarkId);
  
  if (!bookmark) {
    notFound();
  }

  const displayName = bookmark.user.profile?.name || bookmark.user.email.split('@')[0];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <span>Shared bookmark from</span>
            <a 
              href={`/profile/${bookmark.user.id}`}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <User className="w-4 h-4" />
              {displayName}
            </a>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">{bookmark.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(bookmark.createdAt).toLocaleDateString()}
            </div>
            {bookmark.folder && (
              <div className="flex items-center gap-1">
                <span>in</span>
                <span className="text-gray-300">{bookmark.folder.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bookmark Card */}
        <div className="mb-8">
          <BookmarkCard
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
              workspace: bookmark.workspace,
              createdAt: bookmark.createdAt,
              updatedAt: bookmark.updatedAt
            }}
            showWorkspace={false}
            compact={false}
            // Disable actions for shared view
            onEdit={undefined}
            onDelete={undefined}
            onToggleFavorite={undefined}
            onShare={undefined}
          />
        </div>

        {/* Visit Original Link */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Visit Original Link</h3>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open {bookmark.siteName || 'Website'}
          </a>
        </div>

        {/* More from User */}
        <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">More from {displayName}</h3>
          <p className="text-gray-400 mb-4">
            Discover more public bookmarks and collections from this user.
          </p>
          <a
            href={`/profile/${bookmark.user.id}`}
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <User className="w-4 h-4" />
            View {displayName}&apos;s Profile
          </a>
        </div>
      </div>
    </div>
  );
}