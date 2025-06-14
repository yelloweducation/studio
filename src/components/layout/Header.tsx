
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Home as HomeIcon, LogIn, UserPlus, LayoutDashboard, LogOut, Sun, Moon, Compass, Layers, Brain, Loader2, VideoIcon as VideoReelsIcon, Settings as SettingsIcon, UserCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from "@/lib/utils";
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    register: "Register",
    toggleTheme: "Toggle Theme",
    loading: "Loading...",
    menu: "Menu",
    adminDashboard: "Admin Panel",
    myAccount: "My Account",
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
    settings: "ဆက်တင်များ",
    logout: "ထွက်ရန်",
    login: "ဝင်ရန်",
    register: "စာရင်းသွင်းရန်",
    toggleTheme: "အသွင်ပြောင်းရန်",
    loading: "လုပ်ဆောင်နေသည်...",
    menu: "မီနူး",
    adminDashboard: "အက်ဒမင်",
    myAccount: "ကျွန်ုပ်၏အကောင့်",
  }
};

const Header = () => {
  const { isAuthenticated, user, role, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme: contextToggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const t = headerTranslations[language];

  const [dynamicHeaderBackgroundClasses, setDynamicHeaderBackgroundClasses] = useState(
    'bg-transparent border-transparent'
  );
  const [headerVisible, setHeaderVisible] = useState(true);

  const isOnHomepage = pathname === '/';
  const useScrollHidingHeader = isOnHomepage && !isMobile;
  const headerScrollThreshold = 100;

  const toggleTheme = useCallback(() => {
    contextToggleTheme();
  }, [contextToggleTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const controlHeaderBackground = () => {
      if (pathname === '/videos') {
        setDynamicHeaderBackgroundClasses('bg-transparent border-transparent');
      } else if (isMobile) {
        setDynamicHeaderBackgroundClasses('bg-transparent border-transparent');
      } else {
        setDynamicHeaderBackgroundClasses(
          window.scrollY < 50
            ? 'bg-transparent border-transparent'
            : 'bg-background/80 backdrop-blur-md border-b'
        );
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

  if (pathname === '/videos') return null;

  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
  }, [logout, router]);

  const getDashboardPath = useCallback(() => {
    if (!isAuthenticated) return '/login';
    const userRoleLower = role?.toLowerCase();
    if (userRoleLower === 'admin') return '/dashboard/admin';
    if (userRoleLower === 'student') return '/dashboard/student';
    return '/';
  }, [isAuthenticated, role]);

  const UserAvatar = React.memo(({ user: usr }: { user: { name?: string | null, avatarUrl?: string | null } | null }) => (
    <Avatar className="h-8 w-8">
      <AvatarImage src={usr?.avatarUrl || undefined} alt={usr?.name || 'User'} />
      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
        {usr?.name ? usr.name.charAt(0).toUpperCase() : <UserCircle size={20}/>}
      </AvatarFallback>
    </Avatar>
  ));
  UserAvatar.displayName = 'UserAvatar';

  const commonNavItems = [
    { href: "/", label: t.home, Icon: HomeIcon },
    { href: "/courses/search", label: t.explore, Icon: Compass },
    { href: "/videos", label: t.videos, Icon: VideoReelsIcon },
    { href: "/flash-cards", label: t.flashCards, Icon: Layers },
    { href: "/personality-tests", label: t.personalityTest, Icon: Brain }
  ];

  const navLinkClasses = (targetPath: string) => cn(
    "font-medium transition-colors text-sm px-3 py-2 rounded-md",
    pathname === targetPath
      ? "bg-accent text-accent-foreground font-semibold"
      : "text-muted-foreground hover:text-foreground"
  );

  const DesktopNav = () => (
    <>
      <div className="flex items-center"> {/* Container for left "ALL" link */}
        <Link href="/" className="text-xl font-bold font-headline text-foreground hover:text-primary/80 transition-colors group mr-6">
          <span className="relative py-1">
            ALL
            <span className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-primary transition-transform duration-300 ease-out group-hover:scale-x-105"></span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 flex justify-center items-center space-x-1 lg:space-x-2"> {/* Nav items in the center */}
        {commonNavItems.map(item => (
          <Button key={item.label} variant="ghost" size="sm" asChild className={navLinkClasses(item.href)}>
            <Link href={item.href}><item.Icon className="mr-1.5 h-4 w-4" />{item.label}</Link>
          </Button>
        ))}
      </nav>
      <div className="flex items-center space-x-2 lg:space-x-3"> {/* Auth controls on the right */}
        {authLoading ? (
          <Button variant="ghost" size="sm" disabled className="ml-1 lg:ml-2"><Loader2 className="h-4 w-4 animate-spin mr-1" /> {t.loading}</Button>
        ) : isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <UserAvatar user={user} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={getDashboardPath()}><LayoutDashboard className="mr-2 h-4 w-4" /> {t.dashboard}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings"><SettingsIcon className="mr-2 h-4 w-4" /> {t.settings}</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> {t.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t.toggleTheme}
            className={cn("hover:bg-accent/20 text-foreground w-8 h-8")}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
      </div>
    </>
  );

  const MobileHeaderContents = () => {
    const userRole = role?.toLowerCase();

    return (
      <div className="flex items-center justify-between w-full">
        <Link href="/" className="text-lg font-bold text-foreground hover:text-primary/80 transition-colors relative group py-1">
          ALL {/* Hardcoding "ALL" as per request */}
          <span className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-primary transform scale-x-100 transition-transform duration-300 ease-out group-hover:scale-x-105"></span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {authLoading ? (
            <Button variant="ghost" size="icon" disabled className="w-8 h-8">
              <Loader2 className="h-5 w-5 animate-spin text-foreground" />
            </Button>
          ) : isAuthenticated && user ? (
            <>
              {userRole === 'admin' && (
                <Button variant="ghost" size="icon" asChild className="text-foreground hover:text-primary w-8 h-8">
                  <Link href="/dashboard/admin" aria-label={t.adminDashboard}>
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <UserAvatar user={user} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardPath()}><LayoutDashboard className="mr-2 h-4 w-4" /> {t.dashboard}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings"><SettingsIcon className="mr-2 h-4 w-4" /> {t.settings}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> {t.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild className="text-sm text-foreground hover:text-primary px-2 py-1 h-auto">
              <Link href="/login">
                <LogIn className="mr-1 h-4 w-4" /> {t.login}
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t.toggleTheme}
            className="text-foreground hover:text-primary w-8 h-8"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
        dynamicHeaderBackgroundClasses,
        {'!-translate-y-full': !headerVisible && useScrollHidingHeader && !isMobile }
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between min-h-[56px] sm:min-h-[60px] py-2">
        {isMobile ? <MobileHeaderContents /> : <DesktopNav />}
      </div>
    </header>
  );
};

export default Header;
