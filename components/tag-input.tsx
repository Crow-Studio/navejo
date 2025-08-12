"use client"

import * as React from "react"
import { X, Tag, Plus } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface TagData {
  id: string
  name: string
  color: string | null
  bookmarkCount: number
}

interface TagInputProps {
  workspaceId?: string
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  maxTags?: number
}

export function TagInput({
  workspaceId,
  selectedTags,
  onTagsChange,
  disabled = false,
  placeholder = "Add tags...",
  className,
  maxTags = 20,
}: TagInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [availableTags, setAvailableTags] = React.useState<TagData[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [showInput, setShowInput] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Load available tags when component mounts or workspace changes
  React.useEffect(() => {
    loadTags()
  }, [workspaceId])

  // Load tags with search query
  React.useEffect(() => {
    if (open) {
      loadTags(inputValue)
    }
  }, [inputValue, open])

  // Focus input when showing
  React.useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showInput])

  const loadTags = async (query?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (workspaceId) {
        params.set('workspaceId', workspaceId)
      }
      if (query) {
        params.set('query', query)
      }
      params.set('limit', '20')

      const response = await fetch(`/api/tags?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to load tags")
      }

      setAvailableTags(result.tags || [])
    } catch (error) {
      console.error("Error loading tags:", error)
      toast.error("Failed to load tags")
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase()
    
    if (!trimmedTag) {
      toast.error("Tag name cannot be empty")
      return
    }

    if (trimmedTag.length > 50) {
      toast.error("Tag name is too long (max 50 characters)")
      return
    }

    if (selectedTags.includes(trimmedTag)) {
      toast.error("Tag already added")
      return
    }

    if (selectedTags.length >= maxTags) {
      toast.error(`Maximum ${maxTags} tags allowed`)
      return
    }

    onTagsChange([...selectedTags, trimmedTag])
    setInputValue("")
    setOpen(false)
    setShowInput(false)
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === "Escape") {
      setShowInput(false)
      setInputValue("")
    } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(selectedTags[selectedTags.length - 1])
    }
  }

  const filteredTags = availableTags.filter(tag => 
    !selectedTags.includes(tag.name) &&
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const canCreateNewTag = inputValue.trim() && 
    !availableTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) &&
    !selectedTags.includes(inputValue.trim().toLowerCase())

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <Tag className="h-3 w-3" />
              <span>{tag}</span>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Input */}
      <div className="flex items-center gap-2">
        {showInput ? (
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!inputValue.trim()) {
                  setShowInput(false)
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              className="h-8"
            />
          </div>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="flex-1 justify-start h-8 text-muted-foreground"
                disabled={disabled || selectedTags.length >= maxTags}
              >
                <Tag className="mr-2 h-4 w-4" />
                {selectedTags.length >= maxTags 
                  ? `Maximum ${maxTags} tags reached`
                  : placeholder
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search or create tags..." 
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                <CommandList>
                  <CommandEmpty>
                    {isLoading ? "Loading tags..." : "No tags found."}
                  </CommandEmpty>
                  
                  {/* Create new tag option */}
                  {canCreateNewTag && (
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => addTag(inputValue)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create "{inputValue.trim()}"
                      </CommandItem>
                    </CommandGroup>
                  )}
                  
                  {/* Existing tags */}
                  {filteredTags.length > 0 && (
                    <CommandGroup heading="Existing Tags">
                      {filteredTags.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          value={tag.name}
                          onSelect={() => addTag(tag.name)}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <span>{tag.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {tag.bookmarkCount}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Toggle input mode button */}
        {!showInput && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowInput(true)}
            disabled={disabled || selectedTags.length >= maxTags}
            className="h-8 px-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Helper text */}
      {selectedTags.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedTags.length} of {maxTags} tags selected
        </p>
      )}
    </div>
  )
}