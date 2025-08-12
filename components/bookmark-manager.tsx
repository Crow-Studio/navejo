"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { BookmarkList } from "@/components/bookmark-list"
import { BookmarkEditDialog } from "@/components/bookmark-edit-dialog"
import { BookmarkShareDialog } from "@/components/bookmark-share-dialog"
import { BookmarkCreationDialog } from "@/components/bookmark-creation-dialog"
import { Button } from "@/components/ui/button"
import { type BookmarkData } from "@/components/bookmark-card"

interface BookmarkManagerProps {
  userId?: string
  workspaceId?: string
  folderId?: string
  initialBookmarks?: BookmarkData[]
  showCreateButton?: boolean
  showWorkspace?: boolean
  showFilters?: boolean
  showSearch?: boolean
  filter?: 'recent' | 'favorites' | 'shared'
  emptyMessage?: string
  emptyDescription?: string
}

export function BookmarkManager({
  userId,
  workspaceId,
  folderId,
  initialBookmarks = [],
  showCreateButton = true,
  showWorkspace = false,
  showFilters = false,
  showSearch = false,
  filter,
  emptyMessage,
  emptyDescription
}: BookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>(initialBookmarks)
  
  // Debug state changes
  useEffect(() => {
    console.log('Bookmarks state changed:', bookmarks.length, 'bookmarks')
  }, [bookmarks])
  const [isLoading, setIsLoading] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<BookmarkData | null>(null)
  const [sharingBookmark, setSharingBookmark] = useState<BookmarkData | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Debug component lifecycle
  useEffect(() => {
    console.log('BookmarkManager mounted with props:', {
      userId, workspaceId, folderId, filter, initialBookmarks: initialBookmarks.length
    })
    
    return () => {
      console.log('BookmarkManager unmounting')
    }
  }, [])

  // Fetch bookmarks
  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (workspaceId) params.append('workspaceId', workspaceId)
      if (folderId) params.append('folderId', folderId)
      if (filter) params.append('filter', filter)

      const response = await fetch(`/api/bookmarks?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks')
      }

      const data = await response.json()
      setBookmarks(data.bookmarks || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      toast.error('Failed to load bookmarks')
    } finally {
      setIsLoading(false)
    }
  }, [workspaceId, folderId, filter])

  // Load bookmarks on mount and when dependencies change
  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  // Handle bookmark deletion
  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete bookmark')
      }

      // Remove bookmark from local state
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
      
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      throw error // Re-throw to let BookmarkCard handle the error display
    }
  }

  // Handle favorite toggle
  const handleToggleFavorite = async (bookmarkId: string, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFavorite })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update favorite status')
      }

      const data = await response.json()
      
      // Update bookmark in local state
      setBookmarks(prev => prev.map(bookmark => 
        bookmark.id === bookmarkId 
          ? { ...bookmark, isFavorite: data.bookmark.isFavorite }
          : bookmark
      ))
      
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error // Re-throw to let BookmarkCard handle the error display
    }
  }

  // Handle bookmark update from edit dialog
  const handleBookmarkUpdated = (updatedBookmark: BookmarkData) => {
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
    ))
    setEditingBookmark(null)
  }

  // Handle new bookmark creation
  const handleBookmarkCreated = () => {
    // Refresh the bookmark list to include the new bookmark
    fetchBookmarks()
    setShowCreateDialog(false)
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            {folderId ? 'Folder Bookmarks' : workspaceId ? 'Workspace Bookmarks' : 'My Bookmarks'}
          </h2>
          <p className="text-sm text-gray-600">
            {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-black">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('Manual refresh clicked')
              fetchBookmarks()
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {/* <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              console.log('Debug button clicked')
              try {
                const params = new URLSearchParams()
                if (workspaceId) params.append('workspaceId', workspaceId)
                const response = await fetch(`/api/debug/bookmarks?${params.toString()}`)
                const data = await response.json()
                console.log('Debug data:', data)
              } catch (error) {
                console.error('Debug error:', error)
              }
            }}
          >
            Debug
          </Button> */}
          
          {showCreateButton && (
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bookmark
            </Button>
          )}
        </div>
      </div>

      {/* Bookmark List */}
      <BookmarkList
        bookmarks={bookmarks}
        isLoading={isLoading}
        onEdit={setEditingBookmark}
        onDelete={handleDeleteBookmark}
        onToggleFavorite={handleToggleFavorite}
        onShare={setSharingBookmark}
        showWorkspace={showWorkspace}
        emptyMessage={emptyMessage}
        emptyDescription={emptyDescription}
      />

      {/* Edit Dialog */}
      <BookmarkEditDialog
        isOpen={!!editingBookmark}
        onClose={() => setEditingBookmark(null)}
        bookmark={editingBookmark}
        onBookmarkUpdated={handleBookmarkUpdated}
      />

      {/* Share Dialog */}
      <BookmarkShareDialog
        isOpen={!!sharingBookmark}
        onClose={() => setSharingBookmark(null)}
        bookmark={sharingBookmark}
      />

      {/* Create Dialog */}
      {showCreateButton && (
        <BookmarkCreationDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          workspaceId={workspaceId}
          onBookmarkCreated={handleBookmarkCreated}
        />
      )}
    </div>
  )
}