"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save, X } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FolderSelector } from "@/components/folder-selector"
import { TagInput } from "@/components/tag-input"
import { type BookmarkData } from "@/components/bookmark-card"

// Form validation schema
const editBookmarkSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  notes: z.string().max(1000, "Notes are too long").optional(),
  folderId: z.string().nullable(),
  tags: z.array(z.string()).max(20, "Maximum 20 tags allowed"),
  isPrivate: z.boolean(),
  isFavorite: z.boolean(),
})

type EditBookmarkFormData = z.infer<typeof editBookmarkSchema>

interface BookmarkEditDialogProps {
  isOpen: boolean
  onClose: () => void
  bookmark: BookmarkData | null
  onBookmarkUpdated?: (updatedBookmark: BookmarkData) => void
}

export function BookmarkEditDialog({
  isOpen,
  onClose,
  bookmark,
  onBookmarkUpdated
}: BookmarkEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<EditBookmarkFormData>({
    resolver: zodResolver(editBookmarkSchema),
    defaultValues: {
      title: "",
      description: "",
      notes: "",
      folderId: null,
      tags: [],
      isPrivate: true,
      isFavorite: false,
    },
  })

  // Reset form when bookmark changes
  React.useEffect(() => {
    if (bookmark && isOpen) {
      form.reset({
        title: bookmark.title,
        description: bookmark.description || "",
        notes: bookmark.notes || "",
        folderId: bookmark.folder?.id || null,
        tags: bookmark.tags.map(tag => tag.name),
        isPrivate: bookmark.isPrivate,
        isFavorite: bookmark.isFavorite,
      })
    }
  }, [bookmark, isOpen, form])

  const onSubmit = async (data: EditBookmarkFormData) => {
    if (!bookmark) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title.trim(),
          description: data.description?.trim() || null,
          notes: data.notes?.trim() || null,
          folderId: data.folderId,
          tags: data.tags.filter(tag => tag.trim().length > 0),
          isPrivate: data.isPrivate,
          isFavorite: data.isFavorite,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Bookmark not found")
        } else if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((detail: any) => `${detail.field}: ${detail.message}`).join(", ")
          throw new Error(`Validation errors: ${errorMessages}`)
        } else {
          throw new Error(result.error || "Failed to update bookmark")
        }
      }

      // Success!
      toast.success("Bookmark updated successfully")
      
      // Notify parent component
      if (onBookmarkUpdated && result.bookmark) {
        onBookmarkUpdated(result.bookmark)
      }

      onClose()

    } catch (error) {
      console.error("Bookmark update error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update bookmark"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    
    const hasChanges = form.formState.isDirty
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  if (!bookmark) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>
            Update your bookmark details and organization
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Input */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bookmark title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Input */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of the bookmark content
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes Input */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add your personal notes..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your private notes about this bookmark (max 1000 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Folder Selection */}
            <FormField
              control={form.control}
              name="folderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder</FormLabel>
                  <FormControl>
                    <FolderSelector
                      workspaceId={bookmark.workspace?.id}
                      selectedFolderId={field.value}
                      onFolderSelect={field.onChange}
                      placeholder="Select a folder or create new..."
                    />
                  </FormControl>
                  <FormDescription>
                    Choose a folder to organize your bookmark
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags Input */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput
                      workspaceId={bookmark.workspace?.id}
                      selectedTags={field.value || []}
                      onTagsChange={field.onChange}
                      placeholder="Add tags to organize your bookmark..."
                      maxTags={20}
                    />
                  </FormControl>
                  <FormDescription>
                    Add tags to make your bookmark easier to find (max 20 tags)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Privacy Settings */}
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {bookmark.workspace ? "Private Bookmark" : "Personal Bookmark"}
                    </FormLabel>
                    <FormDescription>
                      {field.value
                        ? "Only you can see this bookmark"
                        : bookmark.workspace
                          ? "Visible to all workspace members"
                          : "Saved to your personal collection"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Favorite Settings */}
            <FormField
              control={form.control}
              name="isFavorite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Favorite</FormLabel>
                    <FormDescription>
                      Mark this bookmark as a favorite for quick access
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isDirty}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}