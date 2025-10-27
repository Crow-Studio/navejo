"use client"

import * as React from "react"

import { BookmarkCreationDialog } from "@/components/bookmark-creation-dialog"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useBookmarkUrlParams } from "@/hooks/use-url-params"

interface BookmarkCreationContextType {
  openBookmarkDialog: (initialUrl?: string, workspaceId?: string) => void
  isDialogOpen: boolean
}

const BookmarkCreationContext = React.createContext<BookmarkCreationContextType | null>(null)

export function useBookmarkCreation() {
  const context = React.useContext(BookmarkCreationContext)
  if (!context) {
    // Provide a fallback instead of throwing an error immediately
    // This helps prevent crashes during navigation or SSR hydration
    return {
      openBookmarkDialog: () => {
        console.warn("BookmarkCreationProvider not found. Make sure the component is wrapped with BookmarkCreationProvider.")
      },
      isDialogOpen: false
    }
  }
  return context
}

interface BookmarkCreationProviderProps {
  children: React.ReactNode
  currentWorkspaceId?: string
}

export function BookmarkCreationProvider({ 
  children, 
  currentWorkspaceId 
}: BookmarkCreationProviderProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [dialogInitialUrl, setDialogInitialUrl] = React.useState<string>("")
  const [dialogWorkspaceId, setDialogWorkspaceId] = React.useState<string | undefined>()
  const [dialogInitialData, setDialogInitialData] = React.useState<{
    title?: string
    description?: string
    tags?: string[]
    folderId?: string
    isPrivate?: boolean
  } | undefined>()
  

  const { bookmarkParams, hasParams, clearParams } = useBookmarkUrlParams()

  // Define callback functions first
  const openBookmarkDialog = React.useCallback((initialUrl?: string, workspaceId?: string) => {
    setDialogInitialUrl(initialUrl || "")
    setDialogWorkspaceId(workspaceId || currentWorkspaceId)
    setDialogInitialData(undefined)
    setIsDialogOpen(true)
  }, [currentWorkspaceId])

  const openBookmarkDialogWithData = React.useCallback((
    initialUrl?: string, 
    workspaceId?: string, 
    initialData?: {
      title?: string
      description?: string
      tags?: string[]
      folderId?: string
      isPrivate?: boolean
    }
  ) => {
    setDialogInitialUrl(initialUrl || "")
    setDialogWorkspaceId(workspaceId || currentWorkspaceId)
    setDialogInitialData(initialData)
    setIsDialogOpen(true)
  }, [currentWorkspaceId])

  // Handle URL parameters from browser extension or direct links
  React.useEffect(() => {
    if (hasParams && bookmarkParams.url) {
      // Determine workspace context
      let workspaceId = currentWorkspaceId
      
      // If workspace is specified in URL params, use that
      if (bookmarkParams.workspace) {
        workspaceId = bookmarkParams.workspace
      }
      
      // Prepare initial data from URL parameters
      const initialData = {
        title: bookmarkParams.title,
        description: bookmarkParams.description,
        tags: bookmarkParams.tags ? bookmarkParams.tags.split(',').map(tag => tag.trim()) : undefined,
        folderId: bookmarkParams.folder,
        isPrivate: bookmarkParams.private ? bookmarkParams.private === 'true' : undefined
      }
      
      // Auto-open dialog with URL parameters
      openBookmarkDialogWithData(bookmarkParams.url, workspaceId, initialData)
      
      // Clear URL parameters after opening dialog
      clearParams()
    }
  }, [hasParams, bookmarkParams, currentWorkspaceId, clearParams, openBookmarkDialogWithData])

  const closeBookmarkDialog = React.useCallback(() => {
    setIsDialogOpen(false)
    setDialogInitialUrl("")
    setDialogWorkspaceId(undefined)
    setDialogInitialData(undefined)
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'b',
        metaKey: true, // Cmd+B on Mac
        ctrlKey: false,
        callback: () => openBookmarkDialog(),
        description: 'Create new bookmark'
      },
      {
        key: 'b',
        ctrlKey: true, // Ctrl+B on Windows/Linux
        metaKey: false,
        callback: () => openBookmarkDialog(),
        description: 'Create new bookmark'
      },
      {
        key: 'b',
        metaKey: true, // Cmd+Shift+B on Mac
        shiftKey: true,
        callback: () => {
          // Try to get URL from clipboard
          if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(text => {
              // Basic URL validation
              try {
                new URL(text)
                openBookmarkDialog(text)
              } catch {
                // If not a valid URL, just open empty dialog
                openBookmarkDialog()
              }
            }).catch(() => {
              // Fallback if clipboard access fails
              openBookmarkDialog()
            })
          } else {
            openBookmarkDialog()
          }
        },
        description: 'Create bookmark from clipboard URL'
      },
      {
        key: 'b',
        ctrlKey: true, // Ctrl+Shift+B on Windows/Linux
        shiftKey: true,
        callback: () => {
          // Try to get URL from clipboard
          if (navigator.clipboard && navigator.clipboard.readText) {
            navigator.clipboard.readText().then(text => {
              // Basic URL validation
              try {
                new URL(text)
                openBookmarkDialog(text)
              } catch {
                // If not a valid URL, just open empty dialog
                openBookmarkDialog()
              }
            }).catch(() => {
              // Fallback if clipboard access fails
              openBookmarkDialog()
            })
          } else {
            openBookmarkDialog()
          }
        },
        description: 'Create bookmark from clipboard URL'
      }
    ],
    enabled: !isDialogOpen // Disable shortcuts when dialog is open
  })

  const contextValue: BookmarkCreationContextType = {
    openBookmarkDialog,
    isDialogOpen
  }

  return (
    <BookmarkCreationContext.Provider value={contextValue}>
      {children}
      <BookmarkCreationDialog
        isOpen={isDialogOpen}
        onClose={closeBookmarkDialog}
        workspaceId={dialogWorkspaceId}
        initialUrl={dialogInitialUrl}
        initialData={dialogInitialData}
      />
    </BookmarkCreationContext.Provider>
  )
}