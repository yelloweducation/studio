
"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Home as HomeIcon, LogIn, UserPlus, LayoutDashboard, LogOut, Sun, Moon, Compass, Layers, Brain, Loader2, Menu as MenuIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import React, { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const headerTranslations = {
  en: {
    home: "Home",
    all: "ALL",
    explore: "Explore Courses",
    exploreLearning: "Explore Learning",
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
    menu: "Menu",
    adminDashboard: "Admin Panel" // Added for admin specific link
  },
  my: {
    home: "ပင်မ",
    all: "အားလုံး",
    explore: "သင်တန်းများ",
    exploreLearning: "သင်ယူမှုများ ရှာဖွေရန်",
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
    menu: "မီနူး",
    adminDashboard: "အက်ဒမင်"
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
  const isOnCoursesPage = pathname === '/courses/search';
  const isOnFlashCardsPage = pathname === '/flash-cards';
  const isOnPersonalityTestsPage = pathname === '/personality-tests';

  const useScrollHidingHeader = isOnHomepage && !isMobile;
  const headerScrollThreshold = 100;

  const [dynamicHeaderBackgroundClasses, setDynamicHeaderBackgroundClasses] = useState('bg-transparent border-transparent');
  const [headerVisible, setHeaderVisible] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const controlHeaderBackground = () => {
      if (pathname === '/videos') {
        setDynamicHeaderBackgroundClasses('bg-transparent border-transparent');
      } else if (isMobile) {
        setDynamicHeaderBackgroundClasses('bg-transparent border-transparent');
      } else {
        setDynamicHeaderBackgroundClasses(window.scrollY < 50 ? 'bg-transparent border-transparent' : 'bg-background/80 backdrop-blur-md border-b');
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
    setMobileSheetOpen(false);
    router.push('/');
  };

  const getDashboardPath = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'student') return '/dashboard/student';
    console.warn(`[Header] Dashboard link: User is authenticated, but role is '${role}'. Defaulting dashboard path to home ('/').`);
    return '/';
  };

  const navLinkClasses = (targetPath: string, isMobileSheetLink: boolean = false) => cn(
    "font-medium transition-colors",
    isMobileSheetLink
      ? "block w-full text-left px-3 py-2.5 rounded-md text-base"
      : "text-sm px-3 py-2 rounded-md",
    pathname === targetPath
      ? (isMobileSheetLink ? "bg-accent text-accent-foreground font-semibold" : "bg-accent text-accent-foreground font-semibold")
      : (isMobileSheetLink ? "text-foreground hover:bg-muted" : "text-foreground hover:text-primary")
  );

  const commonNavItems = [
    { href: "/", label: t.home, Icon: HomeIcon },
    { href: "/courses/search", label: t.explore, Icon: Compass },
    { href: "/videos", label: t.videos, Icon: HomeIcon }, // VideoIcon was used, HomeIcon for consistency with mobile potentially
    { href: "/flash-cards", label: t.flashCards, Icon: Layers },
    { href: "/personality-tests", label: t.personalityTest, Icon: Brain }
  ];

  const ThemeToggleButton = React.memo(({ isSheetButton = false }: {isSheetButton?: boolean}) => (
    <Button
      variant="ghost"
      size={isSheetButton ? "default" : "icon"}
      onClick={() => {
        toggleTheme();
        if (isSheetButton) setMobileSheetOpen(false);
      }}
      aria-label={t.toggleTheme}
      className={cn(
        "hover:bg-accent/20 text-foreground",
        isSheetButton ? "w-full justify-start text-base py-2.5 px-3 gap-2" : "w-8 h-8"
      )}
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      {isSheetButton && <span>{theme === 'light' ? "Dark Mode" : "Light Mode"}</span>}
    </Button>
  ));
  ThemeToggleButton.displayName = 'ThemeToggleButton';

  const MobileHomepageAllLink = () => (
    <Link
      href="/"
      className={cn(
        "group font-headline transition-all py-1 flex items-center gap-1",
        "text-black dark:text-white",
        "underline decoration-primary underline-offset-4 decoration-2",
        "text-sm",
        "hover:opacity-80"
      )}
      onClick={() => setMobileSheetOpen(false)}
      style={{ textShadow: '1px 1px 2px hsl(var(--primary-darker))' }}
    >
      <HomeIcon className="h-4 w-4 text-primary group-hover:text-accent transition-colors" />
      {t.all}
    </Link>
  );

  const MobileLeftContent = () => {
    if (authLoading) {
        return <div className="w-8 h-8 flex items-center justify-center shrink-0"><Loader2 className="h-4 w-4 animate-spin" /></div>;
    }

    if (isOnHomepage) {
      if (isAuthenticated && role === 'admin') {
        return (
          <Link
            href="/dashboard/admin"
            className={cn(
              "group font-headline transition-all py-1 flex items-center gap-1.5", // Increased gap
              "text-foreground",
              "text-sm font-medium", // Make it stand out slightly more
              "hover:text-primary"
            )}
            onClick={() => setMobileSheetOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4 text-accent group-hover:text-primary transition-colors" />
            {t.adminDashboard}
          </Link>
        );
      } else {
        return <MobileHomepageAllLink />;
      }
    } else if (isOnFlashCardsPage || isOnPersonalityTestsPage || isOnCoursesPage) {
      return <MobileHomepageAllLink />;
    }
    return <div className="flex-1"></div>; // Empty for pages that will show hamburger
  };
  
  const shouldShowHamburgerMenu = !isOnHomepage && !isOnFlashCardsPage && !isOnPersonalityTestsPage && !isOnCoursesPage;


  const DesktopNav = () => (
    <>
      <div className="flex-1">
         {/* Potentially a logo or brand name here if desired */}
      </div>
      <nav className="mx-auto flex justify-center items-center space-x-1 lg:space-x-2">
        {commonNavItems.map(item => (
          <Button key={item.label} variant="ghost" size="sm" asChild className={navLinkClasses(item.href)}>
            <Link href={item.href}><item.Icon className="mr-1.5 h-4 w-4" />{item.label}</Link>
          </Button>
        ))}
      </nav>
      <div className="flex items-center space-x-1 lg:space-x-2 flex-1 justify-end">
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
              className="border-primary/50 text-primary hover:bg-primary/10 hover:text-accent-foreground ml-1 lg:ml-2"
            >
              <LogOut className="mr-1 h-4 w-4" /> {t.logout}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild className={cn(navLinkClasses('/login'), "ml-1 lg:ml-2")}>
              <Link href="/login" className="text-foreground hover:text-accent-foreground">
                <LogIn className="mr-1 h-4 w-4" /> {t.login}
              </Link>
            </Button>
            <Button variant="default" size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150 ml-1 lg:ml-2">
              <Link href="/register"><UserPlus className="mr-1 h-4 w-4" /> {t.register}</Link>
            </Button>
          </>
        )}
        <div className="ml-1 lg:ml-2">
          <ThemeToggleButton />
        </div>
      </div>
    </>
  );

  const MobileNav = () => (
    <div className="flex items-center justify-between w-full">
      <div className="flex-shrink-0 min-w-[60px]"> {/* Ensure left content has some space */}
        <MobileLeftContent />
      </div>

      <div className="flex items-center gap-1">
        {authLoading ? (
           <Button variant="ghost" size="icon" disabled className="w-8 h-8"><Loader2 className="h-5 w-5 animate-spin" /></Button>
        ) : isAuthenticated ? (
          <>
            <Button variant="ghost" size="icon" asChild className="w-8 h-8 hover:text-primary">
                <Link href={getDashboardPath()}><LayoutDashboard className="h-5 w-5" /></Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="border-primary/50 text-primary hover:bg-primary/10 hover:text-accent-foreground w-8 h-8"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" asChild className="w-8 h-8">
            <Link href="/login" className="text-foreground hover:text-accent-foreground">
                <LogIn className="h-5 w-5" />
            </Link>
          </Button>
        )}
        <ThemeToggleButton />
        {shouldShowHamburgerMenu && (
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary w-8 h-8" aria-label={t.menu}>
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-4 flex flex-col">
               <SheetHeader className="mb-4">
                <SheetTitle className="sr-only">{t.menu}</SheetTitle>
              </SheetHeader>
              <nav className="flex-grow space-y-1.5">
                {commonNavItems.map(item => (
                  <Button key={item.label} variant="ghost" asChild className={navLinkClasses(item.href, true)} onClick={() => setMobileSheetOpen(false)}>
                    <Link href={item.href}><item.Icon className="mr-2 h-5 w-5" />{item.label}</Link>
                  </Button>
                ))}
                <hr className="my-2 border-border"/>
                {authLoading ? (
                   <Button variant="ghost" disabled className={cn(navLinkClasses('', true), "opacity-50")}>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t.loading}
                   </Button>
                ) : isAuthenticated ? (
                  <>
                    <Button variant="ghost" asChild className={navLinkClasses(getDashboardPath(), true)} onClick={() => setMobileSheetOpen(false)}>
                      <Link href={getDashboardPath()}><LayoutDashboard className="mr-2 h-5 w-5" /> {t.dashboard}</Link>
                    </Button>
                    <Button variant="ghost" onClick={handleLogout} className={cn(navLinkClasses('', true), "text-destructive hover:text-destructive")}>
                      <LogOut className="mr-2 h-5 w-5" /> {t.logout}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className={navLinkClasses('/login', true)} onClick={() => setMobileSheetOpen(false)}>
                      <Link href="/login" className="text-foreground hover:text-accent-foreground">
                        <LogIn className="mr-2 h-5 w-5" /> {t.login}
                      </Link>
                    </Button>
                    <Button variant="default" asChild className={cn(navLinkClasses('/register', true), "bg-primary text-primary-foreground hover:bg-primary/90")} onClick={() => setMobileSheetOpen(false)}>
                      <Link href="/register"><UserPlus className="mr-2 h-5 w-5" /> {t.register}</Link>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );

  return (
    <header className={cn(
        "sticky top-0 z-50 transition-all duration-300 ease-in-out",
        isMobile ? 'bg-transparent border-transparent' : dynamicHeaderBackgroundClasses,
        {'!-translate-y-full': !headerVisible && useScrollHidingHeader && !isMobile }
      )}>
      <div className="container mx-auto px-4 py-2.5 flex justify-between items-center min-h-[60px]">
        {isMobile ? <MobileNav /> : <DesktopNav /> }
      </div>
    </header>
  );
};

export default Header;
