"use client"

import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  callback: () => void
  description?: string
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't trigger shortcuts when user is typing in input fields
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
      const metaMatches = !!shortcut.metaKey === event.metaKey
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey
      const altMatches = !!shortcut.altKey === event.altKey

      if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
        event.preventDefault()
        event.stopPropagation()
        shortcut.callback()
        break
      }
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}

// Helper function to format shortcut display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []
  
  if (shortcut.metaKey) parts.push('⌘')
  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.altKey) parts.push('Alt')
  if (shortcut.shiftKey) parts.push('Shift')
  
  parts.push(shortcut.key.toUpperCase())
  
  return parts.join('+')
}