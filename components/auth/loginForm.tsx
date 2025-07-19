'use client';
import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, CheckCircle, Github } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import GrainOverlay from '@/components/shared/GrainOverlay';

const AuthLogin = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Check for magic link token or OAuth success in URL params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (token) {
      // Handle magic link token validation
      validateMagicToken(token);
    } else if (success === 'true') {
      // Handle OAuth success callback
      handleSuccessfulLogin();
    } else if (error) {
      // Handle OAuth or other errors
      handleAuthError(error);
    }
  }, []);

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
      case 'no_token':
        errorMessage = 'Magic link token missing';
        break;
      case 'invalid_token':
        errorMessage = 'Invalid magic link token';
        break;
      case 'expired_token':
        errorMessage = 'Magic link has expired';
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

  const validateMagicToken = async (token: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid magic link');
      }

      // Token is valid, handle successful login
      handleSuccessfulLogin();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Magic link validation failed';
      setError(errorMessage);
      toast.error('Login Failed', {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSubmit = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      setIsEmailSent(true);
      toast.success('Magic link sent successfully!', {
        description: 'Check your email for the login link.',
        duration: 5000,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      toast.error('Failed to send magic link', {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleMagicLinkSubmit();
    }
  };

  const handleTryDifferentEmail = () => {
    setIsEmailSent(false);
    setEmail('');
    setError('');
  };

  const handleGoogleLogin = async () => {
    try {
      toast.loading('Redirecting to Google...', {
        duration: 2000,
      });
      // Redirect to your Google OAuth endpoint
      window.location.href = '/api/auth/google';
    } catch (err) {
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
    } catch (err) {
      const errorMessage = 'Failed to initiate GitHub login';
      setError(errorMessage);
      toast.error('GitHub Login Failed', {
        description: errorMessage,
        duration: 4000,
      });
    }
  };

  const handleSuccessfulLogin = () => {
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
  };

  const handleRedirectToHome = () => {
    toast.info('Going back to home', {
      duration: 2000,
    });
    router.push('/');
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
        <GrainOverlay/>
        <div className="max-w-md w-full text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-light mb-4">Check Your Email</h2>
            <p className="text-white/70 mb-2 leading-relaxed">
              We&apos;ve sent a magic link to:
            </p>
            <p className="text-white font-medium mb-6">
              {email}
            </p>
            <p className="text-white/70 mb-6 leading-relaxed">
              Click the link in your email to sign in. The link will expire in 10 minutes.
            </p>
            
            <div className="text-sm text-white/50 mb-6">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleTryDifferentEmail}
                className="text-white/70 hover:text-white transition-colors duration-200 text-sm"
              >
                Try a different email
              </button>
              
              <button
                onClick={handleRedirectToHome}
                className="text-white/50 hover:text-white/70 transition-colors duration-200 text-xs"
              >
                ← Back to home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
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

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black text-white/50">or</span>
              </div>
            </div>

            {/* Magic Link Section */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-white/40" />
              </div>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-200"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              onClick={handleMagicLinkSubmit}
              disabled={!email || isLoading}
              className="w-full bg-white/10 text-white cursor-pointer py-3 px-4 rounded-lg font-medium hover:bg-white/20 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending Magic Link...</span>
                </>
              ) : (
                <>
                  <span>Send Magic Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

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