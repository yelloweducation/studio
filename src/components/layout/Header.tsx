
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
import { useLanguage, type Language } from '@/contexts/LanguageContext';

const headerTranslations = {
  en: {
    home: "Home", // Will be overridden by "ALL" for display
    explore: "Explore",
    welcome: "Welcome",
    dashboard: "Dashboard",
    logout: "Logout",
    login: "Login",
    register: "Register",
    toggleTheme: "Toggle Theme",
    openMenu: "Open menu",
    loading: "Loading...",
    all: "ALL", // Added for clarity, though we'll use "ALL" directly
  },
  my: {
    home: "ပင်မ", // Will be overridden by "ALL" for display
    explore: "ရှာဖွေရန်",
    welcome: "ကြိုဆိုပါတယ်",
    dashboard: "ဒက်ရှ်ဘုတ်",
    logout: "ထွက်ရန်",
    login: "ဝင်ရန်",
    register: "စာရင်းသွင်းရန်",
    toggleTheme: "အသွင်ပြောင်းရန်",
    openMenu: "မီနူးဖွင့်ပါ",
    loading: "လုပ်ဆောင်နေသည်...",
    all: "အားလုံး", // Added for clarity
  }
};

const Header = () => {
  const { isAuthenticated, user, role, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { language } = useLanguage();
  const t = headerTranslations[language];

  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const headerScrollThreshold = 100; // Pixels to scroll before header potentially hides

  const isOnHomepage = pathname === '/';
  const isOnCourseSearchPage = pathname === '/courses/search';
  // Determine if scroll-based header effects (hiding, background change) should apply
  const useScrollHidingHeader = isOnHomepage; // Only apply these effects on the homepage

  // State for dynamic background classes based on scroll and page
  const [dynamicHeaderBackgroundClasses, setDynamicHeaderBackgroundClasses] = useState(
    useScrollHidingHeader && typeof window !== 'undefined' && window.scrollY < 50
      ? '' // Transparent on homepage top
      : 'bg-background/80 backdrop-blur-md border-b' // Default for other pages or scrolled homepage
  );


  useEffect(() => {
    const controlHeader = () => {
      if (pathname === '/videos') {
        setHeaderVisible(false);
        setDynamicHeaderBackgroundClasses('');
        return;
      }

      const currentScrollY = window.scrollY;

      if (useScrollHidingHeader) { // Only on homepage
        if (currentScrollY > headerScrollThreshold && currentScrollY > lastScrollY.current) {
          setHeaderVisible(false); // Hide on scroll down
        } else {
          setHeaderVisible(true);  // Show on scroll up or if at top
        }
        lastScrollY.current = currentScrollY;
        
        // Set background based on scroll position on homepage
        const newBackgroundClasses = (currentScrollY < 50) ? '' : 'bg-background/80 backdrop-blur-md border-b';
        setDynamicHeaderBackgroundClasses(newBackgroundClasses);

      } else { // For all other pages
        setHeaderVisible(true);
        setDynamicHeaderBackgroundClasses('bg-background/80 backdrop-blur-md border-b');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlHeader, { passive: true });
      controlHeader(); // Initial check
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', controlHeader);
      }
    };
  }, [pathname, useScrollHidingHeader]);


  if (pathname === '/videos') {
    return null; // Videos page has its own header
  }

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsSheetOpen(false);
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'student') return '/dashboard/student';
    return '/'; // Fallback, though should not happen if role is set
  };

  const commonNavButtonClasses = "w-full justify-start py-3 px-2 text-base";
  const commonIconClasses = "mr-2 h-5 w-5";

  const headerBaseClasses = 'sticky top-0 z-50 transition-transform duration-300 ease-in-out';


  const desktopNavItems = (
    <>
      <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", pathname === '/' && "bg-accent/10 text-primary font-semibold")}>
        <Link href="/"><Home className="mr-1 h-4 w-4" /> ALL</Link>
      </Button>
      <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", pathname === '/courses/search' && "bg-accent/10 text-primary font-semibold")}>
          <Link href="/courses/search"><Search className="mr-1 h-4 w-4" /> {t.explore}</Link>
      </Button>
      {authLoading ? (
        <Button variant="ghost" size="sm" disabled><Loader2 className="h-4 w-4 animate-spin mr-1" /> {t.loading}</Button>
      ) : isAuthenticated ? (
        <>
          <span className="text-sm text-muted-foreground hidden sm:inline">{t.welcome}, {user?.name}!</span>
          <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", (pathname === '/dashboard/admin' || pathname === '/dashboard/student') && "bg-accent/10 text-primary font-semibold")}>
            <Link href={getDashboardPath()}><LayoutDashboard className="mr-1 h-4 w-4" /> {t.dashboard}</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <LogOut className="mr-1 h-4 w-4" /> {t.logout}
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", pathname === '/login' && "bg-accent/10 text-primary font-semibold")}>
            <Link href="/login"><LogIn className="mr-1 h-4 w-4" /> {t.login}</Link>
          </Button>
          <Button variant="default" size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150">
            <Link href="/register"><UserPlus className="mr-1 h-4 w-4" /> {t.register}</Link>
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={t.toggleTheme}
        className="hover:bg-accent/20 w-9 h-9"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>
    </>
  );

  return (
    <header className={cn(
        headerBaseClasses,
        dynamicHeaderBackgroundClasses,
        {'!-translate-y-full': !headerVisible && useScrollHidingHeader } // Apply hiding class if not visible and on a page that uses scroll hiding
      )}>
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center min-h-[57px]">
        {/* Conditionally render LuminaLogo: only if not on homepage */}
        {!isOnHomepage && <LuminaLogo />}

        {isMobile ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                 {/* Ensure SheetTrigger is always on the right, even if logo is hidden */}
                <Button variant="ghost" size="icon" className={cn(isOnHomepage && "ml-auto")}> {/* Adjust margin if on homepage and logo is hidden */}
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t.openMenu}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle><LuminaLogo /></SheetTitle> {/* Logo always shown in sheet menu header */}
                </SheetHeader>
                <div className="flex flex-col space-y-1 p-4">
                  <SheetClose asChild>
                    <Button variant="ghost" asChild className={cn(commonNavButtonClasses, pathname === '/' && "bg-accent text-accent-foreground")}>
                      <Link href="/"><Home className={commonIconClasses} /> ALL</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                      <Button variant="ghost" asChild className={cn(commonNavButtonClasses, pathname === '/courses/search' && "bg-accent text-accent-foreground")}>
                        <Link href="/courses/search"><Search className={commonIconClasses} /> {t.explore}</Link>
                      </Button>
                  </SheetClose>
                  {authLoading ? (
                    <Button variant="ghost" className={commonNavButtonClasses} disabled><Loader2 className="mr-2 h-4 w-4 animate-spin"/>{t.loading}</Button>
                  ) : isAuthenticated ? (
                    <>
                      <SheetClose asChild>
                        <Button variant="ghost" asChild className={cn(commonNavButtonClasses, (pathname === '/dashboard/admin' || pathname === '/dashboard/student') && "bg-accent text-accent-foreground")}>
                          <Link href={getDashboardPath()}><LayoutDashboard className={commonIconClasses} /> {t.dashboard}</Link>
                        </Button>
                      </SheetClose>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className={`${commonNavButtonClasses} text-destructive hover:text-destructive hover:bg-destructive/10`}
                      >
                        <LogOut className={commonIconClasses} /> {t.logout}
                      </Button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button variant="ghost" asChild className={cn(commonNavButtonClasses, pathname === '/login' && "bg-accent text-accent-foreground")}>
                          <Link href="/login"><LogIn className={commonIconClasses} /> {t.login}</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="ghost" asChild className={cn(commonNavButtonClasses, pathname === '/register' && "bg-accent text-accent-foreground")}>
                          <Link href="/register"><UserPlus className={commonIconClasses} /> {t.register}</Link>
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
                    {t.toggleTheme}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
        ) : ( 
          // Desktop navigation items: pushed to right if on homepage (logo hidden)
          <div className={cn("flex items-center space-x-1", isOnHomepage && "ml-auto")}>
            {desktopNavItems}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
