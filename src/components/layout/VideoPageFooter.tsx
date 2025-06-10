
"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, VideoIcon, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const VideoPageFooter = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();

  const getProfilePath = () => {
    if (!isAuthenticated) return '/login';
    return role === 'admin' ? '/dashboard/admin' : '/dashboard/student';
  };

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/courses/search', icon: Search, label: 'Explore' },
    { href: '/videos', icon: VideoIcon, label: 'Reels' },
    { href: '#', icon: Bell, label: 'Notifications', disabled: true }, // Placeholder
    { href: getProfilePath(), icon: UserIcon, label: 'Profile' },
  ];

  return (
    <footer className="w-full bg-background/80 backdrop-blur-sm border-t border-border text-foreground shrink-0">
      <nav className="flex justify-around items-center h-14 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.disabled ? '#' : item.href} passHref legacyBehavior>
              <a
                className={cn(
                  "flex flex-col items-center justify-center text-xs w-1/5 h-full transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  item.disabled && "opacity-50 cursor-not-allowed hover:text-muted-foreground"
                )}
                aria-disabled={item.disabled}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                }}
              >
                <item.icon className={cn("h-6 w-6 mb-0.5", isActive && "fill-current")} />
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default VideoPageFooter;
