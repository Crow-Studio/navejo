"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MetadataPreview, type ExtractedMetadata } from "@/components/metadata-preview"
import { FolderSelector } from "@/components/folder-selector"
import { TagInput } from "@/components/tag-input"

interface MetadataExtractionResult {
  metadata?: ExtractedMetadata
  cached?: boolean
  error?: string
  fallbackData?: Partial<ExtractedMetadata>
}

// Form validation schema
const bookmarkFormSchema = z.object({
  url: z.string().min(1, "URL is required").url({ message: "Please enter a valid URL" }),
  title: z.string().min(1, "Title is required").max(500, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  notes: z.string().max(1000, "Notes are too long").optional(),
  folderId: z.string().nullable(),
  tags: z.array(z.string()).max(20, "Maximum 20 tags allowed"),
  isPrivate: z.boolean(),
})

type BookmarkFormData = z.infer<typeof bookmarkFormSchema>

interface CreatedBookmark {
  id: string
  title: string
  url: string
  folderId?: string | null
  workspaceId?: string | null
}

interface BookmarkCreationDialogProps {
  isOpen: boolean
  onClose: () => void
  workspaceId?: string
  initialUrl?: string
  onBookmarkCreated?: () => void
  initialData?: {
    title?: string
    description?: string
    tags?: string[]
    folderId?: string
    isPrivate?: boolean
  }
}

export function BookmarkCreationDialog({
  isOpen,
  onClose,
  workspaceId,
  initialData,
  initialUrl = "",
  onBookmarkCreated,
}: BookmarkCreationDialogProps) {
  const router = useRouter()
  const [extractedMetadata, setExtractedMetadata] = React.useState<ExtractedMetadata | null>(null)
  const [isExtractingMetadata, setIsExtractingMetadata] = React.useState(false)
  const [metadataError, setMetadataError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [createdBookmark, setCreatedBookmark] = React.useState<CreatedBookmark | null>(null)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const form = useForm<BookmarkFormData>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      url: initialUrl || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      notes: "",
      folderId: initialData?.folderId || null,
      tags: initialData?.tags || [],
      isPrivate: initialData?.isPrivate ?? (workspaceId ? false : true), // Default to workspace-visible if in workspace context
    },
  })

  const watchedUrl = form.watch("url")

  // Extract metadata when URL changes
  React.useEffect(() => {
    const extractMetadata = async (url: string) => {
      if (!url || !isValidUrl(url)) {
        setExtractedMetadata(null)
        setMetadataError(null)
        return
      }

      setIsExtractingMetadata(true)
      setMetadataError(null)

      try {
        const response = await fetch("/api/bookmarks/extract-metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        })

        const result: MetadataExtractionResult = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to extract metadata")
        }

        if (result.metadata) {
          setExtractedMetadata(result.metadata)
          // Auto-fill form fields if they're empty
          if (!form.getValues("title") && result.metadata.title) {
            form.setValue("title", result.metadata.title)
          }
          if (!form.getValues("description") && result.metadata.description) {
            form.setValue("description", result.metadata.description)
          }
        }
      } catch (error) {
        console.error("Metadata extraction error:", error)
        setMetadataError(error instanceof Error ? error.message : "Failed to extract metadata")
      } finally {
        setIsExtractingMetadata(false)
      }
    }

    // Debounce URL changes
    const timeoutId = setTimeout(() => {
      if (watchedUrl !== initialUrl || watchedUrl) {
        extractMetadata(watchedUrl)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [watchedUrl, form, initialUrl])

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        url: initialUrl,
        title: "",
        description: "",
        notes: "",
        folderId: null,
        tags: [],
        isPrivate: workspaceId ? false : true,
      })
      setExtractedMetadata(null)
      setMetadataError(null)
      setCreatedBookmark(null)
      setSubmitError(null)
    }
  }, [isOpen, initialUrl, workspaceId, form])

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleRetryMetadata = () => {
    const url = form.getValues("url")
    if (url && isValidUrl(url)) {
      // Trigger metadata extraction by updating the URL
      form.setValue("url", url + "?retry=" + Date.now())
      setTimeout(() => form.setValue("url", url), 100)
    }
  }

  const onSubmit = async (data: BookmarkFormData) => {
    // Clear previous errors
    setSubmitError(null)

    // Validate that we have either metadata or user has acknowledged the error
    if (!extractedMetadata && !metadataError && data.url) {
      setSubmitError("Please wait for metadata extraction to complete")
      return
    }

    // Validate required fields
    if (!data.url.trim()) {
      setSubmitError("URL is required")
      return
    }

    if (!data.title.trim()) {
      setSubmitError("Title is required")
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare bookmark data with proper metadata handling
      const bookmarkData = {
        url: data.url.trim(),
        title: data.title.trim(),
        description: data.description?.trim() || "",
        notes: data.notes?.trim() || "",
        folderId: data.folderId || undefined,
        tags: data.tags.filter(tag => tag.trim().length > 0),
        isPrivate: data.isPrivate,
        workspaceId: workspaceId || undefined,
        metadata: extractedMetadata || {
          title: data.title.trim(),
          description: data.description?.trim() || "",
          favicon: null,
          imageUrl: null,
          siteName: null,
          author: null,
          publishedAt: null,
        },
      }

      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookmarkData),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error("You must be logged in to create bookmarks")
        } else if (response.status === 403) {
          throw new Error("You don't have permission to create bookmarks in this workspace")
        } else if (response.status === 404) {
          throw new Error("The selected folder was not found")
        } else if (response.status === 409) {
          throw new Error("A bookmark with this URL already exists")
        } else if (result.details && Array.isArray(result.details)) {
          // Handle validation errors
          const errorMessages = result.details.map((detail: { field: string; message: string }) => `${detail.field}: ${detail.message}`).join(", ")
          throw new Error(`Validation errors: ${errorMessages}`)
        } else {
          throw new Error(result.error || "Failed to create bookmark")
        }
      }

      // Success! Store the created bookmark info
      setCreatedBookmark({
        id: result.bookmark.id,
        title: result.bookmark.title,
        url: result.bookmark.url,
        folderId: result.bookmark.folderId,
        workspaceId: result.bookmark.workspaceId,
      })

      // Show success message
      toast.success("Bookmark created successfully!", {
        description: `"${result.bookmark.title}" has been saved`,
        action: {
          label: "View",
          onClick: () => {
            // Navigate to the bookmark or folder view
            if (workspaceId) {
              router.push(`/workspace/${workspaceId}`)
            } else {
              router.push("/dashboard")
            }
          },
        },
      })

      // Reset form for next use
      form.reset({
        url: "",
        title: "",
        description: "",
        notes: "",
        folderId: null,
        tags: [],
        isPrivate: workspaceId ? false : true,
      })

      // Call the callback if provided
      if (onBookmarkCreated) {
        onBookmarkCreated()
      }

      // Close dialog after a brief delay to show success state
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error) {
      console.error("Bookmark creation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create bookmark"
      setSubmitError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle dialog close with confirmation if form has data
  const handleClose = () => {
    if (createdBookmark) {
      onClose()
      return
    }

    const hasFormData = form.getValues("url") || form.getValues("title") || form.getValues("notes")
    if (hasFormData && !isSubmitting) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {createdBookmark ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Bookmark Created Successfully
              </>
            ) : (
              "Create Bookmark"
            )}
          </DialogTitle>
          <DialogDescription>
            {createdBookmark ? (
              `Your bookmark "${createdBookmark.title}" has been saved${workspaceId ? " to your workspace" : ""}`
            ) : (
              `Save a new bookmark${workspaceId ? " to your workspace" : ""} with automatic metadata extraction`
            )}
          </DialogDescription>
        </DialogHeader>

        {createdBookmark ? (
          // Success state
          <div className="space-y-4">
            <Alert className="border-green-700 bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">
                Your bookmark has been successfully created and saved{workspaceId ? " to your workspace" : ""}.
              </AlertDescription>
            </Alert>
            
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{createdBookmark.title}</p>
                  <p className="text-sm text-gray-600 truncate">{createdBookmark.url}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Form state
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Error Alert */}
              {submitError && (
                <Alert className="border-red-700 bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {submitError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Workspace Context Info */}
              {workspaceId && (
                <Alert className="border-blue-700 bg-blue-900/20">
                  <AlertDescription className="text-blue-400">
                    This bookmark will be saved to your current workspace and will be visible to workspace members unless marked as private.
                  </AlertDescription>
                </Alert>
              )}
            {/* URL Input */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="https://example.com"
                        {...field}
                        className="pr-10"
                      />
                      {isExtractingMetadata && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Metadata Preview */}
            {(extractedMetadata || metadataError || isExtractingMetadata) && (
              <MetadataPreview
                metadata={extractedMetadata}
                isLoading={isExtractingMetadata}
                error={metadataError}
                onRetry={handleRetryMetadata}
                onMetadataChange={(updatedMetadata) => {
                  if (extractedMetadata) {
                    const newMetadata = { ...extractedMetadata, ...updatedMetadata }
                    setExtractedMetadata(newMetadata)
                    // Update form fields if they match the metadata
                    if (updatedMetadata.title && form.getValues("title") === extractedMetadata.title) {
                      form.setValue("title", updatedMetadata.title)
                    }
                    if (updatedMetadata.description && form.getValues("description") === extractedMetadata.description) {
                      form.setValue("description", updatedMetadata.description)
                    }
                  }
                }}
                editable={true}
              />
            )}

            {/* Folder Selection */}
            <FormField
              control={form.control}
              name="folderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Folder</FormLabel>
                  <FormControl>
                    <FolderSelector
                      workspaceId={workspaceId}
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
                      workspaceId={workspaceId}
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

              {/* Privacy Settings */}
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {workspaceId ? "Private Bookmark" : "Personal Bookmark"}
                      </FormLabel>
                      <FormDescription>
                        {field.value
                          ? "Only you can see this bookmark"
                          : workspaceId
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isExtractingMetadata || !form.watch("url") || !form.watch("title")}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Bookmark...
                    </>
                  ) : (
                    "Create Bookmark"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Success state footer */}
        {createdBookmark && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (workspaceId) {
                  router.push(`/workspace/${workspaceId}`)
                } else {
                  router.push("/dashboard")
                }
                onClose()
              }}
            >
              View in {workspaceId ? "Workspace" : "Dashboard"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
            >
              Create Another
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}