'use client';
import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

const MagicLinkLogin = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use Better Auth's magic link functionality
      const response = await authClient.signIn.magicLink({
        email,
        callbackURL: '/dashboard', // Redirect to dashboard after successful sign-in
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to send magic link');
      }
      
      setIsEmailSent(true);
      // Don't clear email here so user can see which email was used
    } catch (err: any) {
      console.error('Magic link error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleTryDifferentEmail = () => {
    setIsEmailSent(false);
    setEmail('');
    setError('');
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
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
            
            <button
              onClick={handleTryDifferentEmail}
              className="text-white/70 hover:text-white transition-colors duration-200 text-sm"
            >
              Try a different email
            </button>
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
          <p className="text-white/70">Sign in with your email address</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="space-y-6">
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
              onClick={handleSubmit}
              disabled={!email || isLoading}
              className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span>Sending Magic Link...</span>
                </>
              ) : (
                <>
                  <span>Send Magic Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              No passwords required. We&apos;ll send you a secure link to sign in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkLogin;