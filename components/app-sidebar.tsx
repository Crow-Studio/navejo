"use client"

import * as React from "react"
import {
  Bookmark,
  BookOpen,
  Folder,
  Home,
  Settings2,
  Share2,
  Users,

} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface User {
  id: string;
  email: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: User | null;
  workspaceId?: string;
}

// Updated navigation data for Navejo
const getNavigationData = (user?: User | null) => ({
  user: user ? {
    name: extractNameFromEmail(user.email),
    email: user.email,
    avatar: generateAvatarUrl(user.email), // Generate avatar based on email
  } : {
    name: "Guest",
    email: "guest@navejo.com",
    avatar: "/avatars/default.jpg",
  },
  teams: [
    {
      name: "Navejo",
      logo: Bookmark,
      plan: "Navigator",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Bookmarks",
      url: "/bookmarks",
      icon: Bookmark,
      items: [
        {
          title: "All Bookmarks",
          url: "/bookmarks",
        },
        {
          title: "Recent",
          url: "/bookmarks/recent",
        },
        {
          title: "Favorites",
          url: "/bookmarks/favorites",
        },
        {
          title: "Shared",
          url: "/bookmarks/shared",
        },
      ],
    },
    {
      title: "Collections",
      url: "/collections",
      icon: Folder,
      items: [
        {
          title: "All Collections",
          url: "/collections",
        },
        {
          title: "Create New",
          url: "/collections/new",
        },
        {
          title: "Shared with Me",
          url: "/collections/shared",
        },
      ],
    },
    {
      title: "Workspaces",
      url: "/workspaces",
      icon: Users,
      items: [
        {
          title: "All Workspaces",
          url: "/workspaces",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/settings/general",
        },
        {
          title: "Account",
          url: "/settings/account",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
        {
          title: "Import",
          url: "/settings/import",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Frontend Resources",
      url: "/collections/frontend",
      icon: BookOpen,
    },
    {
      name: "Design Inspiration",
      url: "/collections/design",
      icon: Share2,
    },
    {
      name: "Development Tools",
      url: "/collections/tools",
      icon: Settings2,
    },
  ],
});

// Helper function to extract name from email
function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  const cleanName = localPart
    .replace(/[0-9._-]/g, ' ')
    .split(' ')
    .filter(part => part.length > 0)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

  return cleanName || localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

// Helper function to generate avatar URL (you can replace with your avatar service)
function generateAvatarUrl(email: string): string {
  // Using Gravatar as an example - replace with your preferred avatar service
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(extractNameFromEmail(email))}&background=6366f1&color=fff&size=128`;
}

export function AppSidebar({ user, workspaceId, ...props }: AppSidebarProps) {
  const data = getNavigationData(user);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher currentWorkspaceId={workspaceId} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} workspaceId={workspaceId} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}