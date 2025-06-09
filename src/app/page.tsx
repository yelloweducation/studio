
"use client";
import React, { useState, type FormEvent, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Video as VideoIcon, XCircle, Tv, Loader2, X, Shapes } from 'lucide-react';
import VideoCard from '@/components/videos/VideoCard';
import { videos as mockVideos, type Video, categories as mockCategories, type Category } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter
import { Skeleton } from '@/components/ui/skeleton';
import CategoryCard from '@/components/categories/CategoryCard';

// Lazy load CareerAdviceChatbox
const CareerAdviceChatbox = lazy(() => import('@/components/ai/CareerAdviceChatbox'));


export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  const [courseCategories, setCourseCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [isLoadingTrendingVideos, setIsLoadingTrendingVideos] = useState(true);

  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(false);


  useEffect(() => {
    // Load course categories
    setIsLoadingCategories(true);
    const storedCategoriesString = localStorage.getItem('adminCategories');
    if (storedCategoriesString) {
      try {
        const parsedCategories = JSON.parse(storedCategoriesString) as Category[];
        setCourseCategories(parsedCategories.length > 0 ? parsedCategories : mockCategories);
      } catch (e) {
        console.error("Failed to parse categories from localStorage", e);
        setCourseCategories(mockCategories);
      }
    } else {
      setCourseCategories(mockCategories);
    }
    setIsLoadingCategories(false);

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
      <section className="w-full max-w-2xl text-center pt-8 mb-10">
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

      <section className="w-full max-w-2xl mb-12">
        <Suspense fallback={
            <Card className="w-full max-w-2xl mx-auto shadow-xl">
                <CardHeader className="pb-4">
                    <Skeleton className="h-7 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        }>
          <CareerAdviceChatbox />
        </Suspense>
      </section>

      <section className="w-full max-w-5xl mt-8 mb-12">
        <h2 className="text-2xl sm:text-3xl font-headline font-semibold flex items-center mb-6 text-center sm:text-left justify-center sm:justify-start">
          <Shapes className="mr-2 h-7 w-7 text-primary" /> Explore Categories
        </h2>
        {isLoadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="shadow-lg rounded-lg">
                <Skeleton className="h-24 w-full rounded-t-lg" />
                <CardContent className="pt-3 pb-3 text-center">
                  <Skeleton className="h-5 w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courseCategories.length > 0 ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {courseCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <Card className="w-full">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No course categories available at the moment. Admins can add them!</p>
            </CardContent>
          </Card>
        )}
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
