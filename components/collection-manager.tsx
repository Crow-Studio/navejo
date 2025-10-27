"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Plus, Folder, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"

interface Collection {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isDefault: boolean;
  _count: {
    bookmarks: number;
  };
}

interface CollectionManagerProps {
  userId: string;
  workspaceId?: string;
}

export function CollectionManager({ userId: _userId, workspaceId }: CollectionManagerProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCollections = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (workspaceId) {
        params.append('workspaceId', workspaceId);
      }

      const response = await fetch(`/api/folders/user?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCollections(data.folders || []);
      } else {
        throw new Error('Failed to fetch collections');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            {workspaceId ? 'Workspace Collections' : 'My Collections'}
          </h2>
          <p className="text-sm text-gray-400">
            {collections.length} collection{collections.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-black">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCollections}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}/>
            Refresh
          </Button>
          
          <Button size="sm" asChild>
            <Link href="/collections/new">
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Link>
          </Button>
        </div>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No collections yet</h3>
          <p className="text-gray-400 mb-6">Create your first collection to organize your bookmarks</p>
          <Button asChild>
            <Link href="/collections/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Folder 
                    className="w-5 h-5" 
                    style={{ color: collection.color || undefined }}
                  />
                  {collection.name}
                  {collection.isDefault && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </CardTitle>
                {collection.description && (
                  <CardDescription className="text-gray-400">
                    {collection.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {collection._count.bookmarks} bookmark{collection._count.bookmarks !== 1 ? 's' : ''}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/collections/${collection.id}`} className="bg-white">
                      View
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}