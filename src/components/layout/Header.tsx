
"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LuminaLogo from '@/components/LuminaLogo';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut, Sun, Moon, Menu, Search, LayoutGrid, Loader2 } from 'lucide-react';
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
import React, { useEffect, useState, useRef } from 'react';
import { cn } from "@/lib/utils";

const Header = () => {
  const { isAuthenticated, user, role, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const headerScrollThreshold = 100;

  // If it's the dedicated video page, don't render the header at all.
  if (pathname === '/videos') {
    return null;
  }

  useEffect(() => {
    const controlHeader = () => {
      if (pathname === '/courses/search') {
        const currentScrollY = window.scrollY;
        if (currentScrollY > headerScrollThreshold && currentScrollY > lastScrollY.current) {
          setHeaderVisible(false);
        } else {
          setHeaderVisible(true);
        }
        lastScrollY.current = currentScrollY;
      } else {
        setHeaderVisible(true);
      }
    };

    window.addEventListener('scroll', controlHeader);
    controlHeader(); 

    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [pathname]);


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

  const isCourseSearchPage = pathname === '/courses/search';
  const isMobileHomepage = isMobile && pathname === '/';
  const isMobileCourseSearchPage = isMobile && isCourseSearchPage;

  const commonNavButtonClasses = "w-full justify-start py-3 px-2 text-base";
  const commonIconClasses = "mr-2 h-5 w-5";

  const headerBaseClasses = 'sticky top-0 z-50 transition-transform duration-300 ease-in-out';
  const headerBackgroundClasses = (isMobileHomepage || isMobileCourseSearchPage) ? '' : 'bg-background/80 backdrop-blur-md border-b';


  return (
    <header className={cn(
        headerBaseClasses, 
        headerBackgroundClasses,
        {'!-translate-y-full': !headerVisible && isCourseSearchPage}
      )}>
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center min-h-[57px]">
        {/* === LEFT SECTION === */}
        <div className="flex items-center">
          {isMobileHomepage ? (
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" asChild 
                className={cn(
                  "text-foreground hover:bg-transparent hover:text-foreground/70 px-2 font-medium",
                  pathname === '/' && "underline underline-offset-4 decoration-primary decoration-2"
                )}
              >
                <Link href="/">ALL</Link>
              </Button>
              {!loading && isAuthenticated && (
                <Button variant="ghost" size="sm" asChild className="text-foreground hover:bg-transparent hover:text-foreground/70 px-2 font-medium">
                  <Link href={getDashboardPath()}>Dashboard</Link>
                </Button>
              )}
            </div>
          ) : (
            isCourseSearchPage && isMobile ? ( // Only show title for mobile course search
              <h1 className="text-xl font-bold font-headline text-foreground flex items-center">
                <Search className="mr-2 h-5 w-5 text-primary"/> Explore Learning
              </h1>
            ) : (
              <LuminaLogo />
            )
          )}
        </div>
        
        {/* === RIGHT SECTION === */}
        <div className="flex items-center space-x-1">
          {isMobileHomepage ? (
            <>
              {loading && (
                <Button variant="ghost" size="icon" disabled>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </Button>
              )}
              {!loading && isAuthenticated && (
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              )}
              {!loading && !isAuthenticated && (
                <Button variant="ghost" size="icon" asChild aria-label="Login">
                  <Link href="/login"><LogIn className="h-5 w-5" /></Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
            </>
          ) : isMobile ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                <SheetHeader className="p-4 border-b">
                  {isCourseSearchPage ? (
                    <SheetTitle className="flex items-center"><Search className="mr-2 h-5 w-5 text-primary"/>Explore Learning</SheetTitle>
                  ) : (
                    <SheetTitle><LuminaLogo /></SheetTitle>
                  )}
                </SheetHeader>
                <div className="flex flex-col space-y-1 p-4">
                  <SheetClose asChild>
                    <Button variant="ghost" asChild className={commonNavButtonClasses}>
                      <Link href="/"><Home className={commonIconClasses} /> Home</Link>
                    </Button>
                  </SheetClose>
                  {!isCourseSearchPage && (
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className={commonNavButtonClasses}>
                        <Link href="/courses/search"><Search className={commonIconClasses} /> Explore Courses</Link>
                      </Button>
                    </SheetClose>
                  )}
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
            // Desktop navigation
            <>
              <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", pathname === '/' && "bg-accent/10")}>
                <Link href="/"><Home className="mr-1 h-4 w-4" /> Home</Link>
              </Button>
              {!isCourseSearchPage && (
                  <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", pathname === '/courses/search' && "bg-accent/10")}>
                      <Link href="/courses/search"><Search className="mr-1 h-4 w-4" /> Explore</Link>
                  </Button>
              )}
              {loading ? (
                <Button variant="ghost" size="sm" disabled>Loading...</Button>
              ) : isAuthenticated ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user?.name}!</span>
                  <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", (pathname === '/dashboard/admin' || pathname === '/dashboard/student') && "bg-accent/10")}>
                    <Link href={getDashboardPath()}><LayoutDashboard className="mr-1 h-4 w-4" /> Dashboard</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <LogOut className="mr-1 h-4 w-4" /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", pathname === '/login' && "bg-accent/10")}>
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
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
