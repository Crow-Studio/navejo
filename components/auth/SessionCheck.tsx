// components/auth/SessionCheck.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SessionCheckProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function SessionCheck({ 
  children, 
  requireAuth = false, 
  redirectTo = '/auth/sign-in' 
}: SessionCheckProps) {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        });

        const isAuthenticated = response.ok;

        if (requireAuth && !isAuthenticated) {
          router.push(redirectTo);
        } else if (!requireAuth && isAuthenticated && window.location.pathname === '/auth/sign-in') {
          // If user is already authenticated and tries to access login page, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        if (requireAuth) {
          router.push(redirectTo);
        }
      }
    };

    checkSession();
  }, [router, requireAuth, redirectTo]);

  return <>{children}</>;
}