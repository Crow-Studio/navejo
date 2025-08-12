import { cookies } from "next/headers";
import { validateSessionToken } from "@/lib/server/session";
import { redirect } from "next/navigation";
import { BookmarkManager } from "@/components/bookmark-manager";

async function getUserData() {
  try {
    const cookiesStore = await cookies();
    const sessionToken = cookiesStore.get("session")?.value;
    
    if (!sessionToken) {
      return null;
    }
    
    const { user } = await validateSessionToken(sessionToken);
    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export default async function RecentBookmarksPage() {
  const user = await getUserData();
  
  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Recent Bookmarks</h1>
        <p className="text-gray-400">Your recently saved bookmarks</p>
      </div>
      
      <BookmarkManager 
        userId={user.id}
        filter="recent"
        showFilters={false}
        showSearch={true}
      />
    </div>
  );
}