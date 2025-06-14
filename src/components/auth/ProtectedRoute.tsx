
"use client";
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from "@/components/ui/skeleton"; 

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Array<'student' | 'admin'>; // Keep allowedRoles definition as lowercase for clarity
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, role, loading } = useAuth();
  const router = useRouter();
  const currentPath = usePathname();

  useEffect(() => {
    const currentRoleLower = role?.toLowerCase(); // Convert context role to lowercase
    console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] START. Auth Loading: ${loading}, IsAuth: ${isAuthenticated}, User Role from Context: '${role}', Lowercase Role: '${currentRoleLower}'`);

    if (loading) {
      console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Auth state is loading. Waiting...`);
      return; 
    }
    console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Auth loaded. IsAuth: ${isAuthenticated}`);

    if (!isAuthenticated) {
      console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] User NOT authenticated. Redirecting to login.`);
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    
    if (allowedRoles && allowedRoles.length > 0) {
      if (!role) { 
        console.warn(`[ProtectedRoute DEBUG - PATH: ${currentPath}] User IS authenticated, but role from context is '${role}'. This might be a brief delay. Waiting for role to populate or re-render.`);
        // If role is crucial and not yet set, we might want to show a loading state or wait for next effect.
        // For now, if this leads to a redirect, the next log will indicate it.
        // The component will re-render when role updates, and this useEffect will run again.
        return;
      }
      
      // Role from context is now set (not null/undefined)
      const isRoleAllowed = allowedRoles.includes(currentRoleLower as 'student' | 'admin');
      console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Checking role. User Role from Context: '${role}', Lowercase Role: '${currentRoleLower}', Allowed roles for this route: [${allowedRoles?.join(', ')}], Is role allowed: ${isRoleAllowed}`);

      if (!isRoleAllowed) {
        console.warn(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Role '${currentRoleLower}' (from context role '${role}') is NOT in allowedRoles [${allowedRoles.join(', ')}]. Determining redirect...`);
        if (currentRoleLower === 'admin') {
          if (currentPath !== '/dashboard/admin') {
             console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Role is ADMIN, but not allowed for this page. Redirecting to /dashboard/admin.`);
             router.push('/dashboard/admin');
          } else {
             console.error(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Role is ADMIN, but current path is /dashboard/admin and it's somehow not allowed. This is a config error. Fallback to home.`);
             router.push('/');
          }
        } else if (currentRoleLower === 'student') {
           if (currentPath !== '/dashboard/student') {
            console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Role is STUDENT. Redirecting to /dashboard/student.`);
            router.push('/dashboard/student');
           } else {
             console.error(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Role is STUDENT, but current path is /dashboard/student and it's somehow not allowed. This is a config error. Fallback to home.`);
             router.push('/');
           }
        } else {
          console.warn(`[ProtectedRoute DEBUG - PATH: ${currentPath}] Unknown role '${currentRoleLower}' (from context role '${role}') despite being authenticated. Redirecting to home ('/').`);
          router.push('/');
        }
        return; 
      }
    }
    console.log(`[ProtectedRoute DEBUG - PATH: ${currentPath}] User is authenticated AND authorized (Role: '${currentRoleLower}'). Rendering children.`);

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

  if (!isAuthenticated) {
    console.log(`[ProtectedRoute RENDER - PATH: ${currentPath}] Not authenticated. Returning null (useEffect should redirect).`);
    return null; 
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const currentRoleLower = role?.toLowerCase();
    if (!role) {
      console.warn(`[ProtectedRoute RENDER - PATH: ${currentPath}] Authenticated, but role from context is '${role}' (authLoading is false). Returning null (useEffect should re-trigger or handle).`);
      return null; 
    }
    if (!allowedRoles.includes(currentRoleLower as 'student' | 'admin')) {
      console.warn(`[ProtectedRoute RENDER - PATH: ${currentPath}] Role '${currentRoleLower}' (from context role '${role}') not allowed. Returning null (useEffect should redirect).`);
      return null; 
    }
  }
  
  console.log(`[ProtectedRoute RENDER - PATH: ${currentPath}] All checks passed. Rendering children (Role: '${role?.toLowerCase()}').`);
  return <>{children}</>;
};

export default ProtectedRoute;

    