import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TokenExpiredPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <h1 className="mb-4 text-2xl font-bold">Link Expired</h1>
      <p className="mb-8 text-muted-foreground">
        This login link has expired. Please request a new one.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}