"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Globe,
  Bookmark,
  Heart,
  Copy,
  ExternalLink,
  Download,
  Search,
  Filter,
  Loader2,
  Package
} from "lucide-react";

interface PublicBookmark {
  id: string;
  title: string;
  url: string;
  description: string | null;
  favicon: string | null;
  imageUrl: string | null;
  createdAt: string;
  tags: { id: string; name: string; color: string | null }[];
  folder: { id: string; name: string } | null;
}

interface PublicProfile {
  id: string;
  name: string;
  username: string | null;
  bio: string | null;
  imageUrl: string | null;
  website: string | null;
  location: string | null;
  createdAt: string;
  _count: {
    publicBookmarks: number;
  };
  bookmarks: PublicBookmark[];
}

interface PublicProfileContentProps {
  profile: PublicProfile;
  currentUser: {
    id: string;
    email: string;
  };
}

export function PublicProfileContent({ profile, currentUser }: PublicProfileContentProps) {
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set());
  const [bulkImporting, setBulkImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBookmarks, setFilteredBookmarks] = useState<PublicBookmark[]>(profile.bookmarks);

  React.useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = profile.bookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredBookmarks(filtered);
    } else {
      setFilteredBookmarks(profile.bookmarks);
    }
  }, [searchQuery, profile.bookmarks]);

  const handleSaveBookmark = async (bookmarkId: string, bookmarkTitle: string) => {
    try {
      const response = await fetch('/api/bookmarks/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceBookmarkId: bookmarkId,
        }),
      });

      if (response.ok) {
        toast.success(`"${bookmarkTitle}" saved to your bookmarks`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save bookmark');
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
      toast.error('Failed to save bookmark');
    }
  };

  const handleBulkImport = async () => {
    if (selectedBookmarks.size === 0) {
      toast.error('Please select bookmarks to import');
      return;
    }

    setBulkImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const promises = Array.from(selectedBookmarks).map(async (bookmarkId) => {
        try {
          const response = await fetch('/api/bookmarks/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sourceBookmarkId: bookmarkId,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch {
          errorCount++;
        }
      });

      await Promise.all(promises);

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} bookmark${successCount > 1 ? 's' : ''}`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} bookmark${errorCount > 1 ? 's' : ''}`);
      }

      setSelectedBookmarks(new Set());
    } catch (error) {
      console.error('Error during bulk import:', error);
      toast.error('Failed to import bookmarks');
    } finally {
      setBulkImporting(false);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard');
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const toggleBookmarkSelection = (bookmarkId: string) => {
    const newSelection = new Set(selectedBookmarks);
    if (newSelection.has(bookmarkId)) {
      newSelection.delete(bookmarkId);
    } else {
      newSelection.add(bookmarkId);
    }
    setSelectedBookmarks(newSelection);
  };

  const selectAllBookmarks = () => {
    const newSelection = new Set(filteredBookmarks.map(bookmark => bookmark.id));
    setSelectedBookmarks(newSelection);
  };

  const clearSelection = () => {
    setSelectedBookmarks(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.imageUrl || undefined} />
              <AvatarFallback className="bg-gray-700 text-white text-2xl">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <CardTitle className="text-white text-2xl">{profile.name}</CardTitle>
                {profile.username && (
                  <p className="text-gray-400 text-lg">@{profile.username}</p>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-gray-300">{profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      Website
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bookmark className="w-4 h-4" />
                  <span>{profile._count.publicBookmarks} public bookmarks</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllBookmarks}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Select All
          </Button>
          {selectedBookmarks.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Clear ({selectedBookmarks.size})
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBookmarks.size > 0 && (
        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-blue-400" />
                <span className="text-blue-100">
                  {selectedBookmarks.size} bookmark{selectedBookmarks.size > 1 ? 's' : ''} selected
                </span>
              </div>
              <Button
                onClick={handleBulkImport}
                disabled={bulkImporting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {bulkImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import Selected
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-32 h-32 rounded-full bg-gray-800 border-gray-700 border-2 flex items-center justify-center mb-8">
            <Bookmark className="w-16 h-16 text-gray-400" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-white">
              {searchQuery ? 'No bookmarks found' : 'No public bookmarks'}
            </h3>
            <p className="text-gray-400 max-w-lg">
              {searchQuery 
                ? 'Try adjusting your search terms to find more bookmarks.'
                : `${profile.name} hasn't shared any public bookmarks yet.`
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark) => (
            <Card key={bookmark.id} className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedBookmarks.has(bookmark.id)}
                    onCheckedChange={() => toggleBookmarkSelection(bookmark.id)}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {bookmark.favicon && (
                      <img 
                        src={bookmark.favicon} 
                        alt="" 
                        className="w-6 h-6 flex-shrink-0 mt-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-white text-lg line-clamp-2 leading-tight">
                        {bookmark.title}
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1 truncate">
                        {new URL(bookmark.url).hostname}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookmark.description && (
                  <p className="text-gray-300 text-sm line-clamp-3">{bookmark.description}</p>
                )}

                {bookmark.imageUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={bookmark.imageUrl} 
                      alt={bookmark.title}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {bookmark.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="secondary" 
                        className="text-xs"
                        style={{ backgroundColor: tag.color ? tag.color + '20' : undefined, color: tag.color || undefined }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {bookmark.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{bookmark.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(bookmark.url, '_blank')}
                      className="text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyUrl(bookmark.url)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveBookmark(bookmark.id, bookmark.title)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-xs text-gray-500">
                  {new Date(bookmark.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}