// components/workspace/invite-user-drawer.tsx
"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { UserPlus, Loader2, Mail, Users } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceRole } from "@prisma/client";

interface InviteUserDrawerProps {
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

export function InviteUserDrawer({
  organizationId,
  workspaceId,
  children,
  onInviteSent
}: InviteUserDrawerProps) {
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" className="border-gray-700 text-gray-200 hover:bg-gray-800 bg-gray-900">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
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
              <Users className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#ffffff' }} />
            </div>
            <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
              <SheetTitle className="text-xl sm:text-2xl font-bold leading-tight" style={{ color: '#ffffff' }}>
                Invite Team Member
              </SheetTitle>
              <SheetDescription className="text-sm sm:text-base leading-relaxed" style={{ color: '#f2f2f2' }}>
                Send an invitation to join {workspaceId ? "this workspace" : "your organization"} and start collaborating.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6">
            <div className="space-y-6 sm:space-y-8 py-4 sm:py-6">
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="email" className="text-sm sm:text-base font-semibold block" style={{ color: '#ffffff' }}>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="border-[#080808] focus:border-[#020202] h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 w-full"
                  style={{ backgroundColor: '#080808', color: '#ffffff' }}
                  required
                />
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#fdfdfd' }}>
                  They will receive an email invitation with instructions to join
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="role" className="text-sm sm:text-base font-semibold block" style={{ color: '#ffffff' }}>
                  Role & Permissions
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: WorkspaceRole) =>
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger
                    className="border-[#080808] h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 w-full"
                    style={{ backgroundColor: '#080808', color: '#ffffff' }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#080808] w-full" style={{ backgroundColor: '#080808' }}>
                    {Object.entries(roleLabels).map(([role, label]) => (
                      <SelectItem
                        key={role}
                        value={role}
                        className="hover:bg-[#020202] focus:bg-[#020202] p-3 sm:p-4"
                        style={{ color: '#ffffff' }}
                      >
                        <div className="flex flex-col space-y-1 w-full">
                          <span className="font-semibold text-sm sm:text-base">{label}</span>
                          <span className="text-xs sm:text-sm leading-relaxed" style={{ color: '#f2f2f2' }}>
                            {roleDescriptions[role as WorkspaceRole]}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#fdfdfd' }}>
                  Choose the appropriate access level for this team member
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
              disabled={loading || !formData.email}
              className="hover:bg-[#f2f2f2] disabled:bg-[#080808] h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold w-full sm:w-auto order-1 sm:order-2"
              style={{
                backgroundColor: loading || !formData.email ? '#080808' : '#ffffff',
                color: loading || !formData.email ? '#f2f2f2' : '#000000'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Sending Invitation...</span>
                  <span className="sm:hidden">Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Send Invitation</span>
                  <span className="sm:hidden">Send</span>
                </>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}