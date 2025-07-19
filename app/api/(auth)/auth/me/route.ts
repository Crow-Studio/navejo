import { NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/server/session'

export async function GET() {
  const { user } = await getCurrentSession()
  
  if (!user) {
    return NextResponse.json(null, { status: 401 })
  }
  
  // Extract first name from email
  let firstName = "User";
  if (user.email) {
    // Get the part before @ and capitalize first letter
    const emailName = user.email.split('@')[0];
    // Replace dots, underscores, etc. with spaces
    const cleanName = emailName.replace(/[._-]/g, ' ');
    // Split by spaces and capitalize each word
    const formattedName = cleanName
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    firstName = formattedName;
  }
  
  // Include profile information and role
  const userData = {
    id: user.id,
    email: user.email,
    firstName: firstName,
    emailVerified: user.emailVerified,
    role: user.role // Add the user's role to the response
  }
  
  return NextResponse.json(userData)
}