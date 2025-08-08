// components/workspace/create-workspace-dialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateWorkspaceDialogProps {
  children?: React.ReactNode;
}

export function CreateWorkspaceDialog({ children }: CreateWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    workspaceName: "",
    description: ""
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create workspace");
      }

      const { workspace } = await response.json();
      
      toast.success("Workspace created successfully!");
      setOpen(false);
      setFormData({ organizationName: "", workspaceName: "", description: "" });
      
      // Redirect to the new workspace
      router.push(`/workspace/${workspace.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Workspace
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Workspace</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new organization and workspace to start organizing your bookmarks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizationName" className="text-white">
              Organization Name
            </Label>
            <Input
              id="organizationName"
              placeholder="e.g., Acme Design Team"
              value={formData.organizationName}
              onChange={(e) => handleInputChange("organizationName", e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspaceName" className="text-white">
              Workspace Name
            </Label>
            <Input
              id="workspaceName"
              placeholder="e.g., Frontend Resources"
              value={formData.workspaceName}
              onChange={(e) => handleInputChange("workspaceName", e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this workspace is for..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 resize-none"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.organizationName || !formData.workspaceName}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}