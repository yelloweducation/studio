
"use client";
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Array<'student' | 'admin'>;
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; 
    }

    if (!isAuthenticated) {
      router.push('/login?redirect=' + window.location.pathname);
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      // If user's role is not allowed, redirect to their default dashboard or home
      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'student') {
        router.push('/dashboard/student');
      } else {
        router.push('/'); // Fallback, should not happen if role is set
      }
    }
  }, [isAuthenticated, role, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="space-y-4 p-4 container mx-auto">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (allowedRoles && role && !allowedRoles.includes(role))) {
    // This will be briefly shown before redirection, or if redirection logic fails
    // It's better to show skeleton during loading, and let useEffect handle redirection
    return null; 
  }

  return <>{children}</>;
};

export default ProtectedRoute;
