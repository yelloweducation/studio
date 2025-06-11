
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
      // If auth state is still loading, don't do anything.
      // The component will show its own loading skeleton or null.
      return;
    }

    // Auth state is no longer loading.
    if (!isAuthenticated) {
      // User is not authenticated, redirect to login.
      // Use router.asPath to get the current client-side path for the redirect.
      const currentClientPath = router.asPath;
      router.push(`/login?redirect=${encodeURIComponent(currentClientPath)}`);
      return;
    }

    // User is authenticated, check roles.
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      // User's role is not allowed for this route.
      // Redirect to their default dashboard or home.
      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'student') {
        router.push('/dashboard/student');
      } else {
        // Fallback for unexpected roles or if no specific dashboard.
        router.push('/');
      }
    }
    // If authenticated and role is allowed (or no specific roles required), rendering children.
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

  // If not loading but still not authenticated (or role mismatch),
  // useEffect will handle redirection. Return null to prevent rendering children prematurely.
  if (!isAuthenticated || (allowedRoles && role && !allowedRoles.includes(role))) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
