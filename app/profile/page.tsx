import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/server/session"
import { AppLayout } from "@/components/layouts/app-layout"
import { ProfileSettings } from "@/components/profile/profile-settings"
import { Suspense } from "react"
import { prisma } from "@/lib/server/db"

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic'

interface User {
  id: string;
  email: string;
  profile?: {
    name?: string | null;
    bio?: string | null;
    isPublic?: boolean;
    imageUrl?: string | null;
  } | null;
}

async function getUserData(): Promise<User | null> {
  try {
    const { user } = await getCurrentSession()
    
    if (!user) {
      return null
    }
    
    // Get user with profile data
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true }
    })
    
    if (!userWithProfile) {
      return null
    }
    
    return {
      id: userWithProfile.id,
      email: userWithProfile.email,
      profile: userWithProfile.profile
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    return null
  }
}

// Loading component for the suspense boundary
function ProfileLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  )
}

export default async function ProfilePage() {
  const user = await getUserData()
  
  if (!user) {
    redirect("/auth/signin")
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile" }
  ]

  return (
    <Suspense fallback={<ProfileLoading />}>
      <AppLayout user={user} breadcrumbs={breadcrumbs}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
              <p className="text-gray-400">Manage your profile information and privacy settings</p>
            </div>
            
            <ProfileSettings user={user} />
          </div>
        </div>
      </AppLayout>
    </Suspense>
  )
}