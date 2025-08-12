// app/dashboard/page.tsx
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { cookies } from "next/headers"
import { validateSessionToken } from "@/lib/server/session"
import { Suspense } from "react"

// Force dynamic rendering to avoid prerender issues with search params
export const dynamic = 'force-dynamic'

interface User {
  id: string;
  email: string;
}

async function getUserData(): Promise<User | null> {
  try {
    // Get the session token from cookies
    const cookiesStore = await cookies()
    const sessionToken = cookiesStore.get("session")?.value
    
    if (!sessionToken) {
      return null
    }
    
    // Validate the session and get user data
    const { user } = await validateSessionToken(sessionToken)
    
    if (!user) {
      return null
    }
    
    return {
      id: user.id,
      email: user.email
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

// Loading component for the suspense boundary
function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  )
}

export default async function DashboardPage() {
  // Fetch user data on the server
  const user = await getUserData();

  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardLayout user={user} />
    </Suspense>
  )
}