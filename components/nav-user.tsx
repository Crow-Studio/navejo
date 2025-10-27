"use client"

import * as React from "react";
import {
  // Bell,
  ChevronsUpDown,
  // CreditCard,
  LogOut,
  // Sparkles,
  // Settings,
  User,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { LogoutModal } from "@/components/shared/logout-modal"
import { useUser } from "@/contexts/user-context"

export function NavUser({
  user: initialUser,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { user: contextUser } = useUser()

  // Use context user if available and has data, fallback to initial user
  const user = (contextUser && contextUser.name && contextUser.email) ? {
    name: contextUser.name,
    email: contextUser.email,
    avatar: contextUser.avatar || initialUser.avatar
  } : initialUser
  const { isMobile } = useSidebar()
  const [showLogoutModal, setShowLogoutModal] = React.useState(false)

  // Generate user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-zinc-900 border-zinc-800"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-white">{user.name}</span>
                    <span className="truncate text-xs text-zinc-400">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              {/* <DropdownMenuGroup>
                <DropdownMenuItem className="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer">
                  <Sparkles className="text-yellow-500" />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup> */}
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer">
                  <a href="/profile">
                    <User className="text-blue-400" />
                    Profile
                  </a>
                </DropdownMenuItem>
                {/* <DropdownMenuItem asChild className="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer">
                  <a href="/settings">
                    <Settings className="text-gray-400" />
                    Settings
                  </a>
                </DropdownMenuItem> */}
                {/* <DropdownMenuItem className="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer">
                  <CreditCard className="text-green-400" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem className="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 cursor-pointer">
                  <Bell className="text-orange-400" />
                  Notifications
                </DropdownMenuItem> */}
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer"
                onClick={handleLogoutClick}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        userName={user.name}
      />
    </>
  )
}