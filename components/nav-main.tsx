"use client"

import { ChevronRight, Plus, type LucideIcon } from "lucide-react"
import { useBookmarkCreation } from "@/components/bookmark-creation-provider"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function NavMain({
  items,
  workspaceId,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  workspaceId?: string
}) {
  const { openBookmarkDialog } = useBookmarkCreation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      
      {/* Quick Bookmark Creation Button */}
      <div className="px-2 pb-2 space-y-2">
        <Button
          onClick={() => openBookmarkDialog(undefined, workspaceId)}
          className="w-full justify-start gap-2 h-8 text-xs font-medium"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Bookmark
          <span className="ml-auto text-xs opacity-60">⌘B</span>
        </Button>
        
        {/* Keyboard Shortcuts Help */}
        <div className="px-1">
          <KeyboardShortcutsHelp />
        </div>
      </div>
      
      <SidebarMenu>
        {items.map((item) => (
          item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url} className={item.isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
