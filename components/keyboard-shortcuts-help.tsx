"use client"

import * as React from "react"
import { HelpCircle, Keyboard } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface KeyboardShortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: KeyboardShortcut[] = [
  {
    keys: ["⌘", "B"],
    description: "Create new bookmark",
    category: "Bookmarks"
  },
  {
    keys: ["⌘", "⇧", "B"],
    description: "Create bookmark from clipboard URL",
    category: "Bookmarks"
  },
  {
    keys: ["Ctrl", "B"],
    description: "Create new bookmark (Windows/Linux)",
    category: "Bookmarks"
  },
  {
    keys: ["Ctrl", "⇧", "B"],
    description: "Create bookmark from clipboard URL (Windows/Linux)",
    category: "Bookmarks"
  }
]

function ShortcutRow({ shortcut }: { shortcut: KeyboardShortcut }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {shortcut.keys.map((key, index) => (
          <React.Fragment key={index}>
            <Badge variant="outline" className="px-2 py-1 text-xs font-mono">
              {key}
            </Badge>
            {index < shortcut.keys.length - 1 && (
              <span className="text-xs text-gray-400">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = React.useState(false)

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-gray-600 hover:text-gray-900"
        >
          <Keyboard className="h-4 w-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and create bookmarks quickly.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h4 className="font-medium text-sm text-gray-900 mb-2">{category}</h4>
              <div className="space-y-1">
                {categoryShortcuts.map((shortcut, index) => (
                  <ShortcutRow key={index} shortcut={shortcut} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Tips:</p>
              <ul className="space-y-1">
                <li>• Shortcuts work from anywhere in the app</li>
                <li>• Clipboard shortcuts will auto-detect URLs</li>
                <li>• Shortcuts are disabled when typing in forms</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}