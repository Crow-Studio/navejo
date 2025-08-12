"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Search, Filter, Grid, List, SortAsc, SortDesc, Loader2 } from "lucide-react"

import { BookmarkCard, type BookmarkData } from "@/components/bookmark-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface BookmarkListProps {
  bookmarks: BookmarkData[]
  isLoading?: boolean
  onEdit?: (bookmark: BookmarkData) => void
  onDelete?: (bookmarkId: string) => Promise<void>
  onToggleFavorite?: (bookmarkId: string, isFavorite: boolean) => Promise<void>
  onShare?: (bookmark: BookmarkData) => void
  showWorkspace?: boolean
  emptyMessage?: string
  emptyDescription?: string
}

type SortOption = 'newest' | 'oldest' | 'title' | 'domain'
type ViewMode = 'grid' | 'list' | 'compact'

interface FilterState {
  search: string
  tags: string[]
  folders: string[]
  isPrivate: boolean | null
  isFavorite: boolean | null
}

export function BookmarkList({
  bookmarks,
  isLoading = false,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShare,
  showWorkspace = false,
  emptyMessage = "No bookmarks found",
  emptyDescription = "Start by creating your first bookmark"
}: BookmarkListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tags: [],
    folders: [],
    isPrivate: null,
    isFavorite: null
  })

  // Extract unique tags and folders from bookmarks
  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>()
    bookmarks.forEach(bookmark => {
      bookmark.tags.forEach(tag => tagSet.add(tag.name))
    })
    return Array.from(tagSet).sort()
  }, [bookmarks])

  const availableFolders = React.useMemo(() => {
    const folderSet = new Set<string>()
    bookmarks.forEach(bookmark => {
      if (bookmark.folder) {
        folderSet.add(bookmark.folder.name)
      }
    })
    return Array.from(folderSet).sort()
  }, [bookmarks])

  // Filter and sort bookmarks
  const filteredAndSortedBookmarks = React.useMemo(() => {
    let filtered = bookmarks

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(searchLower) ||
        bookmark.description?.toLowerCase().includes(searchLower) ||
        bookmark.url.toLowerCase().includes(searchLower) ||
        bookmark.notes?.toLowerCase().includes(searchLower) ||
        bookmark.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
      )
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(bookmark =>
        filters.tags.some(filterTag =>
          bookmark.tags.some(bookmarkTag => bookmarkTag.name === filterTag)
        )
      )
    }

    // Apply folder filter
    if (filters.folders.length > 0) {
      filtered = filtered.filter(bookmark =>
        bookmark.folder && filters.folders.includes(bookmark.folder.name)
      )
    }

    // Apply privacy filter
    if (filters.isPrivate !== null) {
      filtered = filtered.filter(bookmark => bookmark.isPrivate === filters.isPrivate)
    }

    // Apply favorite filter
    if (filters.isFavorite !== null) {
      filtered = filtered.filter(bookmark => bookmark.isFavorite === filters.isFavorite)
    }

    // Sort bookmarks
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'domain':
          const getDomain = (url: string) => {
            try {
              return new URL(url).hostname
            } catch {
              return url
            }
          }
          return getDomain(a.url).localeCompare(getDomain(b.url))
        default:
          return 0
      }
    })

    return sorted
  }, [bookmarks, filters, sortBy])

  const handleTagFilter = (tag: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      tags: checked 
        ? [...prev.tags, tag]
        : prev.tags.filter(t => t !== tag)
    }))
  }

  const handleFolderFilter = (folder: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      folders: checked 
        ? [...prev.folders, folder]
        : prev.folders.filter(f => f !== folder)
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      tags: [],
      folders: [],
      isPrivate: null,
      isFavorite: null
    })
  }

  const hasActiveFilters = filters.search || 
    filters.tags.length > 0 || 
    filters.folders.length > 0 || 
    filters.isPrivate !== null || 
    filters.isFavorite !== null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading bookmarks...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 ">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and filters */}
        <div className="flex flex-1 gap-2 items-center text-black">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search bookmarks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 text-black bg-white" />
                Filter
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs text-black bg-white">
                    {[
                      filters.tags.length,
                      filters.folders.length,
                      filters.isPrivate !== null ? 1 : 0,
                      filters.isFavorite !== null ? 1 : 0
                    ].reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {/* Privacy filters */}
              <DropdownMenuLabel>Privacy</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.isPrivate === true}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, isPrivate: checked ? true : null }))
                }
              >
                Private only
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.isPrivate === false}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, isPrivate: checked ? false : null }))
                }
              >
                Public only
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />

              {/* Favorite filter */}
              <DropdownMenuLabel>Favorites</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.isFavorite === true}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, isFavorite: checked ? true : null }))
                }
              >
                Favorites only
              </DropdownMenuCheckboxItem>

              {/* Tags filter */}
              {availableTags.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Tags</DropdownMenuLabel>
                  {availableTags.slice(0, 10).map(tag => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={(checked) => handleTagFilter(tag, checked)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                </>
              )}

              {/* Folders filter */}
              {availableFolders.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Folders</DropdownMenuLabel>
                  {availableFolders.slice(0, 10).map(folder => (
                    <DropdownMenuCheckboxItem
                      key={folder}
                      checked={filters.folders.includes(folder)}
                      onCheckedChange={(checked) => handleFolderFilter(folder, checked)}
                    >
                      {folder}
                    </DropdownMenuCheckboxItem>
                  ))}
                </>
              )}

              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full justify-start"
                  >
                    Clear all filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sort and view controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <SortDesc className="w-4 h-4" />
                  Newest
                </div>
              </SelectItem>
              <SelectItem value="oldest">
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4" />
                  Oldest
                </div>
              </SelectItem>
              <SelectItem value="title">A-Z</SelectItem>
              <SelectItem value="domain">Domain</SelectItem>
            </SelectContent>
          </Select>

          {/* View mode */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none border-x"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('compact')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500">Active filters:</span>
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                onClick={() => handleTagFilter(tag, false)}
                className="ml-1 hover:bg-gray-300 rounded-full w-3 h-3 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.folders.map(folder => (
            <Badge key={folder} variant="secondary" className="gap-1">
              {folder}
              <button
                onClick={() => handleFolderFilter(folder, false)}
                className="ml-1 hover:bg-gray-300 rounded-full w-3 h-3 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.isPrivate !== null && (
            <Badge variant="secondary" className="gap-1">
              {filters.isPrivate ? 'Private' : 'Public'}
              <button
                onClick={() => setFilters(prev => ({ ...prev, isPrivate: null }))}
                className="ml-1 hover:bg-gray-300 rounded-full w-3 h-3 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.isFavorite !== null && (
            <Badge variant="secondary" className="gap-1">
              Favorites
              <button
                onClick={() => setFilters(prev => ({ ...prev, isFavorite: null }))}
                className="ml-1 hover:bg-gray-300 rounded-full w-3 h-3 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {filteredAndSortedBookmarks.length} bookmark{filteredAndSortedBookmarks.length !== 1 ? 's' : ''}
        {hasActiveFilters && ` (filtered from ${bookmarks.length})`}
      </div>

      {/* Bookmark list */}
      {filteredAndSortedBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">{emptyMessage}</div>
          <div className="text-sm text-gray-400">{emptyDescription}</div>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        }>
          {filteredAndSortedBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onShare={onShare}
              showWorkspace={showWorkspace}
              compact={viewMode === 'compact'}
            />
          ))}
        </div>
      )}
    </div>
  )
}