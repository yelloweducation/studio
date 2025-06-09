
"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LuminaLogo from '@/components/LuminaLogo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, user, role, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'student') return '/dashboard/student';
    return '/';
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <LuminaLogo />
        <div className="space-x-2 flex items-center">
          <Button variant="ghost" size="sm" asChild className="hover:bg-accent/20">
            <Link href="/"><Home className="mr-1 h-4 w-4" /> Home</Link>
          </Button>
          {loading ? (
             <Button variant="ghost" size="sm" disabled>Loading...</Button>
          ) : isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user?.name}!</span>
              <Button variant="ghost" size="sm" asChild className="hover:bg-accent/20">
                <Link href={getDashboardPath()}><LayoutDashboard className="mr-1 h-4 w-4" /> Dashboard</Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hover:bg-accent/20">
                <Link href="/login"><LogIn className="mr-1 h-4 w-4" /> Login</Link>
              </Button>
              <Button variant="default" size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150">
                <Link href="/register"><UserPlus className="mr-1 h-4 w-4" /> Register</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
