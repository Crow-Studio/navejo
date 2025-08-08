"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateWorkspaceDrawer } from "./create-workspace-drawer";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    bookmarks: number;
    folders: number;
  };
}

interface WorkspaceSwitcherProps {
  currentWorkspaceId?: string;
}

export function WorkspaceSwitcher({ currentWorkspaceId }: WorkspaceSwitcherProps) {
  const { isMobile } = useSidebar();
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = React.useState<Workspace | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    fetchWorkspaces();
  }, []);

  React.useEffect(() => {
    if (currentWorkspaceId && workspaces.length > 0) {
      const workspace = workspaces.find(w => w.id === currentWorkspaceId);
      setActiveWorkspace(workspace || workspaces[0]);
    } else if (workspaces.length > 0) {
      setActiveWorkspace(workspaces[0]);
    }
  }, [currentWorkspaceId, workspaces]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("/api/workspaces");
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data.workspaces);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceCreated = () => {
    fetchWorkspaces();
  };

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    router.push(`/workspace/${workspace.id}`);
  };

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg animate-pulse">
              <Building2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
              <span className="truncate text-xs">Please wait</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!activeWorkspace) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <CreateWorkspaceDrawer onWorkspaceCreated={handleWorkspaceCreated}>
            <SidebarMenuButton size="lg">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Plus className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Create Organization</span>
                <span className="truncate text-xs">Get started</span>
              </div>
            </SidebarMenuButton>
          </CreateWorkspaceDrawer>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Building2 className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeWorkspace.organization.name}</span>
                <span className="truncate text-xs">{activeWorkspace.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Workspaces
            </DropdownMenuLabel>
            {workspaces.map((workspace, index) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceSelect(workspace)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <Building2 className="size-3.5 shrink-0" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{workspace.organization.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{workspace.name}</span>
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <CreateWorkspaceDrawer onWorkspaceCreated={handleWorkspaceCreated}>
              <DropdownMenuItem
                className="gap-2 p-2"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="text-muted-foreground font-medium">Add organization</div>
              </DropdownMenuItem>
            </CreateWorkspaceDrawer>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}