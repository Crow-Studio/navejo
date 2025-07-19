
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-4 text-2xl font-bold">Authentication Error</h1>
      <p className="mb-8 text-muted-foreground">
        There was a problem signing you in. Please try again.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
