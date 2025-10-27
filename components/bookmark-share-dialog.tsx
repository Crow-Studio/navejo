"use client"

import * as React from "react"
import { useState } from "react"
import { Copy, Share2, Link, Mail, MessageSquare, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { type BookmarkData } from "@/components/bookmark-card"

interface BookmarkShareDialogProps {
  isOpen: boolean
  onClose: () => void
  bookmark: BookmarkData | null
}

export function BookmarkShareDialog({
  isOpen,
  onClose,
  bookmark
}: BookmarkShareDialogProps) {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedTitle, setCopiedTitle] = useState(false)

  const handleCopyUrl = async () => {
    if (!bookmark) return
    
    try {
      await navigator.clipboard.writeText(bookmark.url)
      setCopiedUrl(true)
      toast.success("URL copied to clipboard")
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch {
      toast.error("Failed to copy URL")
    }
  }

  const handleCopyTitle = async () => {
    if (!bookmark) return
    
    try {
      await navigator.clipboard.writeText(bookmark.title)
      setCopiedTitle(true)
      toast.success("Title copied to clipboard")
      setTimeout(() => setCopiedTitle(false), 2000)
    } catch {
      toast.error("Failed to copy title")
    }
  }

  const handleCopyFormatted = async () => {
    if (!bookmark) return
    
    const formattedText = `${bookmark.title}\n${bookmark.url}`
    try {
      await navigator.clipboard.writeText(formattedText)
      toast.success("Formatted text copied to clipboard")
    } catch {
      toast.error("Failed to copy formatted text")
    }
  }

  const handleCopyAppLink = async () => {
    if (!bookmark) return
    
    const appUrl = `${window.location.origin}/shared/bookmark/${bookmark.id}`
    try {
      await navigator.clipboard.writeText(appUrl)
      toast.success("App link copied to clipboard")
    } catch {
      toast.error("Failed to copy app link")
    }
  }

  const handleCopyMarkdown = async () => {
    if (!bookmark) return
    
    const markdownText = `[${bookmark.title}](${bookmark.url})`
    try {
      await navigator.clipboard.writeText(markdownText)
      toast.success("Markdown link copied to clipboard")
    } catch {
      toast.error("Failed to copy markdown")
    }
  }

  const handleEmailShare = () => {
    if (!bookmark) return
    
    const subject = encodeURIComponent(`Check out: ${bookmark.title}`)
    const body = encodeURIComponent(
      `I thought you might find this interesting:\n\n${bookmark.title}\n${bookmark.url}${
        bookmark.description ? `\n\n${bookmark.description}` : ''
      }`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleTwitterShare = () => {
    if (!bookmark) return
    
    const text = encodeURIComponent(`${bookmark.title} ${bookmark.url}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const handleLinkedInShare = () => {
    if (!bookmark) return
    
    const url = encodeURIComponent(bookmark.url)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  if (!bookmark) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] text-black">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Bookmark
          </DialogTitle>
          <DialogDescription>
            Share this bookmark with others or copy it for your own use
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bookmark Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 flex-shrink-0 bg-white rounded-lg overflow-hidden flex items-center justify-center border">
                {bookmark.favicon ? (
                  <img 
                    src={bookmark.favicon} 
                    alt="" 
                    className="w-5 h-5"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                  {bookmark.title}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {getDomainFromUrl(bookmark.url)}
                </p>
                {bookmark.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {bookmark.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Copy Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Copy</Label>
            
            <div className="space-y-2">
              {/* Copy URL */}
              <div className="flex items-center gap-2">
                <Input
                  value={bookmark.url}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="flex-shrink-0"
                >
                  {copiedUrl ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Copy Title */}
              <div className="flex items-center gap-2">
                <Input
                  value={bookmark.title}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTitle}
                  className="flex-shrink-0"
                >
                  {copiedTitle ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Format Options */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyFormatted}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Formatted
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMarkdown}
              >
                <Link className="w-4 h-4 mr-2" />
                Copy Markdown
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAppLink}
                className="col-span-2"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Copy App Link
              </Button>
            </div>
          </div>

          <Separator />

          {/* Social Sharing */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Share On</Label>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmailShare}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Mail className="w-5 h-5" />
                <span className="text-xs">Email</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleTwitterShare}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLinkedInShare}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-xs">LinkedIn</span>
              </Button>
            </div>
          </div>

          {/* Privacy Notice */}
          {bookmark.isPrivate && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This is a private bookmark. Only you can access it through your bookmark collection.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}