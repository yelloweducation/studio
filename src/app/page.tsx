
"use client";
import React, { useState, type FormEvent, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video as VideoIcon, Tv, Loader2, X, Search, LayoutGrid, Circle, Compass } from 'lucide-react'; 
import VideoCard from '@/components/videos/VideoCard';
import { videos as mockVideos, type Video } from '@/data/mockData'; 
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/contexts/ThemeContext'; // Added for theme status

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(false);
  const { theme } = useTheme(); // Get theme status

  useEffect(() => {
    // Initial data loading for videos (if any were to be displayed directly, now only for feed)
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const loadAllFeedVideos = () => {
    if (allFeedVideos.length > 0 && !showVideoFeed) return; 

    setIsLoadingFeedVideos(true);
    let videosToUse: Video[] = [];
    try {
        const storedVideosString = localStorage.getItem('adminVideos');
        if (storedVideosString) {
            const parsed = JSON.parse(storedVideosString);
            videosToUse = Array.isArray(parsed) ? parsed : mockVideos;
        } else {
            videosToUse = mockVideos;
        }
    } catch (error) {
        console.error("Error loading videos from localStorage for feed:", error);
        videosToUse = mockVideos;
    }
    setAllFeedVideos(videosToUse); 
    setIsLoadingFeedVideos(false);
  };

  const handleShowVideos = () => {
    if (allFeedVideos.length === 0) {
      loadAllFeedVideos();
    }
    setShowVideoFeed(true);
  };

  const handleCloseVideoFeed = () => {
    setShowVideoFeed(false);
  };

  if (showVideoFeed) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-0 sm:p-4">
        <Card className="w-full max-w-md h-full sm:h-[calc(100vh-4rem)] sm:rounded-lg shadow-2xl flex flex-col">
          <div className="p-3 border-b flex justify-between items-center shrink-0">
            <h2 className="text-lg font-semibold font-headline flex items-center">
              For You
              <Circle className="ml-2 h-4 w-4 text-primary fill-current" />
            </h2>
            <Button variant="ghost" size="icon" onClick={handleCloseVideoFeed} aria-label="Close video feed">
              <X className="h-5 w-5" />
            </Button>
          </div>
          {isLoadingFeedVideos ? (
            <div className="flex-grow flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : allFeedVideos.length > 0 ? (
            <div className="flex-grow overflow-y-auto snap-y snap-mandatory scrollbar-hide">
              {allFeedVideos.map(video => (
                <div key={video.id} className="h-full w-full snap-center shrink-0 relative">
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center px-4">
              <p className="text-muted-foreground">No videos available at the moment.</p>
            </div>
          )}
        </Card>
      </div>
    );
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
              onClick={handleShowVideos} 
              size="lg" 
              variant="accent"
              className="flex-1 sm:flex-none sm:w-auto">
                <VideoIcon className="mr-2 h-5 w-5" /> Reels
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
