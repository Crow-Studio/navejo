"use client"

import * as React from "react"
import { FolderSelector } from "@/components/folder-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function FolderSelectorDemo() {
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null)
  const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(undefined)

  const handleCreateFolder = async (name: string) => {
    console.log('Creating folder:', name, 'in workspace:', workspaceId)
    // Custom folder creation logic would go here
    // For demo purposes, we'll just log it
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Folder Selector Demo</CardTitle>
          <CardDescription>
            Test the folder selector component with different workspace contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace Context:</label>
            <div className="flex gap-2">
              <Button
                variant={workspaceId === undefined ? "default" : "outline"}
                size="sm"
                onClick={() => setWorkspaceId(undefined)}
              >
                Personal
              </Button>
              <Button
                variant={workspaceId === "demo-workspace" ? "default" : "outline"}
                size="sm"
                onClick={() => setWorkspaceId("demo-workspace")}
              >
                Demo Workspace
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Folder:</label>
            <FolderSelector
              workspaceId={workspaceId}
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
              onCreateFolder={handleCreateFolder}
              placeholder="Choose a folder..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Current Selection:</label>
            <div className="p-3 bg-muted rounded-md">
              {selectedFolderId ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Selected</Badge>
                  <span className="text-sm">Folder ID: {selectedFolderId}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No folder selected</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Context Info:</label>
            <div className="p-3 bg-muted rounded-md text-sm">
              <div>Mode: {workspaceId ? `Workspace (${workspaceId})` : 'Personal'}</div>
              <div>Will show: {workspaceId ? 'Workspace folders' : 'Personal folders'}</div>
              <div>Default folder: {workspaceId ? 'Workspace default' : 'Personal default'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}