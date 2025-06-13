
"use client";
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from "@/components/ui/skeleton"; 

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Array<'student' | 'admin'>;
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, role, loading } = useAuth();
  const router = useRouter();
  const currentPath = usePathname();

  useEffect(() => {
    console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] START. Auth Loading: ${loading}, IsAuth: ${isAuthenticated}, User Role: '${role}'`);

    if (loading) {
      console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Auth state is loading. Waiting...`);
      return; // Wait for auth to load
    }
    console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Auth loaded. IsAuth: ${isAuthenticated}`);

    if (!isAuthenticated) {
      console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] User NOT authenticated. Redirecting to login.`);
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    
    // User is authenticated, now check role
    console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] User IS authenticated. Current Role from context: '${role}', Allowed roles for this route: [${allowedRoles?.join(', ')}]`);

    if (allowedRoles && allowedRoles.length > 0) {
      if (!role) { 
        // This case means auth is loaded, user is authenticated, but role is still null/undefined.
        // This could be a very brief transient state. Let's log and wait for next effect run.
        console.warn(`[ProtectedRoute DEBUG - PATH: ${currentPath}] User IS authenticated, but role is still '${role}'. Waiting for role to populate from AuthContext.`);
        // Returning here (without rendering children) means the effect will run again when 'role' updates.
        // We don't redirect yet, to give the role a chance to be set.
        return; 
      }
      
      // Role is now set (not null/undefined)
      const isRoleAllowed = allowedRoles.includes(role as 'student' | 'admin');
      console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Checking role. User role: '${role}', Is role allowed: ${isRoleAllowed}`);

      if (!isRoleAllowed) {
        console.warn(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Role '${role}' is NOT in allowedRoles [${allowedRoles.join(', ')}]. Determining redirect...`);
        if (role === 'admin') {
          // If current path is not admin dashboard, redirect to it. If it IS admin dashboard, this is a misconfiguration.
          if (currentPath !== '/dashboard/admin') {
             console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Role is ADMIN, but not allowed for this page. Redirecting to /dashboard/admin.`);
             router.push('/dashboard/admin');
          } else {
             console.error(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Role is ADMIN, but current path is /dashboard/admin and it's somehow not allowed. This is a config error. Fallback to home.`);
             router.push('/');
          }
        } else if (role === 'student') {
           if (currentPath !== '/dashboard/student') {
            console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Role is STUDENT. Redirecting to /dashboard/student.`);
            router.push('/dashboard/student');
           } else {
             console.error(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Role is STUDENT, but current path is /dashboard/student and it's somehow not allowed. This is a config error. Fallback to home.`);
             router.push('/');
           }
        } else {
          console.warn(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Unknown role '${role}' despite being authenticated. Redirecting to home ('/').`);
          router.push('/');
        }
        return; // Important: return after pushing to router
      }
    }
    // If no allowedRoles are specified, or if role is allowed
    console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] User is authenticated AND authorized. Rendering children.`);

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

  // If not loading, determine if we should render children or null (while waiting for redirect or role)
  if (!isAuthenticated) {
    // Should be handled by redirect in useEffect, but as a fallback for render phase:
    console.log(`[ProtectedRoute RENDER - PATH: ${currentPath}] Not authenticated. Returning null (useEffect should redirect).`);
    return null; 
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role) {
      // Authenticated, auth not loading, but role is not yet set.
      console.warn(`[ProtectedRoute RENDER - PATH: ${currentPath}] Authenticated, but role is '${role}'. Returning null (useEffect should re-trigger or handle).`);
      return null; // Wait for role to be populated
    }
    if (!allowedRoles.includes(role as 'student' | 'admin')) {
      // Authenticated, role is set, but not allowed for this route.
      console.warn(`[ProtectedRoute RENDER - PATH: ${currentPath}] Role '${role}' not allowed. Returning null (useEffect should redirect).`);
      return null; // useEffect will redirect
    }
  }
  
  // If all checks pass:
  console.log(`[ProtectedRoute RENDER - PATH: ${currentPath}] All checks passed. Rendering children.`);
  return <>{children}</>;
};

export default ProtectedRoute;
