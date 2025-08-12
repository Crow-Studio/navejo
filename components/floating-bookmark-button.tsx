"use client"

import * as React from "react"
import { Plus, Bookmark } from "lucide-react"
import { useBookmarkCreation } from "@/components/bookmark-creation-provider"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FloatingBookmarkButtonProps {
  workspaceId?: string
  className?: string
}

export function FloatingBookmarkButton({ 
  workspaceId, 
  className = "" 
}: FloatingBookmarkButtonProps) {
  const { openBookmarkDialog } = useBookmarkCreation()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => openBookmarkDialog(undefined, workspaceId)}
            className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 ${className}`}
            size="icon"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Create new bookmark</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-sm">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            <span>New Bookmark</span>
            <span className="text-xs opacity-60">⌘B</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}