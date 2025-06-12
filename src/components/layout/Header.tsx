
"use client";
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LuminaLogo from '@/components/LuminaLogo';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Home, LogIn, UserPlus, LayoutDashboard, LogOut, Sun, Moon, Menu, Compass, User as UserIcon, BookOpen, Layers, Brain, Loader2 } from 'lucide-react'; // Ensured Loader2 is here
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
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  useEffect(() => {
    if (typeof window === 'undefined') return;

    const controlHeaderBackground = () => {
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
    setIsSheetOpen(false);
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'student') return '/dashboard/student';
    return '/login'; // Fallback to login if role is somehow null but authenticated
  };
  
  const navLinkClasses = (targetPath: string) => cn(
    "text-sm font-medium text-foreground hover:text-primary transition-colors px-3 py-2 rounded-md",
    pathname === targetPath && "bg-accent text-accent-foreground font-semibold"
  );

  const sheetLinkClasses = (targetPath: string) => cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-accent/50 w-full text-left text-base",
    pathname === targetPath && "bg-accent text-primary font-semibold"
  );

  const commonNavItems = [
    { href: "/", label: t.home, Icon: Home },
    { href: "/courses/search", label: t.explore, Icon: Compass },
    { href: "/videos", label: t.videos, Icon: BookOpen },
    { href: "/flash-cards", label: t.flashCards, Icon: Layers },
    { href: "/personality-tests", label: t.personalityTest, Icon: Brain }
  ];

  const DesktopNav = () => (
    <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
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

  const MobileNavSheet = () => (
    <div className="flex items-center md:hidden">
      {authLoading ? (
         <Button variant="ghost" size="icon" disabled className="mr-1"><Loader2 className="h-5 w-5 animate-spin" /></Button>
      ) : isAuthenticated ? (
        <>
          <Button variant="ghost" size="icon" asChild className="text-foreground hover:text-primary" aria-label={t.dashboard}>
            <Link href={getDashboardPath()}><LayoutDashboard className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-foreground hover:text-primary" aria-label={t.logout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </>
      ) : (
        <Button variant="ghost" size="icon" asChild className="text-foreground hover:text-primary" aria-label={t.login}>
          <Link href="/login"><LogIn className="h-5 w-5" /></Link>
        </Button>
      )}
      <ThemeToggleButton />
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t.openMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center">
              <LuminaLogo />
            </SheetTitle>
          </SheetHeader>
          <div className="flex-grow p-4 space-y-2 overflow-y-auto">
            {commonNavItems.map(item => (
              <SheetClose asChild key={item.label}>
                <Link href={item.href} className={sheetLinkClasses(item.href)} onClick={() => setIsSheetOpen(false)}>
                  <item.Icon className="h-5 w-5" /> {item.label}
                </Link>
              </SheetClose>
            ))}
            <Separator className="my-3"/>
            {isAuthenticated && !authLoading && ( // Show dashboard/logout only if authenticated and not loading
              <>
                <SheetClose asChild>
                  <Link href={getDashboardPath()} className={sheetLinkClasses(getDashboardPath())} onClick={() => setIsSheetOpen(false)}>
                    <LayoutDashboard className="h-5 w-5" /> {t.dashboard}
                  </Link>
                </SheetClose>
                <button onClick={handleLogout} className={sheetLinkClasses("")}>
                  <LogOut className="h-5 w-5" /> {t.logout}
                </button>
              </>
            )}
            {!isAuthenticated && !authLoading && ( // Show login/register only if not authenticated and not loading
              <>
                <SheetClose asChild>
                  <Link href="/login" className={sheetLinkClasses('/login')} onClick={() => setIsSheetOpen(false)}>
                    <LogIn className="h-5 w-5" /> {t.login}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link href="/register" className={sheetLinkClasses('/register')} onClick={() => setIsSheetOpen(false)}>
                    <UserPlus className="h-5 w-5" /> {t.register}
                  </Link>
                </SheetClose>
              </>
            )}
            {authLoading && ( // Show loading in sheet if auth is loading
                 <div className={cn(sheetLinkClasses(""), "text-muted-foreground")}>
                    <Loader2 className="h-5 w-5 animate-spin" /> {t.loading}
                </div>
            )}
          </div>
           <div className="p-4 border-t mt-auto">
            <span className="text-sm text-muted-foreground block mb-1.5">{t.toggleTheme}</span>
            <Button
                variant="outline" 
                size="sm"
                onClick={() => { toggleTheme(); }} 
                className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-accent/50"
              >
                {theme === 'light' ? <Moon className="h-5 w-5 mr-3" /> : <Sun className="h-5 w-5 mr-3" />}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
  
  const ThemeToggleButton = React.memo(() => (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={t.toggleTheme}
      className="hover:bg-accent/20 w-9 h-9 text-foreground"
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  ));
  ThemeToggleButton.displayName = 'ThemeToggleButton';


  return (
    <header className={cn(
        "sticky top-0 z-50 transition-all duration-300 ease-in-out",
        dynamicHeaderBackgroundClasses, 
        {'!-translate-y-full': !headerVisible && useScrollHidingHeader } 
      )}>
      <div className="container mx-auto px-4 py-2.5 flex justify-between items-center min-h-[60px]">
        <LuminaLogo />
        {isMobile ? <MobileNavSheet /> : <DesktopNav />}
      </div>
    </header>
  );
};

export default Header;
    