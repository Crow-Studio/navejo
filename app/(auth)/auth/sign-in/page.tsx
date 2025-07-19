import React from 'react'
import AuthLogin from '@/components/auth/loginForm'
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Navejo - Sign In",
  description: "Get started with Navejo bookmarking and sharing your favorite content.",
};

function page() {
  return (
    <div>
      <AuthLogin/>
    </div>
  )
}

export default page