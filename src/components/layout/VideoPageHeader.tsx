
"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sun, Moon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext'; // Assuming you have this context

const VideoPageHeader = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 sm:px-4 py-2.5 bg-black/30 backdrop-blur-md"
      style={{ height: 'var(--header-height, 56px)' }}
    >
      <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/10">
        <Link href="/" aria-label="Back to Home">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search can be added later if needed */}
        {/* <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Search className="h-5 w-5" />
        </Button> */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="text-white hover:bg-white/10">
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
};

export default VideoPageHeader;
