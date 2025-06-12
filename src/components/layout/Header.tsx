
"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LuminaLogo from '@/components/LuminaLogo';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut, Sun, Moon, Menu, Search, User as UserIcon, CircleUser } from 'lucide-react'; // Added UserIcon, CircleUser
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
import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react'; // Ensured Loader2 is imported

const headerTranslations = {
  en: {
    home: "Home", // This key is not directly used for "ALL" link text, but good for context
    explore: "Explore",
    welcome: "Welcome",
    dashboard: "Dashboard",
    logout: "Logout",
    login: "Login",
    register: "Register",
    toggleTheme: "Toggle Theme",
    openMenu: "Open menu",
    loading: "Loading...",
    all: "ALL", // Text for the "ALL" link
    searchLabel: "Search Courses",
    profileLabel: "Profile / Login",
  },
  my: {
    home: "ပင်မ",
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
    searchLabel: "သင်တန်းရှာရန်",
    profileLabel: "ပရိုဖိုင် / ဝင်ရန်",
  }
};

const Header = () => {
  const { isAuthenticated, user, role, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const t = headerTranslations[language];

  const isOnHomepage = pathname === '/';
  const useScrollHidingHeader = isOnHomepage;
  const headerScrollThreshold = 100;

  const [dynamicHeaderBackgroundClasses, setDynamicHeaderBackgroundClasses] = useState(
    isOnHomepage ? '' : 'bg-background/80 backdrop-blur-md border-b' // Start transparent on homepage, bg on others
  );
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    // Initialize with server-render friendly default
    const initialBg = (pathname === '/' && typeof window !== 'undefined' && window.scrollY < 50) ? '' : 'bg-background/80 backdrop-blur-md border-b';
    if (pathname === '/videos') {
        setDynamicHeaderBackgroundClasses('');
    } else {
        setDynamicHeaderBackgroundClasses(initialBg);
    }

    if (typeof window === 'undefined') return;

    const controlHeaderBackground = () => {
      if (pathname === '/videos') {
        setDynamicHeaderBackgroundClasses('');
        return;
      }
      if (useScrollHidingHeader) {
        const currentScrollY = window.scrollY;
        setDynamicHeaderBackgroundClasses((currentScrollY < 50) ? '' : 'bg-background/80 backdrop-blur-md border-b');
      } else {
        setDynamicHeaderBackgroundClasses('bg-background/80 backdrop-blur-md border-b');
      }
    };

    let lastScrollYLocal = window.scrollY;
    const controlHeaderVisibility = () => {
      if (!useScrollHidingHeader) {
        setHeaderVisible(true);
        return;
      }
      const currentScrollY = window.scrollY;
      if (currentScrollY > headerScrollThreshold && currentScrollY > lastScrollYLocal) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      lastScrollYLocal = currentScrollY;
    };

    window.addEventListener('scroll', controlHeaderBackground, { passive: true });
    window.addEventListener('scroll', controlHeaderVisibility, { passive: true });
    controlHeaderBackground();
    controlHeaderVisibility();

    return () => {
      window.removeEventListener('scroll', controlHeaderBackground);
      window.removeEventListener('scroll', controlHeaderVisibility);
    };
  }, [pathname, useScrollHidingHeader, headerScrollThreshold]);


  if (pathname === '/videos') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'student') return '/dashboard/student';
    return '/';
  };

  const commonNavButtonClasses = "w-full justify-start py-3 px-2 text-base";
  const commonIconClasses = "mr-2 h-5 w-5";
  const headerBaseClasses = 'sticky top-0 z-50 transition-all duration-300 ease-in-out'; // Removed transform from base

  const ThemeToggleButton = React.memo(() => (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={t.toggleTheme}
      className="hover:bg-accent/20 w-9 h-9"
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  ));
  ThemeToggleButton.displayName = 'ThemeToggleButton';


  // Desktop Navigation Items
  const desktopNavItems = (
    <>
      <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", pathname === '/' && "text-primary font-semibold underline underline-offset-4")}>
        <Link href="/">{t.all}</Link>
      </Button>
      <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", pathname === '/courses/search' && "bg-accent/10 text-primary font-semibold")}>
          <Link href="/courses/search"><Search className="mr-1 h-4 w-4" /> {t.explore}</Link>
      </Button>
      {authLoading ? (
        <Button variant="ghost" size="sm" disabled><Loader2 className="h-4 w-4 animate-spin mr-1" /> {t.loading}</Button>
      ) : isAuthenticated ? (
        <>
          <span className="text-sm text-muted-foreground hidden sm:inline">{t.welcome}, {user?.name}!</span>
          <Button variant="ghost" size="sm" asChild className={cn("hover:bg-accent/20", (pathname.startsWith('/dashboard')) && "bg-accent/10 text-primary font-semibold")}>
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
      <ThemeToggleButton />
    </>
  );

  return (
    <header className={cn(
        headerBaseClasses,
        dynamicHeaderBackgroundClasses,
        {'!-translate-y-full': !headerVisible && useScrollHidingHeader && (typeof window !== 'undefined' && window.scrollY > headerScrollThreshold) } // Added scrollY check for hiding
      )}>
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center min-h-[57px]">
        {/* Left Side */}
        {isMobile ? (
          <Link href="/" className={cn(
            "text-base font-medium", // Adjusted for "ALL"
            pathname === '/' ? "text-primary underline underline-offset-4 font-semibold" : "text-foreground hover:text-primary"
          )}>
            {t.all}
          </Link>
        ) : (
          // Desktop: Logo only if not on homepage
          !isOnHomepage ? <LuminaLogo /> : <div /> // Empty div to help with justify-between
        )}

        {/* Right Side */}
        {isMobile ? (
          // Mobile: Direct Icons
          <div className="flex items-center space-x-0.5 sm:space-x-1">
            <Button variant="ghost" size="icon" asChild aria-label={t.searchLabel} className="w-9 h-9">
                <Link href="/courses/search">
                    <Search className="h-5 w-5" />
                </Link>
            </Button>
            {authLoading ? (
                <Button variant="ghost" size="icon" disabled  className="w-9 h-9">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </Button>
            ) : isAuthenticated ? (
                <Button variant="ghost" size="icon" asChild aria-label={t.dashboard}  className="w-9 h-9">
                    <Link href={getDashboardPath()}>
                        <UserIcon className="h-5 w-5" />
                    </Link>
                </Button>
            ) : (
                <Button variant="ghost" size="icon" asChild aria-label={t.login}  className="w-9 h-9">
                    <Link href="/login">
                        <LogIn className="h-5 w-5" />
                    </Link>
                </Button>
            )}
            <ThemeToggleButton />
          </div>
        ) : (
          // Desktop Navigation
          <div className={cn(
              "flex items-center space-x-1",
              (isOnHomepage) && "ml-auto" // Push to right if no logo on homepage
            )}>
            {desktopNavItems}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

