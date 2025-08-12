"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string;
  email: string;
}

interface GeneralSettingsProps {
  user: User;
}

export function GeneralSettings({ user }: GeneralSettingsProps) {
  const [settings, setSettings] = React.useState({
    theme: "dark",
    notifications: true,
    autoSave: true,
    defaultPrivacy: true,
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Appearance</CardTitle>
          <CardDescription className="text-gray-400">
            Customize how Navejo looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme" className="text-white">Theme</Label>
            <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="dark" className="text-white">Dark</SelectItem>
                <SelectItem value="light" className="text-white">Light</SelectItem>
                <SelectItem value="system" className="text-white">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Preferences</CardTitle>
          <CardDescription className="text-gray-400">
            Configure your default settings and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-white">Notifications</Label>
              <p className="text-sm text-gray-400">Receive notifications about bookmark activity</p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoSave" className="text-white">Auto-save bookmarks</Label>
              <p className="text-sm text-gray-400">Automatically save bookmark metadata when creating</p>
            </div>
            <Switch
              id="autoSave"
              checked={settings.autoSave}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="defaultPrivacy" className="text-white">Default to private</Label>
              <p className="text-sm text-gray-400">Make new bookmarks private by default</p>
            </div>
            <Switch
              id="defaultPrivacy"
              checked={settings.defaultPrivacy}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, defaultPrivacy: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Keyboard Shortcuts</CardTitle>
          <CardDescription className="text-gray-400">
            Learn and customize keyboard shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white">Create new bookmark</span>
              <kbd className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-300">⌘B</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Create from clipboard</span>
              <kbd className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-300">⌘⇧B</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white">Search bookmarks</span>
              <kbd className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-300">⌘K</kbd>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="bg-white text-black hover:bg-gray-100">
          Save Changes
        </Button>
      </div>
    </div>
  );
}