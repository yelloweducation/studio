
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
    console.log(`[ProtectedRoute] Effect triggered. Path: ${router.asPath}, Loading: ${loading}, Authenticated: ${isAuthenticated}, Role: ${role}`);
    if (loading) {
      console.log("[ProtectedRoute] Auth state is loading. Waiting...");
      return;
    }

    if (!isAuthenticated) {
      console.log("[ProtectedRoute] User not authenticated. Redirecting to login.");
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      console.log(`[ProtectedRoute] Role '${role}' not in allowedRoles (${allowedRoles.join(', ')}). Redirecting.`);
      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'student') {
        router.push('/dashboard/student');
      } else {
        console.warn(`[ProtectedRoute] Unknown role '${role}', redirecting to home.`);
        router.push('/');
      }
      return;
    }
    console.log("[ProtectedRoute] User is authenticated and authorized. Rendering children.");
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
    // This case should be handled by the useEffect redirect.
    // Returning null prevents rendering children before redirect occurs.
    console.log("[ProtectedRoute] Render check: Not authenticated or role not allowed. Awaiting redirect from useEffect.");
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
