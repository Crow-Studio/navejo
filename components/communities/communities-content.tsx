"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Link from "next/link";
import {
  Users,
  Bookmark,
  Search,
  ExternalLink,
  Heart,
  Calendar,
  MapPin,
  Globe,
  Copy,
  Download,
  CheckSquare,
  Square,
  Loader2,
  Package
} from "lucide-react";

interface PublicBookmark {
  id: string;
  title: string;
  url: string;
  description: string | null;
  favicon: string | null;
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
  recentBookmarks: PublicBookmark[];
}

interface CommunitiesContentProps {
  user: {
    id: string;
    email: string;
  };
}

export function CommunitiesContent({ user }: CommunitiesContentProps) {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProfiles, setFilteredProfiles] = useState<PublicProfile[]>([]);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set());
  const [bulkImporting, setBulkImporting] = useState(false);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPublicProfiles();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = profiles.filter(profile =>
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles);
    }
  }, [searchQuery, profiles]);

  const fetchPublicProfiles = async () => {
    try {
      const response = await fetch('/api/communities/profiles');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles);
      } else {
        toast.error('Failed to load community profiles');
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load community profiles');
    } finally {
      setLoading(false);
    }
  };

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

  const toggleProfileExpansion = (profileId: string) => {
    const newExpanded = new Set(expandedProfiles);
    if (newExpanded.has(profileId)) {
      newExpanded.delete(profileId);
    } else {
      newExpanded.add(profileId);
    }
    setExpandedProfiles(newExpanded);
  };

  const selectAllBookmarksFromProfile = (profile: PublicProfile) => {
    const newSelection = new Set(selectedBookmarks);
    profile.recentBookmarks.forEach(bookmark => {
      newSelection.add(bookmark.id);
    });
    setSelectedBookmarks(newSelection);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-white mb-2">Communities</h1>
          <p className="text-gray-400">
            Discover and save bookmarks from the community
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-24" />
                    <div className="h-3 bg-gray-700 rounded w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-700 rounded" />
                  <div className="h-3 bg-gray-700 rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 mt-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Communities</h1>
            <p className="text-gray-400">
              Discover and save bookmarks from the community
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
          </div>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBookmarks(new Set())}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Clear Selection
                </Button>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profiles Grid */}
      {filteredProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-32 h-32 rounded-full bg-gray-800 border-gray-700 border-2 flex items-center justify-center mb-8">
            <Users className="w-16 h-16 text-gray-400" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-white">
              {searchQuery ? 'No profiles found' : 'No public profiles yet'}
            </h3>
            <p className="text-gray-400 max-w-lg">
              {searchQuery
                ? 'Try adjusting your search terms to find more profiles.'
                : 'Be the first to make your profile public and share your bookmarks with the community.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={profile.imageUrl || undefined} />
                      <AvatarFallback className="bg-gray-700 text-white">
                        {profile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-white text-lg">{profile.name}</CardTitle>
                      {profile.username && (
                        <p className="text-gray-400 text-sm">@{profile.username}</p>
                      )}
                    </div>
                  </div>
                  <Link href={`/profile/${profile.id}`}>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bio */}
                {profile.bio && (
                  <p className="text-gray-300 text-sm line-clamp-2">{profile.bio}</p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
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
                    <Calendar className="w-3 h-3" />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <Bookmark className="w-4 h-4" />
                    <span>{profile._count.publicBookmarks} public bookmarks</span>
                  </div>
                  {profile.recentBookmarks.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectAllBookmarksFromProfile(profile)}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      Select All
                    </Button>
                  )}
                </div>

                {/* Recent Bookmarks */}
                {profile.recentBookmarks.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-300">Recent Bookmarks</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProfileExpansion(profile.id)}
                        className="text-gray-400 hover:text-white text-xs"
                      >
                        {expandedProfiles.has(profile.id) ? 'Show Less' : 'Show More'}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {profile.recentBookmarks
                        .slice(0, expandedProfiles.has(profile.id) ? undefined : 3)
                        .map((bookmark) => (
                          <div key={bookmark.id} className="flex items-center gap-2 p-2 bg-gray-900 rounded-lg">
                            <Checkbox
                              checked={selectedBookmarks.has(bookmark.id)}
                              onCheckedChange={() => toggleBookmarkSelection(bookmark.id)}
                              className="flex-shrink-0"
                            />
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {bookmark.favicon && (
                                <img
                                  src={bookmark.favicon}
                                  alt=""
                                  className="w-4 h-4 flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-white truncate">{bookmark.title}</p>
                                {bookmark.description && (
                                  <p className="text-xs text-gray-400 truncate">{bookmark.description}</p>
                                )}
                                {bookmark.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {bookmark.tags.slice(0, 2).map((tag) => (
                                      <Badge
                                        key={tag.id}
                                        variant="secondary"
                                        className="text-xs"
                                        style={{ backgroundColor: tag.color ? tag.color + '20' : undefined, color: tag.color || undefined }}
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                    {bookmark.tags.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{bookmark.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyUrl(bookmark.url)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveBookmark(bookmark.id, bookmark.title)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                              >
                                <Heart className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}