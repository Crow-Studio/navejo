"use client"

import * as React from "react"
import { Check, ChevronDown, Folder, FolderPlus, Plus } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Folder {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  isDefault: boolean
  _count: {
    bookmarks: number
    children: number
  }
}

interface FolderSelectorProps {
  workspaceId?: string
  selectedFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
  onCreateFolder?: (name: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function FolderSelector({
  workspaceId,
  selectedFolderId,
  onFolderSelect,
  onCreateFolder,
  disabled = false,
  placeholder = "Select folder...",
  className,
}: FolderSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [folders, setFolders] = React.useState<Folder[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [newFolderName, setNewFolderName] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)

  // Load folders when component mounts or workspace changes
  React.useEffect(() => {
    loadFolders()
  }, [workspaceId, loadFolders])

  const loadFolders = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (workspaceId) {
        params.set('workspaceId', workspaceId)
      }

      const response = await fetch(`/api/folders?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to load folders")
      }

      setFolders(result.folders || [])

      // Auto-select default folder if no folder is selected
      if (!selectedFolderId && result.folders?.length > 0) {
        const defaultFolder = result.folders.find((f: Folder) => f.isDefault)
        if (defaultFolder) {
          onFolderSelect(defaultFolder.id)
        }
      }
    } catch (error) {
      console.error("Error loading folders:", error)
      toast.error("Failed to load folders")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name")
      return
    }

    setIsCreating(true)
    try {
      const folderData = {
        name: newFolderName.trim(),
        workspaceId,
      }

      if (onCreateFolder) {
        // Use custom create handler if provided
        await onCreateFolder(newFolderName.trim())
      } else {
        // Use default API call
        const response = await fetch("/api/folders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(folderData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to create folder")
        }

        // Add new folder to the list and select it
        const newFolder = result.folder
        setFolders(prev => [...prev, newFolder])
        onFolderSelect(newFolder.id)
      }

      toast.success("Folder created successfully")
      setShowCreateDialog(false)
      setNewFolderName("")
      
      // Reload folders to get updated data
      await loadFolders()
    } catch (error) {
      console.error("Error creating folder:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create folder")
    } finally {
      setIsCreating(false)
    }
  }

  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {selectedFolder ? selectedFolder.name : placeholder}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search folders..." />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Loading folders..." : "No folders found."}
              </CommandEmpty>
              
              {folders.length > 0 && (
                <CommandGroup>
                  {folders.map((folder) => (
                    <CommandItem
                      key={folder.id}
                      value={folder.name}
                      onSelect={() => {
                        onFolderSelect(folder.id)
                        setOpen(false)
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{folder.name}</span>
                            {folder.isDefault && (
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                Default
                              </span>
                            )}
                          </div>
                          {folder.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {folder.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {folder._count.bookmarks}
                        </span>
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          selectedFolderId === folder.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setShowCreateDialog(true)
                    setOpen(false)
                  }}
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create new folder
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[425px] text-black">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              {workspaceId 
                ? "Create a new folder in this workspace" 
                : "Create a new personal folder"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isCreating) {
                    handleCreateFolder()
                  }
                }}
                disabled={isCreating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                setNewFolderName("")
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateFolder}
              disabled={isCreating || !newFolderName.trim()}
            >
              {isCreating ? (
                <>
                  <Plus className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Folder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}