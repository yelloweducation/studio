
"use client";
import React, { useState, type FormEvent, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video as VideoIcon, Search, Compass, Circle } from 'lucide-react'; 
// Removed Tv, Loader2, X from lucide-react as they are no longer used directly here
// Removed VideoCard and mockVideos as video feed is now on /videos page
import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <div className="flex flex-col items-center pb-8">
      <section className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl text-center pt-8 mb-10">
        <div className="flex items-center justify-center space-x-2 lg:space-x-3 text-3xl sm:text-4xl lg:text-5xl font-bold font-headline text-foreground mb-4">
          <Circle size={32} className="text-primary block lg:hidden" /> 
          <Circle size={40} className="text-primary hidden lg:block" /> 
          <span>Yellow Institute</span>
        </div>
        <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground mb-8">
          Your journey to knowledge and career insights.
        </p>
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto">
          <Input
            type="search"
            placeholder="Search courses, e.g., Web Development"
            className="flex-grow rounded-r-none focus:z-10 shadow-sm text-sm sm:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" className="rounded-l-none">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </form>
        
        <div className="mt-8 flex flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto">
            <Button asChild size="lg" variant="default" className="flex-1 sm:flex-none sm:w-auto">
                <Link href="/courses/search">
                    <Compass className="mr-2 h-5 w-5" /> Courses
                </Link>
            </Button>
            <Button 
              asChild // Changed to asChild to navigate with Link
              size="lg" 
              variant="accent"
              className="flex-1 sm:flex-none sm:w-auto">
                <Link href="/videos"> {/* Navigate to /videos */}
                    <VideoIcon className="mr-2 h-5 w-5" /> Reels
                </Link>
            </Button>
        </div>
      </section>

      {/* New Footer Links Section */}
      <section className="w-full max-w-4xl text-center mt-12 mb-4">
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Link href="/privacy-policy" className="hover:text-primary hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-primary hover:underline">
            Terms of Service
          </Link>
          <Link href="/about" className="hover:text-primary hover:underline">
            About Us
          </Link>
          <span>
            Dark Theme: {theme === 'dark' ? 'On' : 'Off'}
          </span>
        </div>
      </section>
    </div>
  );
}
