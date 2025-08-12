"use client"

import * as React from "react"
import { Settings, User, Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface SettingsLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const settingsNavigation = [
  {
    id: "general",
    name: "General",
    href: "/settings/general",
    icon: Settings,
  },
  {
    id: "account",
    name: "Account",
    href: "/settings/account",
    icon: User,
  },
  {
    id: "import",
    name: "Import",
    href: "/settings/import",
    icon: Upload,
  },
];

export function SettingsLayout({ children, currentPage }: SettingsLayoutProps) {
  return (
    <div className="mt-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsNavigation.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-white text-black'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </a>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}