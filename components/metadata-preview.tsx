"use client"

import * as React from "react"
import { Loader2, ExternalLink, Image as ImageIcon, AlertCircle, Check, RefreshCw, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

// Types for metadata
export interface ExtractedMetadata {
  title: string
  description: string
  favicon: string | null
  imageUrl: string | null
  siteName: string | null
  author: string | null
  publishedAt: Date | null
}

export interface MetadataPreviewProps {
  metadata: ExtractedMetadata | null
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onMetadataChange?: (metadata: Partial<ExtractedMetadata>) => void
  editable?: boolean
  className?: string
}

export function MetadataPreview({
  metadata,
  isLoading,
  error,
  onRetry,
  onMetadataChange,
  editable = false,
  className = "",
}: MetadataPreviewProps) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [isEditingDescription, setIsEditingDescription] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState("")
  const [editedDescription, setEditedDescription] = React.useState("")
  const [imageError, setImageError] = React.useState(false)

  // Update edited values when metadata changes
  React.useEffect(() => {
    if (metadata) {
      setEditedTitle(metadata.title)
      setEditedDescription(metadata.description)
    }
  }, [metadata])

  // Reset image error when metadata changes
  React.useEffect(() => {
    setImageError(false)
  }, [metadata?.imageUrl])

  const handleTitleSave = () => {
    if (onMetadataChange && editedTitle.trim()) {
      onMetadataChange({ title: editedTitle.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleDescriptionSave = () => {
    if (onMetadataChange) {
      onMetadataChange({ description: editedDescription.trim() })
    }
    setIsEditingDescription(false)
  }

  const handleTitleCancel = () => {
    setEditedTitle(metadata?.title || "")
    setIsEditingTitle(false)
  }

  const handleDescriptionCancel = () => {
    setEditedDescription(metadata?.description || "")
    setIsEditingDescription(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const renderImage = () => {
    if (imageError) {
      // Try favicon as fallback
      if (metadata?.favicon && !imageError) {
        return (
          <img
            src={metadata.favicon}
            alt="Favicon"
            className="w-4 h-4 mt-1 flex-shrink-0"
            onError={handleImageError}
          />
        )
      }
      // Final fallback to placeholder
      return (
        <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      )
    }

    if (metadata?.imageUrl) {
      return (
        <img
          src={metadata.imageUrl}
          alt="Preview"
          className="w-16 h-16 rounded object-cover flex-shrink-0"
          onError={handleImageError}
        />
      )
    }

    if (metadata?.favicon) {
      return (
        <img
          src={metadata.favicon}
          alt="Favicon"
          className="w-4 h-4 mt-1 flex-shrink-0"
          onError={handleImageError}
        />
      )
    }

    return (
      <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
        <ImageIcon className="h-6 w-6 text-muted-foreground" />
      </div>
    )
  }

  const renderEditableTitle = () => {
    if (!editable) {
      return (
        <h5 className="font-medium text-sm line-clamp-2">
          {metadata?.title}
        </h5>
      )
    }

    if (isEditingTitle) {
      return (
        <div className="space-y-2">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="text-sm font-medium"
            placeholder="Enter title"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleTitleSave()
              } else if (e.key === "Escape") {
                handleTitleCancel()
              }
            }}
            autoFocus
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTitleSave}
              className="h-6 px-2 text-xs"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleTitleCancel}
              className="h-6 px-2 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="group flex items-start gap-1">
        <h5 className="font-medium text-sm line-clamp-2 flex-1">
          {metadata?.title}
        </h5>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditingTitle(true)}
          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  const renderEditableDescription = () => {
    if (!metadata?.description) return null

    if (!editable) {
      return (
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {metadata.description}
        </p>
      )
    }

    if (isEditingDescription) {
      return (
        <div className="space-y-2 mt-1">
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="text-sm min-h-[60px]"
            placeholder="Enter description"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleDescriptionSave()
              } else if (e.key === "Escape") {
                handleDescriptionCancel()
              }
            }}
            autoFocus
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDescriptionSave}
              className="h-6 px-2 text-xs"
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDescriptionCancel}
              className="h-6 px-2 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="group mt-1">
        <div className="flex items-start gap-1">
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {metadata.description}
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditingDescription(true)}
            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Preview</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Extracting metadata...</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded bg-muted animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Preview</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-7 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            You can still create the bookmark by manually entering the title and description.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!metadata) {
    return null
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Preview</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {renderImage()}
            <div className="flex-1 min-w-0">
              {renderEditableTitle()}
              {renderEditableDescription()}
              {metadata.siteName && (
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {metadata.siteName}
                  </Badge>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
              {metadata.author && (
                <p className="text-xs text-muted-foreground mt-1">
                  By {metadata.author}
                </p>
              )}
              {metadata.publishedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Published {new Date(metadata.publishedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <Check className="h-3 w-3" />
            <span>Metadata extracted successfully</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}