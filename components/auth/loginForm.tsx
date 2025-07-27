'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Github } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import GrainOverlay from '@/components/shared/GrainOverlay';

const AuthLogin = () => {
  const [isLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAuthError = (errorType: string) => {
    let errorMessage = '';
    switch (errorType) {
      case 'no_code':
        errorMessage = 'Authorization code not received';
        break;
      case 'oauth_failed':
        errorMessage = 'OAuth authentication failed';
        break;
      case 'no_email':
        errorMessage = 'Could not retrieve email from OAuth provider';
        break;
      case 'verification_failed':
        errorMessage = 'Verification failed';
        break;
      default:
        errorMessage = 'Authentication failed';
    }
    
    setError(errorMessage);
    toast.error('Authentication Failed', {
      description: errorMessage,
      duration: 5000,
    });
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleSuccessfulLogin = useCallback(() => {
    toast.success('Successfully signed in!', {
      description: 'Welcome to Navejo. Redirecting to dashboard...',
      duration: 3000,
    });
    
    // Clear any URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  }, [router]);

  // Check for OAuth success or errors in URL params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success === 'true') {
      // Handle OAuth success callback
      handleSuccessfulLogin();
    } else if (error) {
      // Handle OAuth or other errors
      handleAuthError(error);
    }
  }, [handleSuccessfulLogin]);

  const handleGoogleLogin = async () => {
    try {
      toast.loading('Redirecting to Google...', {
        duration: 2000,
      });
      // Redirect to your Google OAuth endpoint
      window.location.href = '/api/auth/google';
    } catch (_err) {
      const errorMessage = 'Failed to initiate Google login';
      setError(errorMessage);
      toast.error('Google Login Failed', {
        description: errorMessage,
        duration: 4000,
      });
    }
  };

  const handleGitHubLogin = async () => {
    try {
      toast.loading('Redirecting to GitHub...', {
        duration: 2000,
      });
      // Redirect to your GitHub OAuth endpoint
      window.location.href = '/api/auth/github';
    } catch (_err) {
      const errorMessage = 'Failed to initiate GitHub login';
      setError(errorMessage);
      toast.error('GitHub Login Failed', {
        description: errorMessage,
        duration: 4000,
      });
    }
  };

  const handleRedirectToHome = () => {
    toast.info('Going back to home', {
      duration: 2000,
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
      <GrainOverlay/>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      
      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light mb-2">Welcome to Navejo</h1>
          <p className="text-white/70">Sign in to your account</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="space-y-6">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white text-gray-700 cursor-pointer py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-3 border border-gray-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="w-full bg-white text-gray-900 cursor-pointer py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-3 border border-gray-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github className="w-5 h-5" />
                <span>Continue with GitHub</span>
              </button>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Back to Home Button */}
            <button
              onClick={handleRedirectToHome}
              className="w-full text-black rounded-lg bg-white hover:text-black cursor-pointer transition-colors duration-200 text-sm py-2"
            >
               Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;