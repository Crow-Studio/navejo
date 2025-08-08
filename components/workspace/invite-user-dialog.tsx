// components/workspace/invite-user-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceRole } from "@prisma/client";

interface InviteUserDialogProps {
  organizationId: string;
  workspaceId?: string;
  children?: React.ReactNode;
  onInviteSent?: () => void;
}

const roleLabels = {
  [WorkspaceRole.OWNER]: "Owner",
  [WorkspaceRole.ADMIN]: "Admin",
  [WorkspaceRole.MEMBER]: "Member",
  [WorkspaceRole.VIEWER]: "Viewer"
};

const roleDescriptions = {
  [WorkspaceRole.OWNER]: "Full access to everything",
  [WorkspaceRole.ADMIN]: "Can manage members and settings",
  [WorkspaceRole.MEMBER]: "Can create and edit bookmarks",
  [WorkspaceRole.VIEWER]: "Can only view bookmarks"
};

export function InviteUserDialog({ 
  organizationId, 
  workspaceId, 
  children, 
  onInviteSent 
}: InviteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    email: string;
    role: WorkspaceRole;
  }>({
    email: "",
    role: WorkspaceRole.MEMBER
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          organizationId,
          workspaceId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send invitation");
      }

      toast.success(`Invitation sent to ${formData.email}!`);
      setOpen(false);
      setFormData({ email: "", role: WorkspaceRole.MEMBER });
      onInviteSent?.();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Mail className="w-5 h-5 mr-2 text-blue-400" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Send an invitation to join {workspaceId ? "this workspace" : "your organization"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">
              Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: WorkspaceRole) => 
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {Object.entries(roleLabels).map(([role, label]) => (
                  <SelectItem 
                    key={role} 
                    value={role}
                    className="text-white hover:bg-gray-700 focus:bg-gray-700"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{label}</span>
                      <span className="text-xs text-gray-400">
                        {roleDescriptions[role as WorkspaceRole]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={loading || !formData.email}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}