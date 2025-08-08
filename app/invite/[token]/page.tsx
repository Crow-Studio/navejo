// app/invite/[token]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, CheckCircle, XCircle, Building2, Users, LogIn } from "lucide-react";
import { toast } from "sonner";

interface InvitePageProps {
    params: Promise<{ token: string }>;
}

export default function InvitePage({ params }: InvitePageProps) {
    const [token, setToken] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    const router = useRouter();

    // Extract token from params
    useEffect(() => {
        params.then(({ token: paramToken }) => {
            setToken(paramToken);
        });
    }, [params]);

    // Check authentication status on mount
    useEffect(() => {
        if (!token) return;
        checkAuthStatus();

        // Check if user just logged in and has a pending invite
        const pendingToken = localStorage.getItem('pendingInviteToken');
        if (pendingToken === token && isAuthenticated) {
            localStorage.removeItem('pendingInviteToken');
            // User is now authenticated and this is their pending invite
        }
    }, [token, isAuthenticated]);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch("/api/auth/me");
            setIsAuthenticated(response.ok);
        } catch {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };



    const handleAcceptInvite = async () => {
        setAccepting(true);
        setError(null);

        try {
            const response = await fetch("/api/invitations/accept", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to accept invitation");
            }

            const { workspace } = await response.json();

            setAccepted(true);
            toast.success("Invitation accepted successfully!");

            // Redirect to workspace after a short delay
            setTimeout(() => {
                if (workspace?.id) {
                    router.push(`/workspace/${workspace.id}`);
                } else {
                    router.push("/workspaces");
                }
            }, 2000);
        } catch (error) {
            console.error("Error accepting invitation:", error);
            setError(error instanceof Error ? error.message : "Failed to accept invitation");
        } finally {
            setAccepting(false);
        }
    };

    const handleLogin = () => {
        // Store the invitation token in localStorage to redirect back after login
        localStorage.setItem('pendingInviteToken', token);
        router.push('/auth/sign-in');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-gray-900 border-gray-700">
                    <CardContent className="flex items-center justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Not authenticated - show login prompt
    if (isAuthenticated === false) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-gray-900 border-gray-700">
                    <CardHeader className="text-center">
                        <Avatar className="w-16 h-16 mx-auto mb-4">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                                <LogIn className="w-8 h-8" />
                            </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-white">Login Required</CardTitle>
                        <CardDescription className="text-gray-400">
                            You need to be logged in to accept this invitation. Please sign in to continue.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleLogin}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Sign In to Accept Invitation
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/")}
                            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                            Go to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (accepted) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-gray-900 border-gray-700">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-white">Welcome to the team!</CardTitle>
                        <CardDescription className="text-gray-400">
                            You&apos;ve successfully joined the workspace. Redirecting you now...
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-white" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <Card className="w-full max-w-md bg-gray-900 border-gray-700">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <CardTitle className="text-white">Invitation Error</CardTitle>
                        <CardDescription className="text-gray-400">
                            {error}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-3">
                        {error.includes("Unauthorized") || error.includes("Invalid session") ? (
                            <Button
                                onClick={handleLogin}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            >
                                <LogIn className="w-4 h-4 mr-2" />
                                Sign In to Accept
                            </Button>
                        ) : (
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                            >
                                Go to Dashboard
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => router.push("/")}
                            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                            Go to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-900 border-gray-700">
                <CardHeader className="text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-4">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                            <Building2 className="w-8 h-8" />
                        </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-white">You&apos;re Invited!</CardTitle>
                    <CardDescription className="text-gray-400">
                        You&apos;ve been invited to join a workspace. Click below to accept and start collaborating.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-blue-400" />
                            <div>
                                <p className="text-sm font-medium text-white">Join Workspace</p>
                                <p className="text-xs text-gray-400">Start organizing and sharing bookmarks</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleAcceptInvite}
                        disabled={accepting}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                        {accepting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Accepting Invitation...
                            </>
                        ) : (
                            "Accept Invitation"
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                        Maybe Later
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}