
"use client";
import { useState, type FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Video as VideoIcon, XCircle, Tv, Loader2, X } from 'lucide-react';
import VideoCard from '@/components/videos/VideoCard';
import { videos as mockVideos, type Video } from '@/data/mockData';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [isLoadingTrendingVideos, setIsLoadingTrendingVideos] = useState(true);

  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(false);

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
    if (allFeedVideos.length > 0 && !showVideoFeed) return; // No need to reload if already loaded and not showing feed

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
  }

  return (
    <div className="flex flex-col items-center pb-8">
      <section className="w-full max-w-2xl text-center mb-12">
        <div className="mb-8 flex justify-center">
          <Image
            src="https://placehold.co/350x350.png"
            alt="Engaged Student Learning - Yellow Institute"
            width={350}
            height={350}
            className="rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
            data-ai-hint="student learning 3d"
            priority
          />
        </div>

        <form onSubmit={handleFormSubmit} className="w-full mb-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search for courses (e.g., Web Development)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm md:text-base pr-10"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={clearSearch}
              >
                <XCircle className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </div>
        </form>

        <div className="flex gap-2 w-full">
          <Button
            type="button"
            onClick={performSearch}
            className="flex-1"
          >
            <Search className="mr-2 h-5 w-5" /> Search Courses
          </Button>
          <Button
            onClick={handleShowVideos}
            variant="default"
            className="flex-1"
          >
            <VideoIcon className="mr-2 h-5 w-5" /> View Reels
          </Button>
        </div>
      </section>

      <section className="w-full max-w-4xl mt-12 md:mt-16">
        <h2 className="text-2xl md:text-3xl font-headline font-semibold mb-6 flex items-center">
          <Tv className="mr-3 h-7 w-7 text-primary" /> Trending Videos
        </h2>
        {isLoadingTrendingVideos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-muted rounded-lg animate-pulse flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ))}
          </div>
        ) : trendingVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingVideos.map(video => (
              <div key={video.id} className="aspect-[9/16] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <VideoCard video={video} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No trending videos available right now.</p>
        )}
      </section>
    </div>
  );
}
