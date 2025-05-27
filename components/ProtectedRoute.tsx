"use client";

import React, { useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Allow access to login and signup pages even if not authenticated
      if (pathname !== '/login' && pathname !== '/signup') {
        router.push('/login');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    // Show a full-page loading skeleton or a simpler loader
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <div className="space-y-4 w-full max-w-md">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  // If user is logged in, or if user is null but on an allowed unauthenticated page (login/signup)
  if (user || pathname === '/login' || pathname === '/signup') {
    return <>{children}</>;
  }
  
  // This case should ideally be caught by the useEffect redirect,
  // but as a fallback, prevent rendering children if not user and not on auth pages.
  // Or, if useEffect hasn't run yet, this prevents a flash of content.
  return null; 
}
