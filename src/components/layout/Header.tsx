
"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LuminaLogo from '@/components/LuminaLogo';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut, Sun, Moon, Menu, Search, Loader2 } from 'lucide-react'; // Removed LayoutGrid as it wasn't used in nav
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
import { useLanguage } from '@/contexts/LanguageContext';

const headerTranslations = {
  en: {
    home: "ALL", // Changed from "Home"
    explore: "Explore",
    welcome: "Welcome",
    dashboard: "Dashboard",
    logout: "Logout",
    login: "Login",
    register: "Register",
    toggleTheme: "Toggle Theme",
    openMenu: "Open menu",
    loading: "Loading...",
    all: "ALL",
  },
  my: {
    home: "အားလုံး", // Changed from "ပင်မ"
    explore: "ရှာဖွေရန်",
    welcome: "ကြိုဆိုပါတယ်",
    dashboard: "ဒက်ရှ်ဘုတ်",
    logout: "ထွက်ရန်",
    login: "ဝင်ရန်",
    register: "စာရင်းသွင်းရန်",
    toggleTheme: "အသွင်ပြောင်းရန်",
    openMenu: "မီနူးဖွင့်ပါ",
    loading: "လုပ်ဆောင်နေသည်...",
    all: "အားလုံး",
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

  const isOnHomepage = pathname === '/';
  const useScrollHidingHeader = isOnHomepage;
  const headerScrollThreshold = 100;

  // Initialize to the state that the server renders for the homepage (which has background, per the error).
  // Then client useEffect will adjust it for homepage top-scroll transparency.
  const [dynamicHeaderBackgroundClasses, setDynamicHeaderBackgroundClasses] = useState('bg-background/80 backdrop-blur-md border-b');
  const [headerVisible, setHeaderVisible] = useState(true);

  // Effect for header visibility (hiding on scroll down on homepage)
  useEffect(() => {
    if (typeof window === 'undefined') {
      setHeaderVisible(true); // Default to visible if no window (SSR or pre-mount)
      return;
    }

    if (!useScrollHidingHeader) {
      setHeaderVisible(true); // Always visible on non-homepage
      return;
    }

    // Below logic only applies if useScrollHidingHeader is true (homepage)
    let lastScrollYLocal = window.scrollY;
    const controlHeaderVisibility = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > headerScrollThreshold && currentScrollY > lastScrollYLocal) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      lastScrollYLocal = currentScrollY;
    };

    window.addEventListener('scroll', controlHeaderVisibility, { passive: true });
    controlHeaderVisibility(); // Initial check

    return () => window.removeEventListener('scroll', controlHeaderVisibility);
  }, [pathname, useScrollHidingHeader, headerScrollThreshold]); // usePathname() ensures pathname is stable, added to deps

  // Effect for header background (transparent on homepage top)
  useEffect(() => {
    if (typeof window === 'undefined') { // Should not run on server
      return;
    }

    const controlHeaderBackground = () => {
      if (pathname === '/videos') {
        setDynamicHeaderBackgroundClasses(''); // Videos page has its own header style or no standard header
        return;
      }
      if (useScrollHidingHeader) { // True for homepage
        const currentScrollY = window.scrollY;
        const newBackgroundClasses = (currentScrollY < 50) ? '' : 'bg-background/80 backdrop-blur-md border-b';
        setDynamicHeaderBackgroundClasses(newBackgroundClasses);
      } else { // For all other pages
        setDynamicHeaderBackgroundClasses('bg-background/80 backdrop-blur-md border-b');
      }
    };
    
    window.addEventListener('scroll', controlHeaderBackground, { passive: true });
    // Call on mount to set initial client-side state correctly after hydration
    controlHeaderBackground(); 

    return () => window.removeEventListener('scroll', controlHeaderBackground);
  }, [pathname, useScrollHidingHeader]);


  if (pathname === '/videos') {
    return null;
  }

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
  const headerBaseClasses = 'sticky top-0 z-50 transition-transform duration-300 ease-in-out';

  const desktopNavItems = (
    <>
      <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", pathname === '/' && "bg-accent/10 text-primary font-semibold")}>
        <Link href="/"><Home className="mr-1 h-4 w-4" /> {t.all}</Link>
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
        {'!-translate-y-full': !headerVisible && useScrollHidingHeader }
      )}>
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center min-h-[57px]">
        {!isOnHomepage && <LuminaLogo />}

        {isMobile ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(isOnHomepage && "ml-auto")}>
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t.openMenu}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle><LuminaLogo /></SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-1 p-4">
                  <SheetClose asChild>
                    <Button variant="ghost" asChild className={cn(commonNavButtonClasses, pathname === '/' && "bg-accent text-accent-foreground")}>
                      <Link href="/"><Home className={commonIconClasses} /> {t.all}</Link>
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
          <div className={cn("flex items-center space-x-1", isOnHomepage && "ml-auto")}>
            {desktopNavItems}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
