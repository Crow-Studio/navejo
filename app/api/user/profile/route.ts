// app/api/user/profile/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { validateSessionToken } from "@/lib/server/session"

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
    
    // Return user data without profile
    return NextResponse.json({
      id: user.id,
      email: user.email
      // profile property removed as it doesn't exist on the user type
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    )
  }
}