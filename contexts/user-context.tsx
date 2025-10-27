"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  username?: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  refreshUser: () => Promise<void>
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ 
  children, 
  initialUser 
}: { 
  children: ReactNode
  initialUser?: User | null 
}) {
  const [user, setUser] = useState<User | null>(initialUser || null)
  const [isLoading, setIsLoading] = useState(false)

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  const refreshUser = async () => {
    if (!user?.id) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh user data when the component mounts
  useEffect(() => {
    if (user?.id && !initialUser) {
      refreshUser()
    }
  }, [])

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      updateUser,
      refreshUser,
      isLoading
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    // Return a default context instead of throwing an error
    return {
      user: null,
      setUser: () => {},
      updateUser: () => {},
      refreshUser: async () => {},
      isLoading: false
    }
  }
  return context
}