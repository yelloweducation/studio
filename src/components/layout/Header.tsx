
"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LuminaLogo from '@/components/LuminaLogo';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from '@/components/ui/separator';
import React from 'react';

const Header = () => {
  const { isAuthenticated, user, role, logout, loading } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsSheetOpen(false); 
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'student') return '/dashboard/student';
    return '/';
  };

  const commonNavButtonClasses = "w-full justify-start py-3 px-2 text-base";
  const commonIconClasses = "mr-2 h-5 w-5";

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <LuminaLogo />
        
        {isMobile ? (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-primary">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-1 p-4">
                <SheetClose asChild>
                  <Button variant="ghost" asChild className={commonNavButtonClasses}>
                    <Link href="/"><Home className={commonIconClasses} /> Home</Link>
                  </Button>
                </SheetClose>

                {loading ? (
                  <Button variant="ghost" className={commonNavButtonClasses} disabled>Loading...</Button>
                ) : isAuthenticated ? (
                  <>
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className={commonNavButtonClasses}>
                        <Link href={getDashboardPath()}><LayoutDashboard className={commonIconClasses} /> Dashboard</Link>
                      </Button>
                    </SheetClose>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className={`${commonNavButtonClasses} text-destructive hover:text-destructive hover:bg-destructive/10`}
                    >
                      <LogOut className={commonIconClasses} /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className={commonNavButtonClasses}>
                        <Link href="/login"><LogIn className={commonIconClasses} /> Login</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className={commonNavButtonClasses}>
                        <Link href="/register"><UserPlus className={commonIconClasses} /> Register</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
                
                <Separator className="my-2" />

                <Button 
                  variant="ghost" 
                  onClick={() => { toggleTheme(); setIsSheetOpen(false); }} 
                  className={commonNavButtonClasses}
                >
                  {theme === 'light' ? <Moon className={commonIconClasses} /> : <Sun className={commonIconClasses} />}
                  Toggle Theme
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="space-x-1 flex items-center">
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              aria-label="Toggle theme" 
              className="hover:bg-accent/20 w-9 h-9"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
