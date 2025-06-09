
"use client";
import React, { useState, type FormEvent, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Video as VideoIcon, Tv, Loader2, X } from 'lucide-react';
import VideoCard from '@/components/videos/VideoCard';
import { videos as mockVideos, type Video } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; 
import { Skeleton } from '@/components/ui/skeleton';

const CareerAdviceChatbox = lazy(() => import('@/components/ai/CareerAdviceChatbox'));


export default function Home() {
  const router = useRouter();
  
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [isLoadingTrendingVideos, setIsLoadingTrendingVideos] = useState(true);

  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(false);


  useEffect(() => {
    // Load trending videos directly from mock data
    setIsLoadingTrendingVideos(true);
    setTrendingVideos(mockVideos.slice(0, 3));
    setIsLoadingTrendingVideos(false);
  }, []);

  const loadAllFeedVideos = () => {
    if (allFeedVideos.length > 0 && !showVideoFeed) return; 

    setIsLoadingFeedVideos(true);
    // Load all videos directly from mock data for the feed
    setAllFeedVideos(mockVideos);
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
              <p className="text-muted-foreground">No videos available at the moment.</p>
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
          Welcome to Yellow Institute
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-8">
          Your journey to knowledge and career insights.
        </p>
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
