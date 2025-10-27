"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, User } from "lucide-react"

interface User {
    id: string;
    email: string;
}

interface AccountSettingsProps {
    user: User;
}

export function AccountSettings({ user }: AccountSettingsProps) {
    return (
        <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <User className="w-5 h-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Update your account details and profile information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="bg-gray-700 border-gray-600 text-gray-400"
                        />
                        <p className="text-xs text-gray-500">Email address cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Display Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter your display name"
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-white">Bio</Label>
                        <Input
                            id="bio"
                            placeholder="Tell us about yourself"
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            Update Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-white">Change Password</CardTitle>
                    <CardDescription className="text-gray-400">
                        Update your password to keep your account secure
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            className="bg-gray-700 border-gray-600 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-white">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            className="bg-gray-700 border-gray-600 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            className="bg-gray-700 border-gray-600 text-white"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            Change Password
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-red-900/20 border-red-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-300">
                        Irreversible and destructive actions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator className="bg-red-800" />

                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-medium">Delete Account</h4>
                            <p className="text-sm text-gray-400">
                                Permanently delete your account and all associated data
                            </p>
                        </div>
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}