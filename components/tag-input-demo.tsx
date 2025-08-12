"use client"

import * as React from "react"
import { TagInput } from "@/components/tag-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function TagInputDemo() {
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [workspaceId, setWorkspaceId] = React.useState<string | undefined>(undefined)

  const handleReset = () => {
    setSelectedTags([])
  }

  const handlePresetTags = () => {
    setSelectedTags(["javascript", "react", "typescript"])
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tag Input Component Demo</CardTitle>
          <CardDescription>
            Test the tag input component with autocomplete functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" size="sm">
              Reset Tags
            </Button>
            <Button onClick={handlePresetTags} variant="outline" size="sm">
              Add Preset Tags
            </Button>
            <Button 
              onClick={() => setWorkspaceId(workspaceId ? undefined : "demo-workspace")} 
              variant="outline" 
              size="sm"
            >
              {workspaceId ? "Personal Mode" : "Workspace Mode"}
            </Button>
          </div>

          {/* Current State */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current State:</h4>
            <div className="text-sm text-muted-foreground">
              <p>Workspace ID: {workspaceId || "None (Personal)"}</p>
              <p>Selected Tags: {selectedTags.length}</p>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tag Input Component */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Tag Input:</h4>
            <TagInput
              workspaceId={workspaceId}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              placeholder="Add tags to test autocomplete..."
              maxTags={10}
            />
          </div>

          {/* JSON Output */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">JSON Output:</h4>
            <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
              {JSON.stringify({ selectedTags, workspaceId }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}