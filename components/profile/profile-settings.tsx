"use client"

import { useState } from "react"
import { toast } from "sonner"
import { User, Eye, EyeOff, Save, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/contexts/user-context"

interface ProfileSettingsProps {
  user: {
    id: string
    email: string
    profile?: {
      name?: string | null
      bio?: string | null
      isPublic?: boolean
      imageUrl?: string | null
    } | null
  }
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const { updateUser, refreshUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user.profile?.name || "",
    bio: user.profile?.bio || "",
    isPublic: user.profile?.isPublic || false,
  })

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      // Update the user context with new data
      updateUser({
        name: formData.displayName,
      })

      // Refresh user data from server to get latest state
      await refreshUser()

      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = formData.displayName || user.email.split('@')[0]

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-gray-400">
            Update your profile information and control your visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profile?.imageUrl || ""} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium text-white">{displayName}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-white">Display Name</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Enter your display name"
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400">
              This is how your name will appear to other users
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-white">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell others about yourself..."
              className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-400">
              {formData.bio.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings Card */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {formData.isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            Privacy Settings
          </CardTitle>
          <CardDescription className="text-gray-400">
            Control who can see your profile and bookmarks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Public Profile</Label>
              <p className="text-sm text-gray-400">
                Make your profile visible in the community directory
              </p>
            </div>
            <Switch
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
            />
          </div>

          {formData.isPublic && (
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-300 font-medium">Your profile is public</p>
                  <p className="text-blue-200/80 mt-1">
                    Other users can discover your profile and see your public bookmarks in the Communities section.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!formData.isPublic && (
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-gray-300 font-medium">Your profile is private</p>
                  <p className="text-gray-400 mt-1">
                    Only you can see your profile and bookmarks. Enable public profile to appear in Communities.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}