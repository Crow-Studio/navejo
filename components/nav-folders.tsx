"use client"

import * as React from "react"
import { Folder, FolderOpen, type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface FolderData {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isDefault: boolean;
  _count: {
    bookmarks: number;
  };
}

interface NavFoldersProps {
  workspaceId?: string;
}

export function NavFolders({ workspaceId }: NavFoldersProps) {
  const [folders, setFolders] = React.useState<FolderData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFolders = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (workspaceId) {
          params.append('workspaceId', workspaceId);
        }

        const response = await fetch(`/api/folders/user?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setFolders(data.folders || []);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
  }, [workspaceId]);

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Collections</SidebarGroupLabel>
        <SidebarMenu>
          {[...Array(3)].map((_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuButton>
                <div className="w-4 h-4 bg-gray-600 rounded animate-pulse" />
                <div className="h-4 bg-gray-600 rounded flex-1 animate-pulse" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  if (folders.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Collections</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/collections/new">
                <Folder className="w-4 h-4" />
                <span className="text-gray-500">Create your first collection</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Collections</SidebarGroupLabel>
      <SidebarMenu>
        {folders.map((folder) => (
          <SidebarMenuItem key={folder.id}>
            <SidebarMenuButton asChild>
              <a href={`/collections/${folder.id}`}>
                <Folder className="w-4 h-4" style={{ color: folder.color || undefined }} />
                <span>{folder.name}</span>
                {folder._count.bookmarks > 0 && (
                  <span className="ml-auto text-xs text-gray-500">
                    {folder._count.bookmarks}
                  </span>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}