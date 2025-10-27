// lib/server/folder.ts
import { prisma } from "@/lib/server/db";
import { v4 as uuidv4 } from "uuid";
import { WorkspaceRole } from "@prisma/client";

export interface CreateFolderData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  workspaceId?: string;
  isDefault?: boolean;
}

export interface FolderWithCounts {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  parentId: string | null;
  userId: string | null;
  workspaceId: string | null;
  isDefault: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    bookmarks: number;
    children: number;
  };
}

/**
 * Get folders for a specific workspace with bookmark counts
 */
export async function getWorkspaceFolders(
  userId: string,
  workspaceId: string
): Promise<FolderWithCounts[]> {
  // First validate user has access to the workspace
  await validateWorkspaceAccess(userId, workspaceId);

  const folders = await prisma.folder.findMany({
    where: {
      workspaceId,
      parentId: null // Only get top-level folders for now
    },
    include: {
      _count: {
        select: {
          bookmarks: true,
          children: true
        }
      }
    },
    orderBy: [
      { isDefault: 'desc' }, // Default folders first
      { sortOrder: 'asc' },
      { name: 'asc' }
    ]
  });

  return folders;
}

/**
 * Get personal folders for a user with bookmark counts
 */
export async function getPersonalFolders(userId: string): Promise<FolderWithCounts[]> {
  const folders = await prisma.folder.findMany({
    where: {
      userId,
      workspaceId: null,
      parentId: null // Only get top-level folders for now
    },
    include: {
      _count: {
        select: {
          bookmarks: true,
          children: true
        }
      }
    },
    orderBy: [
      { isDefault: 'desc' }, // Default folders first
      { sortOrder: 'asc' },
      { name: 'asc' }
    ]
  });

  return folders;
}

/**
 * Create a new folder
 */
export async function createFolder(
  userId: string,
  data: CreateFolderData
): Promise<FolderWithCounts> {
  // Validate permissions if creating in workspace
  if (data.workspaceId) {
    await validateWorkspaceAccess(userId, data.workspaceId);
  }

  // Validate parent folder if specified
  if (data.parentId) {
    await validateFolderAccess(userId, data.parentId, data.workspaceId);
  }

  // Check for duplicate folder names in the same context
  const existingFolder = await prisma.folder.findFirst({
    where: {
      name: data.name,
      userId: data.workspaceId ? null : userId,
      workspaceId: data.workspaceId || null,
      parentId: data.parentId || null
    }
  });

  if (existingFolder) {
    throw new Error("A folder with this name already exists in this location");
  }

  const folder = await prisma.folder.create({
    data: {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      parentId: data.parentId,
      userId: data.workspaceId ? null : userId,
      workspaceId: data.workspaceId,
      isDefault: data.isDefault || false,
      sortOrder: 0
    },
    include: {
      _count: {
        select: {
          bookmarks: true,
          children: true
        }
      }
    }
  });

  return folder;
}

/**
 * Get or create default folder for user/workspace
 */
export async function getOrCreateDefaultFolder(
  userId: string,
  workspaceId?: string
): Promise<FolderWithCounts> {
  // Look for existing default folder
  const existingDefault = await prisma.folder.findFirst({
    where: {
      userId: workspaceId ? null : userId,
      workspaceId: workspaceId || null,
      isDefault: true
    },
    include: {
      _count: {
        select: {
          bookmarks: true,
          children: true
        }
      }
    }
  });

  if (existingDefault) {
    return existingDefault;
  }

  // Create default folder if it doesn't exist
  const defaultFolder = await createFolder(userId, {
    name: "Unsorted",
    description: "Default folder for unsorted bookmarks",
    workspaceId,
    isDefault: true
  });

  return defaultFolder;
}

/**
 * Get or create "Imported" folder for user/workspace
 */
export async function getOrCreateImportedFolder(
  userId: string,
  workspaceId?: string
): Promise<FolderWithCounts> {
  // Look for existing "Imported" folder
  const existingImported = await prisma.folder.findFirst({
    where: {
      name: "Imported",
      userId: workspaceId ? null : userId,
      workspaceId: workspaceId || null
    },
    include: {
      _count: {
        select: {
          bookmarks: true,
          children: true
        }
      }
    }
  });

  if (existingImported) {
    return existingImported;
  }

  // Create "Imported" folder if it doesn't exist
  const importedFolder = await createFolder(userId, {
    name: "Imported",
    description: "Bookmarks imported from community and other sources",
    color: "#10B981", // Green color to distinguish imported bookmarks
    icon: "📥", // Import icon
    workspaceId,
    isDefault: false
  });

  return importedFolder;
}

/**
 * Validate user has access to a specific folder
 */
export async function validateFolderAccess(
  userId: string,
  folderId: string,
  workspaceId?: string
): Promise<void> {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId }
  });

  if (!folder) {
    throw new Error("Folder not found");
  }

  // Check if folder belongs to user's personal space
  if (folder.userId === userId && !workspaceId) {
    return;
  }

  // Check if folder belongs to the specified workspace
  if (folder.workspaceId === workspaceId && workspaceId) {
    // Verify user has access to the workspace
    await validateWorkspaceAccess(userId, workspaceId);
    return;
  }

  throw new Error("Unauthorized: You don't have access to this folder");
}

/**
 * Validate user has access to a workspace
 */
async function validateWorkspaceAccess(userId: string, workspaceId: string): Promise<void> {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId,
      workspaceId
    }
  });

  if (!membership) {
    throw new Error("Unauthorized: You don't have access to this workspace");
  }
}

/**
 * Get folder by ID with permission validation
 */
export async function getFolderById(
  userId: string,
  folderId: string,
  workspaceId?: string
): Promise<FolderWithCounts> {
  await validateFolderAccess(userId, folderId, workspaceId);

  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      _count: {
        select: {
          bookmarks: true,
          children: true
        }
      }
    }
  });

  if (!folder) {
    throw new Error("Folder not found");
  }

  return folder;
}

/**
 * Get all folders accessible to user (personal + workspace folders)
 */
export async function getAllUserFolders(userId: string): Promise<{
  personal: FolderWithCounts[];
  workspaces: { [workspaceId: string]: FolderWithCounts[] };
}> {
  // Get personal folders
  const personalFolders = await getPersonalFolders(userId);

  // Get user's workspaces
  const workspaceMemberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: true
    }
  });

  // Get folders for each workspace
  const workspaceFolders: { [workspaceId: string]: FolderWithCounts[] } = {};
  
  for (const membership of workspaceMemberships) {
    const folders = await getWorkspaceFolders(userId, membership.workspaceId);
    workspaceFolders[membership.workspaceId] = folders;
  }

  return {
    personal: personalFolders,
    workspaces: workspaceFolders
  };
}

/**
 * Update folder details
 */
export async function updateFolder(
  userId: string,
  folderId: string,
  data: Partial<CreateFolderData>,
  workspaceId?: string
): Promise<FolderWithCounts> {
  // Validate access to the folder
  await validateFolderAccess(userId, folderId, workspaceId);

  // If changing parent, validate access to new parent
  if (data.parentId) {
    await validateFolderAccess(userId, data.parentId, workspaceId);
  }

  // Check for duplicate names if name is being changed
  if (data.name) {
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: data.name,
        userId: workspaceId ? null : userId,
        workspaceId: workspaceId || null,
        parentId: data.parentId || null,
        NOT: { id: folderId } // Exclude current folder
      }
    });

    if (existingFolder) {
      throw new Error("A folder with this name already exists in this location");
    }
  }

  const updatedFolder = await prisma.folder.update({
    where: { id: folderId },
    data: {
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      parentId: data.parentId
    },
    include: {
      _count: {
        select: {
          bookmarks: true,
          children: true
        }
      }
    }
  });

  return updatedFolder;
}

/**
 * Delete folder (only if empty)
 */
export async function deleteFolder(
  userId: string,
  folderId: string,
  workspaceId?: string
): Promise<void> {
  // Validate access to the folder
  await validateFolderAccess(userId, folderId, workspaceId);

  // Check if folder is empty
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: {
      _count: {
        select: {
          bookmarks: true,
          children: true
        }
      }
    }
  });

  if (!folder) {
    throw new Error("Folder not found");
  }

  if (folder.isDefault) {
    throw new Error("Cannot delete default folder");
  }

  if (folder._count.bookmarks > 0 || folder._count.children > 0) {
    throw new Error("Cannot delete folder that contains bookmarks or subfolders");
  }

  await prisma.folder.delete({
    where: { id: folderId }
  });
}