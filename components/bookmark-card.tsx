"use client"

import * as React from "react"
import { useState } from "react"
import { 
  ExternalLink, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Heart, 
  HeartOff, 
  Share2, 
  Copy, 
  MoreHorizontal,
  Folder,
  Calendar,
  User
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export interface BookmarkData {
  id: string
  title: string
  url: string
  description: string | null
  notes: string | null
  favicon: string | null
  imageUrl: string | null
  siteName: string | null
  author: string | null
  publishedAt: Date | null
  isPrivate: boolean
  isFavorite: boolean
  folder: {
    id: string
    name: string
  } | null
  tags: {
    id: string
    name: string
    color: string | null
  }[]
  workspace: {
    id: string
    name: string
  } | null
  createdAt: Date
  updatedAt: Date
}

interface BookmarkCardProps {
  bookmark: BookmarkData
  onEdit?: (bookmark: BookmarkData) => void
  onDelete?: (bookmarkId: string) => void
  onToggleFavorite?: (bookmarkId: string, isFavorite: boolean) => void
  onShare?: (bookmark: BookmarkData) => void
  showWorkspace?: boolean
  compact?: boolean
}

export function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShare,
  showWorkspace = false,
  compact = false
}: BookmarkCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFavoriting, setIsFavoriting] = useState(false)

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url)
      toast.success("URL copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy URL")
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete(bookmark.id)
      toast.success("Bookmark deleted successfully")
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error("Failed to delete bookmark")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!onToggleFavorite) return
    
    setIsFavoriting(true)
    try {
      await onToggleFavorite(bookmark.id, !bookmark.isFavorite)
      toast.success(bookmark.isFavorite ? "Removed from favorites" : "Added to favorites")
    } catch (error) {
      toast.error("Failed to update favorite status")
    } finally {
      setIsFavoriting(false)
    }
  }

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Favicon */}
            <div className="w-8 h-8 flex-shrink-0  text-black flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
              {bookmark.favicon ? (
                <img 
                  src={bookmark.favicon} 
                  alt="" 
                  className="w-4 h-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <ExternalLink className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {bookmark.title}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {getDomainFromUrl(bookmark.url)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {/* Privacy indicator */}
                  {bookmark.isPrivate ? (
                    <EyeOff className="w-3 h-3 text-gray-400" />
                  ) : (
                    <Eye className="w-3 h-3 text-blue-500" />
                  )}

                  {/* Favorite */}
                  {bookmark.isFavorite && (
                    <Heart className="w-3 h-3 text-red-500 fill-current" />
                  )}

                  {/* More actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(bookmark.url, '_blank')}>
                        <ExternalLink className="w-4 h-4" />
                        Open Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyUrl}>
                        <Copy className="w-4 h-4" />
                        Copy URL
                      </DropdownMenuItem>
                      {onToggleFavorite && (
                        <DropdownMenuItem onClick={handleToggleFavorite} disabled={isFavoriting}>
                          {bookmark.isFavorite ? (
                            <HeartOff className="w-4 h-4" />
                          ) : (
                            <Heart className="w-4 h-4" />
                          )}
                          {bookmark.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                        </DropdownMenuItem>
                      )}
                      {onShare && (
                        <DropdownMenuItem onClick={() => onShare(bookmark)}>
                          <Share2 className="w-4 h-4" />
                          Share
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit(bookmark)}>
                            <Edit className="w-4 h-4" />
                            Edit
                          </DropdownMenuItem>
                        </>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => setShowDeleteDialog(true)}
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                {/* Preview image or favicon */}
                <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  {bookmark.imageUrl ? (
                    <img 
                      src={bookmark.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to favicon
                        if (bookmark.favicon) {
                          e.currentTarget.src = bookmark.favicon
                          e.currentTarget.className = "w-6 h-6"
                        } else {
                          e.currentTarget.style.display = 'none'
                        }
                      }}
                    />
                  ) : bookmark.favicon ? (
                    <img 
                      src={bookmark.favicon} 
                      alt="" 
                      className="w-6 h-6"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <ExternalLink className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Title and metadata */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                    {bookmark.title}
                  </h3>
                  
                  {bookmark.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {bookmark.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{getDomainFromUrl(bookmark.url)}</span>
                    {bookmark.author && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {bookmark.author}
                        </span>
                      </>
                    )}
                    {bookmark.publishedAt && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(bookmark.publishedAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Privacy indicator */}
              <div title={bookmark.isPrivate ? "Private bookmark" : "Visible to workspace members"}>
                {bookmark.isPrivate ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-blue-500" />
                )}
              </div>

              {/* Favorite button */}
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleFavorite}
                  disabled={isFavoriting}
                  className="h-8 w-8"
                >
                  {bookmark.isFavorite ? (
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                  ) : (
                    <HeartOff className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              )}

              {/* More actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => window.open(bookmark.url, '_blank')}>
                    <ExternalLink className="w-4 h-4" />
                    Open Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyUrl}>
                    <Copy className="w-4 h-4" />
                    Copy URL
                  </DropdownMenuItem>
                  {onShare && (
                    <DropdownMenuItem onClick={() => onShare(bookmark)}>
                      <Share2 className="w-4 h-4" />
                      Share
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(bookmark)}>
                        <Edit className="w-4 h-4" />
                        Edit
                      </DropdownMenuItem>
                    </>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Tags */}
          {bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {bookmark.tags.map((tag) => (
                <Badge 
                  key={tag.id} 
                  variant="secondary" 
                  className="text-xs"
                  style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color } : undefined}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Notes */}
          {bookmark.notes && (
            <div className="mb-3">
              <p className="text-sm text-gray-700 line-clamp-3">
                {bookmark.notes}
              </p>
            </div>
          )}

          {/* Footer metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {bookmark.folder && (
                <span className="flex items-center gap-1">
                  <Folder className="w-3 h-3" />
                  {bookmark.folder.name}
                </span>
              )}
              {showWorkspace && bookmark.workspace && (
                <span className="flex items-center gap-1">
                  <span>in {bookmark.workspace.name}</span>
                </span>
              )}
            </div>
            <span>
              Saved {formatDate(bookmark.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bookmark</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{bookmark.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}