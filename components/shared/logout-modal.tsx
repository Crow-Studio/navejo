'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/api/(auth)/auth/action";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function LogoutModal({ isOpen, onClose, userName = "User" }: LogoutModalProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
      // The action will handle the redirect, so we don't need to do anything else
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
      // You might want to show an error toast here
    }
  };

  const handleCancel = () => {
    if (!isLoggingOut) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <LogOut className="w-5 h-5 text-red-400" />
            Confirm Logout
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Are you sure you want to logout, {userName}? You&apos;ll need to sign in again to access your bookmarks.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoggingOut}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoggingOut ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Logging out...
              </div>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}