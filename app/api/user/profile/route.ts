import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSessionToken } from "@/lib/server/session"
import { prisma } from "@/lib/server/db"

export async function GET() {
  try {
    // Get the session token from cookies
    const cookiesStore = await cookies()
    const sessionToken = cookiesStore.get("session")?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Validate the session and get user data
    const { user } = await validateSessionToken(sessionToken)
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized or session expired" },
        { status: 401 }
      )
    }
    
    // Get user with profile data
    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true }
    })
    
    return NextResponse.json({
      id: userWithProfile?.id,
      email: userWithProfile?.email,
      profile: userWithProfile?.profile
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  let user: any = null
  let body: any = null
  
  try {
    // Get the session token from cookies
    const cookiesStore = await cookies()
    const sessionToken = cookiesStore.get("session")?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Validate the session and get user data
    const sessionResult = await validateSessionToken(sessionToken)
    user = sessionResult.user
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized or session expired" },
        { status: 401 }
      )
    }

    body = await request.json()
    const { displayName, bio, isPublic } = body

    console.log('Profile update request:', { userId: user.id, body })

    // Use displayName as name, fallback to email username if empty
    const name = displayName?.trim() || user.email.split('@')[0]

    console.log('Processed name:', name)

    // Update or create profile - make profiles public by default
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        name: name,
        bio: bio || null,
        isPublic: isPublic !== undefined ? Boolean(isPublic) : true, // Default to public
      },
      create: {
        userId: user.id,
        name: name,
        bio: bio || null,
        isPublic: isPublic !== undefined ? Boolean(isPublic) : true, // Default to public
      }
    })

    return NextResponse.json({
      success: true,
      profile
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: user?.id,
      requestBody: body
    })
    return NextResponse.json(
      { 
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}