
"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LuminaLogo from '@/components/LuminaLogo';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut, Sun, Moon, Menu, Search, User as UserIcon, CircleUser, Loader2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';


const headerTranslations = {
  en: {
    home: "Home",
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
    searchLabel: "Search Courses",
    profileLabel: "Profile / Login",
    menuTitle: "Navigation"
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
    menuTitle: "လမ်းညွှန်"
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
     pathname === '/videos' ? '' : 'bg-background/80 backdrop-blur-md border-b'
  );
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  useEffect(() => {
    if (typeof window === 'undefined') return;

    const controlHeaderBackground = () => {
      if (pathname === '/videos') {
        setDynamicHeaderBackgroundClasses(''); // Videos page header is handled separately or not at all by this component
      } else {
        setDynamicHeaderBackgroundClasses(window.scrollY < 50 ? '' : 'bg-background/80 backdrop-blur-md border-b');
      }
    };
    
    // Set initial state based on current scroll and path
    controlHeaderBackground();

    window.addEventListener('scroll', controlHeaderBackground, { passive: true });
    return () => window.removeEventListener('scroll', controlHeaderBackground);
  }, [pathname]); // Re-run when pathname changes to correctly set initial state

  useEffect(() => {
    if (typeof window === 'undefined' || !useScrollHidingHeader) {
      setHeaderVisible(true);
      return;
    }

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

    controlHeaderVisibility();
    window.addEventListener('scroll', controlHeaderVisibility, { passive: true });
    return () => window.removeEventListener('scroll', controlHeaderVisibility);
  }, [pathname, useScrollHidingHeader, headerScrollThreshold]);


  if (pathname === '/videos') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsSheetOpen(false); // Close sheet on logout if open
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'student') return '/dashboard/student';
    return '/'; 
  };

  const headerBaseClasses = 'sticky top-0 z-50 transition-all duration-300 ease-in-out';

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

  const navLinkClasses = (targetPath: string) => cn(
    "hover:bg-accent/20",
    pathname === targetPath && "bg-accent/10 text-primary font-semibold"
  );
  
  const allLinkClasses = cn(
    "text-sm font-medium", // Default text color (black in light mode) and size
    isOnHomepage 
      ? "text-foreground font-semibold underline decoration-primary decoration-2 underline-offset-4" // Active on homepage: black text, yellow thicker underline
      : "text-foreground hover:text-primary" // Hover on other pages: black text, hover yellow
  );


  // Desktop Navigation Items
  const desktopNavItems = (
    <>
      <Button
        variant="ghost"
        size="sm"
        asChild
        className={cn(
          navLinkClasses("/"),
          isOnHomepage && "underline decoration-primary decoration-2 underline-offset-4 font-semibold"
        )}
      >
        <Link href="/">{t.all}</Link>
      </Button>
      <Button variant="ghost" size="sm" asChild className={navLinkClasses('/courses/search')}>
          <Link href="/courses/search"><Search className="mr-1 h-4 w-4" /> {t.explore}</Link>
      </Button>
      {authLoading ? (
        <Button variant="ghost" size="sm" disabled><Loader2 className="h-4 w-4 animate-spin mr-1" /> {t.loading}</Button>
      ) : isAuthenticated ? (
        <>
          <span className="text-sm text-muted-foreground hidden sm:inline">{t.welcome}, {user?.name}!</span>
          <Button variant="ghost" size="sm" asChild className={navLinkClasses(getDashboardPath())}>
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
          <Button variant="ghost" size="sm" asChild className={navLinkClasses('/login')}>
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

  // Mobile Right Side Icons
  const mobileRightIcons = (
    <div className="flex items-center space-x-0.5 sm:space-x-1">
      {authLoading ? (
        <Button variant="ghost" size="icon" disabled className="w-9 h-9">
          <Loader2 className="h-5 w-5 animate-spin" />
        </Button>
      ) : isAuthenticated ? (
        <>
          <Button variant="ghost" size="icon" asChild aria-label={t.dashboard} className="w-9 h-9">
            <Link href={getDashboardPath()}>
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t.logout} className="w-9 h-9">
            <LogOut className="h-5 w-5" />
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="icon" asChild aria-label={t.login} className="w-9 h-9">
          <Link href="/login">
            <LogIn className="h-5 w-5" />
          </Link>
        </Button>
      )}
      <ThemeToggleButton />
    </div>
  );


  return (
    <header className={cn(
        headerBaseClasses,
        dynamicHeaderBackgroundClasses, 
        {'!-translate-y-full': !headerVisible && useScrollHidingHeader } 
      )}>
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center min-h-[57px]">
        {/* Left Side */}
        <Link href="/" className={allLinkClasses}>
          {t.all}
        </Link>
        
        {/* Right Side */}
        {isMobile ? (
          mobileRightIcons
        ) : (
          <div className={cn("flex items-center space-x-1")}>
            {desktopNavItems}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

