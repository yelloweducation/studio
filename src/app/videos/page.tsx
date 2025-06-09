
"use client";
import React, { useEffect, useState } from 'react'; // Added useEffect, useState
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import VideoCard from '@/components/videos/VideoCard';
import { videos as mockVideos, type Video } from '@/data/mockData'; // Renamed for clarity
import { ChevronLeft, Video as VideoIcon, Loader2 } from 'lucide-react'; // Added Loader2

export default function VideosPage() {
  const [activeVideos, setActiveVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const storedVideosString = localStorage.getItem('adminVideos');
    let videosToUse = mockVideos;
    if (storedVideosString) {
      try {
        const parsedVideos = JSON.parse(storedVideosString) as Video[];
        if (Array.isArray(parsedVideos)) { // Basic check
          videosToUse = parsedVideos;
        }
      } catch (e) {
        console.error("Failed to parse videos from localStorage on videos page", e);
        // Fallback to mockVideos is already default
      }
    }
    setActiveVideos(videosToUse);
    setIsLoading(false);
  }, []);

  return (
    <div className="w-full flex flex-col items-center h-full">
      <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 px-1 sm:px-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-headline font-semibold flex items-center">
          <VideoIcon className="mr-2 h-5 w-5 sm:h-6 sm:w-6 md:mr-3 md:h-7 md:w-7 text-primary" /> Trending Videos
        </h1>
        <Button variant="outline" asChild className="mt-2 sm:mt-0 self-start sm:self-auto">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
      
      <div 
        className="w-full max-w-md flex-1 overflow-y-auto snap-y snap-mandatory 
                   rounded-lg bg-card shadow-inner scrollbar-hide"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : activeVideos.length > 0 ? (
          activeVideos.map(video => (
            <div key={video.id} className="h-full w-full snap-center shrink-0">
              <VideoCard video={video} />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No videos available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
