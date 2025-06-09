
"use client";
import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import NextImage from 'next/image'; // Removed as hero image is removed
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Video as VideoIcon, XCircle, Tv, Loader2, X } from 'lucide-react';
import VideoCard from '@/components/videos/VideoCard';
import { videos as mockVideos, type Video } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Removed HERO_IMAGE_STORAGE_KEY, DEFAULT_HERO_IMAGE_URL, DEFAULT_HERO_AI_HINT
// Removed HeroImageData type

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [isLoadingTrendingVideos, setIsLoadingTrendingVideos] = useState(true);

  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(false);

  // Removed heroImageDetails state and its useEffect

  useEffect(() => {
    // Load trending videos
    setIsLoadingTrendingVideos(true);
    let videosToDisplay: Video[] = [];
    const storedVideosString = localStorage.getItem('adminVideos');

    if (storedVideosString !== null) {
      try {
        const parsedVideos = JSON.parse(storedVideosString) as Video[];
        if (Array.isArray(parsedVideos)) {
          videosToDisplay = parsedVideos;
        } else {
          videosToDisplay = mockVideos;
        }
      } catch (e) {
        videosToDisplay = mockVideos;
      }
    } else {
      videosToDisplay = mockVideos;
    }
    setTrendingVideos(videosToDisplay.slice(0, 3));
    setIsLoadingTrendingVideos(false);
  }, []);

  const loadAllFeedVideos = () => {
    if (allFeedVideos.length > 0 && !showVideoFeed) return; 

    setIsLoadingFeedVideos(true);
    const storedVideosString = localStorage.getItem('adminVideos');
    let videosToUse: Video[] = [];

    if (storedVideosString !== null) {
      try {
        const parsedVideos = JSON.parse(storedVideosString) as Video[];
        if (Array.isArray(parsedVideos)) {
          videosToUse = parsedVideos;
        } else {
          console.error("Stored 'adminVideos' in localStorage is not an array for full feed. Using mock videos.", parsedVideos);
          videosToUse = mockVideos;
        }
      } catch (e) {
        console.error("Failed to parse 'adminVideos' from localStorage for full feed. Using mock videos.", e);
        videosToUse = mockVideos;
      }
    } else {
      videosToUse = mockVideos;
    }
    setAllFeedVideos(videosToUse);
    setIsLoadingFeedVideos(false);
  };

  const performSearch = () => {
    if (!searchQuery.trim()) {
      router.push(`/courses/search`);
      return;
    }
    router.push(`/courses/search?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    performSearch();
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

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (showVideoFeed) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-0 sm:p-4">
        <Card className="w-full max-w-md h-full sm:h-[calc(100vh-4rem)] sm:rounded-lg shadow-2xl flex flex-col">
          <div className="p-3 border-b flex justify-between items-center shrink-0">
            <h2 className="text-lg font-semibold font-headline">Video Feed</h2>
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
              <p className="text-muted-foreground">No videos available at the moment. <br /> Admins can add videos in the dashboard.</p>
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center pb-8">
      <section className="w-full max-w-2xl text-center mb-12 pt-8"> {/* Added pt-8 for spacing if needed */}
        {/* Hero Image section removed */}
        <h1 className="text-4xl sm:text-5xl font-headline font-bold mb-4 text-foreground">
          Discover Your Next Passion
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8">
          Explore a world of knowledge with Yellow Institute.
        </p>
        <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search for courses (e.g., Web Development, Data Science)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 sm:pr-10 py-3 text-base rounded-full shadow-md focus:ring-primary focus:border-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-12 sm:right-10 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted/50"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
            <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 sm:hidden">
              <Search className="h-5 w-5" />
            </Button>
          </div>
          <Button type="submit" className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-sm active:translate-y-px transition-all duration-150">
            <Search className="mr-2 h-5 w-5" /> Search
          </Button>
        </form>
      </section>

      <section className="w-full mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-headline font-semibold flex items-center">
            <Tv className="mr-2 h-7 w-7 text-primary" /> Trending Videos
          </h2>
          <Button variant="outline" onClick={handleShowVideos} className="hover:border-accent hover:text-accent">
            <VideoIcon className="mr-2 h-5 w-5" /> View Reels
          </Button>
        </div>
        {isLoadingTrendingVideos ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full aspect-[9/16]" />
                <div className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : trendingVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
            {trendingVideos.map(video => (
              <div key={video.id} className="w-full aspect-[9/16] rounded-lg overflow-hidden shadow-lg">
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        ) : (
          !showVideoFeed && ( 
            <Card className="w-full max-w-2xl mt-8">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No trending videos available at the moment.</p>
              </CardContent>
            </Card>
          )
        )}
      </section>
    </div>
  );
}
