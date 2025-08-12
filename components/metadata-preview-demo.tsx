"use client"

import * as React from "react"
import { MetadataPreview, type ExtractedMetadata } from "./metadata-preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const sampleMetadata: ExtractedMetadata = {
    title: "Building Modern Web Applications with Next.js",
    description: "Learn how to create fast, scalable web applications using Next.js, React, and TypeScript. This comprehensive guide covers everything from setup to deployment.",
    favicon: "https://nextjs.org/favicon.ico",
    imageUrl: "https://nextjs.org/static/blog/next-13/twitter-card.png",
    siteName: "Next.js Blog",
    author: "Vercel Team",
    publishedAt: new Date("2024-01-15"),
}

export function MetadataPreviewDemo() {
    const [metadata, setMetadata] = React.useState<ExtractedMetadata | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [demoUrl, setDemoUrl] = React.useState("https://nextjs.org/blog/next-13")

    const handleLoadSuccess = () => {
        setIsLoading(true)
        setError(null)

        // Simulate loading delay
        setTimeout(() => {
            setMetadata(sampleMetadata)
            setIsLoading(false)
        }, 1500)
    }

    const handleLoadError = () => {
        setIsLoading(true)
        setError(null)

        // Simulate loading delay then error
        setTimeout(() => {
            setError("Failed to extract metadata from URL")
            setIsLoading(false)
            setMetadata(null)
        }, 1000)
    }

    const handleRetry = () => {
        setError(null)
        setMetadata(null)
        handleLoadSuccess()
    }

    const handleMetadataChange = (updatedMetadata: Partial<ExtractedMetadata>) => {
        if (metadata) {
            setMetadata({ ...metadata, ...updatedMetadata })
        }
    }

    const handleReset = () => {
        setMetadata(null)
        setError(null)
        setIsLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>MetadataPreview Component Demo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            value={demoUrl}
                            onChange={(e) => setDemoUrl(e.target.value)}
                            placeholder="Enter URL to preview"
                            className="flex-1"
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Button onClick={handleLoadSuccess} variant="default" size="sm">
                            Simulate Success
                        </Button>
                        <Button onClick={handleLoadError} variant="destructive" size="sm">
                            Simulate Error
                        </Button>
                        <Button onClick={() => setIsLoading(true)} variant="secondary" size="sm">
                            Show Loading
                        </Button>
                        <Button onClick={handleReset} variant="outline" size="sm">
                            Reset
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Demo States */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preview States:</h3>

                {/* Loading State */}
                <div>
                    <h4 className="text-sm font-medium mb-2">Loading State:</h4>
                    <MetadataPreview
                        metadata={null}
                        isLoading={true}
                        error={null}
                        onRetry={() => { }}
                    />
                </div>

                {/* Error State */}
                <div>
                    <h4 className="text-sm font-medium mb-2">Error State:</h4>
                    <MetadataPreview
                        metadata={null}
                        isLoading={false}
                        error="Failed to extract metadata from URL"
                        onRetry={() => console.log("Retry clicked")}
                    />
                </div>

                {/* Success State (Non-editable) */}
                <div>
                    <h4 className="text-sm font-medium mb-2">Success State (Read-only):</h4>
                    <MetadataPreview
                        metadata={sampleMetadata}
                        isLoading={false}
                        error={null}
                        onRetry={() => console.log("Refresh clicked")}
                        editable={false}
                    />
                </div>

                {/* Success State (Editable) */}
                <div>
                    <h4 className="text-sm font-medium mb-2">Success State (Editable):</h4>
                    <MetadataPreview
                        metadata={sampleMetadata}
                        isLoading={false}
                        error={null}
                        onRetry={() => console.log("Refresh clicked")}
                        onMetadataChange={(updated) => console.log("Metadata updated:", updated)}
                        editable={true}
                    />
                </div>

                {/* Interactive Demo */}
                <div>
                    <h4 className="text-sm font-medium mb-2">Interactive Demo:</h4>
                    <MetadataPreview
                        metadata={metadata}
                        isLoading={isLoading}
                        error={error}
                        onRetry={handleRetry}
                        onMetadataChange={handleMetadataChange}
                        editable={true}
                    />
                </div>
            </div>
        </div>
    )
}