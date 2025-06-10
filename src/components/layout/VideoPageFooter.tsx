
"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, VideoIcon, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage, type Language } from '@/contexts/LanguageContext'; // Added

const videoFooterTranslations = {
  en: {
    home: "Home",
    explore: "Explore",
    reels: "Reels",
    notifications: "Notifications",
    profile: "Profile"
  },
  my: {
    home: "ပင်မ", // Home
    explore: "ရှာဖွေရန်", // Explore
    reels: "ဗီဒီယို", // Reels (Video)
    notifications: "နိုတီ", // Notifications
    profile: "ပရိုဖိုင်" // Profile
  }
};


const VideoPageFooter = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();
  const { language } = useLanguage(); // Added
  const t = videoFooterTranslations[language]; // Added

  const getProfilePath = () => {
    if (!isAuthenticated) return '/login';
    return role === 'admin' ? '/dashboard/admin' : '/dashboard/student';
  };

  const navItems = [
    { href: '/', icon: Home, labelKey: 'home' as keyof typeof t },
    { href: '/courses/search', icon: Search, labelKey: 'explore' as keyof typeof t },
    { href: '/videos', icon: VideoIcon, labelKey: 'reels' as keyof typeof t },
    { href: '#', icon: Bell, labelKey: 'notifications' as keyof typeof t, disabled: true }, 
    { href: getProfilePath(), icon: UserIcon, labelKey: 'profile' as keyof typeof t },
  ];

  return (
    <footer className="w-full bg-background/80 backdrop-blur-sm border-t border-border text-foreground shrink-0">
      <nav
        className={cn(
          "flex justify-around items-center h-14 px-2",
          "pb-[env(safe-area-inset-bottom)]" 
        )}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const label = t[item.labelKey];
          return (
            <Link
              key={label}
              href={item.disabled ? '#' : item.href}
              className={cn(
                "flex flex-col items-center justify-center text-xs w-1/5 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                item.disabled && "opacity-50 cursor-not-allowed hover:text-muted-foreground"
              )}
              aria-disabled={item.disabled}
              onClick={(e) => {
                if (item.disabled) {
                  e.preventDefault();
                }
              }}
            >
              <item.icon className={cn("h-6 w-6 mb-0.5", isActive && "fill-current")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default VideoPageFooter;
