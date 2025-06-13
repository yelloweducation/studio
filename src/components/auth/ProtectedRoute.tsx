
"use client";
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Array<'student' | 'admin'>;
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();
  const currentPath = usePathname(); // Get current path

  useEffect(() => {
    console.log(`[ProtectedRoute DEBUG] Path: ${currentPath}, Loading: ${loading}, Authenticated: ${isAuthenticated}, User Role: '${role}'`);

    if (loading) {
      console.log("[ProtectedRoute DEBUG] Auth state is loading. Waiting...");
      return;
    }

    if (!isAuthenticated) {
      console.log(`[ProtectedRoute DEBUG] User NOT authenticated. Redirecting from ${currentPath} to login.`);
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // If authenticated, check roles
    if (allowedRoles && allowedRoles.length > 0) {
      if (!role) {
        console.warn(`[ProtectedRoute DEBUG] User authenticated but role is '${role}'. This might be a context update delay. Path: ${currentPath}`);
        // Potentially wait or redirect to a generic authenticated page or home, rather than login.
        // For now, if role is critical and not yet set, this might cause issues if not handled.
        // However, the primary check is !allowedRoles.includes(role)
      }
      
      const isRoleAllowed = role && allowedRoles.includes(role);
      console.log(`[ProtectedRoute DEBUG] Checking role. User role: '${role}', Allowed roles: [${allowedRoles.join(', ')}], Is role allowed: ${isRoleAllowed}`);

      if (!isRoleAllowed) {
        console.log(`[ProtectedRoute DEBUG] Role '${role}' is NOT in allowedRoles [${allowedRoles.join(', ')}]. Redirecting from ${currentPath}.`);
        // Determine intelligent redirect based on current role
        if (role === 'admin') {
          router.push('/dashboard/admin');
        } else if (role === 'student') {
          router.push('/dashboard/student');
        } else {
          console.warn(`[ProtectedRoute DEBUG] Unknown or null role '${role}', redirecting to home ('/').`);
          router.push('/'); 
        }
        return;
      }
    }
    // If no allowedRoles are specified, just being authenticated is enough
    console.log(`[ProtectedRoute DEBUG] User is authenticated and authorized for ${currentPath}. Rendering children.`);

  }, [isAuthenticated, role, loading, router, allowedRoles, currentPath]);

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

  // If loading is false, and we haven't redirected, then access is granted
  // The useEffect handles redirects for unauthorized cases.
  // This ensures children are only rendered if all checks pass and no redirect is pending.
  if (!isAuthenticated || (allowedRoles && allowedRoles.length > 0 && (!role || !allowedRoles.includes(role)))) {
    // This state should ideally be caught by useEffect and result in a redirect.
    // Returning null here prevents rendering children while waiting for redirect logic to execute.
    // This can happen if the component re-renders before useEffect fully processes the redirect.
    console.log(`[ProtectedRoute DEBUG] Render check: Waiting for auth checks or redirect. Auth: ${isAuthenticated}, Role: ${role}`);
    return null;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
