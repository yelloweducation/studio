
"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LuminaLogo from '@/components/LuminaLogo';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut, Sun, Moon, Compass, User as UserIcon, BookOpen, Layers, Brain, Loader2, Menu, Circle, Search as SearchIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';


const headerTranslations = {
  en: {
    home: "Home",
    all: "ALL", 
    explore: "Explore Courses",
    videos: "Reels",
    flashCards: "Flash Cards",
    personalityTest: "Assessments",
    welcome: "Welcome",
    dashboard: "Dashboard",
    logout: "Logout",
    login: "Login",
    register: "Register",
    toggleTheme: "Toggle Theme",
    openMenu: "Open menu",
    loading: "Loading...",
    menuTitle: "Navigation"
  },
  my: {
    home: "ပင်မ",
    all: "အားလုံး", 
    explore: "သင်တန်းများ",
    videos: "ဗီဒီယို",
    flashCards: "ကတ်ပြားများ",
    personalityTest: "စစ်ဆေးမှုများ",
    welcome: "ကြိုဆိုပါတယ်",
    dashboard: "ဒက်ရှ်ဘုတ်",
    logout: "ထွက်ရန်",
    login: "ဝင်ရန်",
    register: "စာရင်းသွင်းရန်",
    toggleTheme: "အသွင်ပြောင်းရန်",
    openMenu: "မီနူးဖွင့်ပါ",
    loading: "လုပ်ဆောင်နေသည်...",
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


  useEffect(() => {
    if (typeof window === 'undefined') return;

    const controlHeaderBackground = () => {
      // This effect primarily controls background for DESKTOP on non-video pages
      // Mobile transparency is handled by the main header's className conditional logic
      if (pathname === '/videos') {
        setDynamicHeaderBackgroundClasses(''); 
      } else {
        setDynamicHeaderBackgroundClasses(window.scrollY < 50 ? '' : 'bg-background/80 backdrop-blur-md border-b');
      }
    };

    controlHeaderBackground();

    window.addEventListener('scroll', controlHeaderBackground, { passive: true });
    return () => window.removeEventListener('scroll', controlHeaderBackground);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined' || !useScrollHidingHeader || isMobile) { // Disable scroll hiding on mobile
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
  }, [pathname, useScrollHidingHeader, headerScrollThreshold, isMobile]); // Added isMobile


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
    return '/login'; 
  };

  const navLinkClasses = (targetPath: string) => cn(
    "text-sm font-medium text-foreground hover:text-primary transition-colors px-3 py-2 rounded-md",
    pathname === targetPath && "bg-accent text-accent-foreground font-semibold"
  );
  
  const mobileNavLinkClasses = (targetPath: string) => cn(
    "flex items-center w-full p-3 rounded-md text-base font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
    pathname === targetPath && "bg-accent text-accent-foreground"
  );

  const commonNavItems = [
    { href: "/", label: t.home, Icon: Home },
    { href: "/courses/search", label: t.explore, Icon: Compass },
    { href: "/videos", label: t.videos, Icon: BookOpen }, // Reels icon
    { href: "/flash-cards", label: t.flashCards, Icon: Layers },
    { href: "/personality-tests", label: t.personalityTest, Icon: Brain }
  ];

  const ThemeToggleButton = React.memo(({ isMobileSheet = false }: { isMobileSheet?: boolean}) => (
    <Button
      variant="ghost"
      size={isMobileSheet ? "default" : "icon"}
      onClick={toggleTheme}
      aria-label={t.toggleTheme}
      className={cn(
        "hover:bg-accent/20 text-foreground",
        isMobileSheet ? "w-full justify-start p-3 text-base" : "w-9 h-9"
      )}
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      {isMobileSheet && <span className="ml-2">{t.toggleTheme} ({theme === 'light' ? 'Dark' : 'Light'})</span>}
    </Button>
  ));
  ThemeToggleButton.displayName = 'ThemeToggleButton';

  const DesktopNav = () => (
    <nav className="flex items-center space-x-1 lg:space-x-2">
      {commonNavItems.map(item => (
        <Button key={item.label} variant="ghost" size="sm" asChild className={navLinkClasses(item.href)}>
          <Link href={item.href}><item.Icon className="mr-1.5 h-4 w-4" />{item.label}</Link>
        </Button>
      ))}
      <Separator orientation="vertical" className="h-6 mx-1 lg:mx-2"/>
      {authLoading ? (
        <Button variant="ghost" size="sm" disabled><Loader2 className="h-4 w-4 animate-spin mr-1" /> {t.loading}</Button>
      ) : isAuthenticated ? (
        <>
          <span className="text-sm text-muted-foreground hidden lg:inline">{t.welcome}, {user?.name}!</span>
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
    </nav>
  );
  
  // Mobile specific components
  const MobileHomepageAllLink = () => (
    <Link href="/" className={cn(
        "group text-base font-bold font-headline px-2 py-1 rounded-md transition-all", // Font size reduced to text-base
        "text-black dark:text-white", 
        "underline decoration-primary underline-offset-4 decoration-2",
        "shadow-md hover:shadow-lg active:shadow-sm", 
        "hover:translate-x-px hover:-translate-y-px active:translate-x-0 active:translate-y-0"
      )}>
        {t.all}
    </Link>
  );

  const MobileRightNav = () => (
    <div className="flex items-center space-x-1">
      {authLoading ? (
        <Button variant="ghost" size="icon" disabled className="w-8 h-8"><Loader2 className="h-5 w-5 animate-spin" /></Button>
      ) : isAuthenticated ? (
        <>
          <Button variant="ghost" size="icon" asChild className="text-foreground hover:text-primary w-8 h-8" aria-label={t.dashboard}>
            <Link href={getDashboardPath()}><LayoutDashboard className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-foreground hover:text-primary w-8 h-8" aria-label={t.logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="icon" asChild className="text-foreground hover:text-primary w-8 h-8" aria-label={t.login}>
          <Link href="/login"><LogIn className="h-5 w-5" /></Link>
        </Button>
      )}
      <ThemeToggleButton />
    </div>
  );


  return (
    <header className={cn(
        "sticky top-0 z-50 transition-all duration-300 ease-in-out",
        // Apply dynamic background classes only if not mobile, otherwise, it's transparent
        !isMobile ? dynamicHeaderBackgroundClasses : 'bg-transparent border-transparent',
        // Scroll hiding only for desktop and when useScrollHidingHeader is true
        {'!-translate-y-full': !headerVisible && useScrollHidingHeader && !isMobile }
      )}>
      <div className="container mx-auto px-4 py-2.5 flex justify-between items-center min-h-[60px]">
        {isMobile ? (
          <>
            <div className="flex-1">
              {isOnHomepage && <MobileHomepageAllLink />}
            </div>
            <MobileRightNav />
          </>
        ) : (
          <>
            <LuminaLogo />
            <DesktopNav />
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
