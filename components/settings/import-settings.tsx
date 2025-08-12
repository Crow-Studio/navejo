"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Globe, Download } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string;
  email: string;
}

interface ImportSettingsProps {
  user: User;
}

export function ImportSettings({ user }: ImportSettingsProps) {
  const [isImporting, setIsImporting] = React.useState(false);
  const [importProgress, setImportProgress] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportProgress(0);

      // Simulate import progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/bookmarks/import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setImportProgress(100);

      if (!response.ok) {
        throw new Error('Import failed');
      }

      const result = await response.json();

      setTimeout(() => {
        toast.success(`Successfully imported ${result.count} bookmarks!`);
        setIsImporting(false);
        setImportProgress(0);
      }, 500);

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import bookmarks');
      setIsImporting(false);
      setImportProgress(0);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Upload className="w-5 h-5" />
            Import Bookmarks
          </CardTitle>
          <CardDescription className="text-gray-400">
            Import your bookmarks from various sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="bookmark-file" className="text-white">Upload Bookmark File</Label>
              <p className="text-sm text-gray-400 mt-1">
                Supports HTML, JSON, and CSV formats
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                id="bookmark-file"
                type="file"
                accept=".html,.json,.csv"
                onChange={handleFileImport}
                disabled={isImporting}
                className="bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="bg-white text-black hover:bg-gray-100"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white">Importing bookmarks...</span>
                  <span className="text-gray-400">{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Browser Import</CardTitle>
          <CardDescription className="text-gray-400">
            Export bookmarks from your browser and import them here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-4 border border-gray-600 rounded-lg">
              <Globe className="w-8 h-8 text-white mb-2" />
              <h4 className="font-medium text-white mb-2">Chrome</h4>
              <p className="text-xs text-gray-400 text-center mb-3">
                Bookmarks → Bookmark Manager → Export
              </p>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Guide
              </Button>
            </div>

            <div className="flex flex-col items-center p-4 border border-gray-600 rounded-lg">
              <Globe className="w-8 h-8 text-white mb-2" />
              <h4 className="font-medium text-white mb-2">Firefox</h4>
              <p className="text-xs text-gray-400 text-center mb-3">
                Library → Export Bookmarks to HTML
              </p>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Guide
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Import History</CardTitle>
          <CardDescription className="text-gray-400">
            View your recent import activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-white">Chrome Bookmarks</p>
                  <p className="text-xs text-gray-400">Imported 247 bookmarks</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">2 days ago</span>
            </div>

            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No import history yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}