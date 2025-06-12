
"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
// import LuminaLogo from '@/components/LuminaLogo'; // Logo removed
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut, Sun, Moon, Compass, User as UserIcon, BookOpen, Layers, Brain, Loader2 } from 'lucide-react'; // Menu, Circle removed
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';

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
    loading: "Loading...",
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
    loading: "လုပ်ဆောင်နေသည်...",
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

  const [dynamicHeaderBackgroundClasses, setDynamicHeaderBackgroundClasses] = useState('');
  const [headerVisible, setHeaderVisible] = useState(true);


  useEffect(() => {
    if (typeof window === 'undefined') return;

    const controlHeaderBackground = () => {
      if (pathname === '/videos' || isMobile) { 
        setDynamicHeaderBackgroundClasses('');
      } else {
        setDynamicHeaderBackgroundClasses(window.scrollY < 50 ? '' : 'bg-background/80 backdrop-blur-md border-b');
      }
    };

    controlHeaderBackground();

    window.addEventListener('scroll', controlHeaderBackground, { passive: true });
    return () => window.removeEventListener('scroll', controlHeaderBackground);
  }, [pathname, isMobile]);

  useEffect(() => {
    if (typeof window === 'undefined' || !useScrollHidingHeader || isMobile) { 
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
  }, [pathname, useScrollHidingHeader, headerScrollThreshold, isMobile]);


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
  
  const commonNavItems = [
    { href: "/", label: t.home, Icon: Home },
    { href: "/courses/search", label: t.explore, Icon: Compass },
    { href: "/videos", label: t.videos, Icon: BookOpen },
    { href: "/flash-cards", label: t.flashCards, Icon: Layers },
    { href: "/personality-tests", label: t.personalityTest, Icon: Brain }
  ];

  const ThemeToggleButton = React.memo(() => (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={t.toggleTheme}
      className="hover:bg-accent/20 text-foreground w-9 h-9"
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
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
      {authLoading ? (
        <Button variant="ghost" size="sm" disabled className="ml-1 lg:ml-2"><Loader2 className="h-4 w-4 animate-spin mr-1" /> {t.loading}</Button>
      ) : isAuthenticated ? (
        <>
          <span className="text-sm text-muted-foreground hidden lg:inline ml-1 lg:ml-2">{t.welcome}, {user?.name}!</span>
          <Button variant="ghost" size="sm" asChild className={cn(navLinkClasses(getDashboardPath()), "ml-1 lg:ml-2")}>
            <Link href={getDashboardPath()}><LayoutDashboard className="mr-1 h-4 w-4" /> {t.dashboard}</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary ml-1 lg:ml-2"
          >
            <LogOut className="mr-1 h-4 w-4" /> {t.logout}
          </Button>
        </>
      ) : (
        <>
          <Button variant="ghost" size="sm" asChild className={cn(navLinkClasses('/login'), "ml-1 lg:ml-2")}>
            <Link href="/login"><LogIn className="mr-1 h-4 w-4" /> {t.login}</Link>
          </Button>
          <Button variant="default" size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150 ml-1 lg:ml-2">
            <Link href="/register"><UserPlus className="mr-1 h-4 w-4" /> {t.register}</Link>
          </Button>
        </>
      )}
      <div className="ml-1 lg:ml-2">
        <ThemeToggleButton />
      </div>
    </nav>
  );
  
  const MobileHomepageAllLink = () => (
    <Link href="/" className={cn(
        "group text-base font-bold font-headline transition-all py-1",
        "text-black dark:text-white", 
        "underline decoration-primary underline-offset-4 decoration-2"
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
        isMobile ? 'bg-transparent border-transparent' : dynamicHeaderBackgroundClasses,
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
            {/* Logo was here, now this div pushes DesktopNav to the right */}
            <div className="flex-1"></div>
            <DesktopNav />
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

    