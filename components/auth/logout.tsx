"use client";

import { logoutAction } from "@/app/api/(auth)/auth/action";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <form action={handleLogout}>
      <Button>Sign out</Button>
    </form>
  );
}