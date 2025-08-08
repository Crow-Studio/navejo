// components/workspace/create-workspace-drawer.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

interface CreateWorkspaceDrawerProps {
  children?: React.ReactNode;
  onWorkspaceCreated?: () => void;
}

export function CreateWorkspaceDrawer({ children, onWorkspaceCreated }: CreateWorkspaceDrawerProps) {
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
      
      toast.success("Organization created successfully!");
      setOpen(false);
      setFormData({ organizationName: "", workspaceName: "", description: "" });
      
      // Call the callback to refresh the workspace list
      onWorkspaceCreated?.();
      
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button className="bg-gray-800 hover:bg-gray-700 text-white border-gray-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        )}
      </SheetTrigger>
      <SheetContent 
        className="w-full sm:max-w-[480px] md:max-w-[540px] lg:max-w-[600px] border-[#080808] flex flex-col h-full overflow-hidden" 
        style={{ backgroundColor: '#000000', color: '#ffffff' }}
      >
        <SheetHeader className="flex-shrink-0 space-y-4 sm:space-y-6 p-4 sm:p-6 pb-4 sm:pb-6 border-b" style={{ borderColor: '#080808' }}>
          <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0" style={{ backgroundColor: '#080808' }}>
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#ffffff' }} />
            </div>
            <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
              <SheetTitle className="text-xl sm:text-2xl font-bold leading-tight" style={{ color: '#ffffff' }}>
                Create New Organization
              </SheetTitle>
              <SheetDescription className="text-sm sm:text-base leading-relaxed" style={{ color: '#f2f2f2' }}>
                Set up a new organization and workspace to start organizing your bookmarks with your team.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6">
            <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="organizationName" className="text-sm sm:text-base font-semibold block" style={{ color: '#ffffff' }}>
                  Organization Name
                </Label>
                <Input
                  id="organizationName"
                  placeholder="e.g., Acme Design Team"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange("organizationName", e.target.value)}
                  className="border-[#080808] focus:border-[#020202] h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 w-full"
                  style={{ backgroundColor: '#080808', color: '#ffffff' }}
                  required
                />
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#fdfdfd' }}>
                  This will be the main organization name that appears across your workspace
                </p>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="workspaceName" className="text-sm sm:text-base font-semibold block" style={{ color: '#ffffff' }}>
                  Workspace Name
                </Label>
                <Input
                  id="workspaceName"
                  placeholder="e.g., Frontend Resources"
                  value={formData.workspaceName}
                  onChange={(e) => handleInputChange("workspaceName", e.target.value)}
                  className="border-[#080808] focus:border-[#020202] h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 w-full"
                  style={{ backgroundColor: '#080808', color: '#ffffff' }}
                  required
                />
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#fdfdfd' }}>
                  Your first workspace within this organization for organizing bookmarks
                </p>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="description" className="text-sm sm:text-base font-semibold block" style={{ color: '#ffffff' }}>
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this organization is for..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="border-[#080808] resize-none focus:border-[#020202] text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 w-full min-h-[80px] sm:min-h-[100px]"
                  style={{ backgroundColor: '#080808', color: '#ffffff' }}
                  rows={3}
                />
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#fdfdfd' }}>
                  Help your team understand the purpose of this organization
                </p>
              </div>
            </div>
          </div>
          
          <SheetFooter className="flex-shrink-0 flex flex-col gap-3 sm:flex-row sm:gap-4 p-4 sm:p-6 pt-4 sm:pt-6 border-t" style={{ borderColor: '#080808' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#080808] hover:bg-[#020202] bg-transparent h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium w-full sm:w-auto order-2 sm:order-1"
              style={{ color: '#f2f2f2' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.organizationName || !formData.workspaceName}
              className="hover:bg-[#f2f2f2] disabled:bg-[#080808] h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold w-full sm:w-auto order-1 sm:order-2"
              style={{ 
                backgroundColor: loading || !formData.organizationName || !formData.workspaceName ? '#080808' : '#ffffff',
                color: loading || !formData.organizationName || !formData.workspaceName ? '#f2f2f2' : '#000000'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Creating Organization...</span>
                  <span className="sm:hidden">Creating...</span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Create Organization</span>
                  <span className="sm:hidden">Create</span>
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}