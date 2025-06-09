
"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import VideoCard from '@/components/videos/VideoCard';
import { videos as mockVideos, type Video } from '@/data/mockData';
import { ChevronLeft, Video as VideoIcon, Loader2 } from 'lucide-react';

export default function VideosPage() {
  const [activeVideos, setActiveVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const storedVideosString = localStorage.getItem('adminVideos');
    
    if (storedVideosString !== null) { // Check if the key exists in localStorage
      try {
        const parsedVideos = JSON.parse(storedVideosString) as Video[];
        if (Array.isArray(parsedVideos)) {
          // If localStorage has 'adminVideos' and it's a valid array (even empty), use it.
          setActiveVideos(parsedVideos);
        } else {
          // Data in localStorage under 'adminVideos' was not an array.
          // This is unexpected, so log and use mock videos as a fallback.
          console.error("Stored 'adminVideos' in localStorage is not an array. Using mock videos.", parsedVideos);
          setActiveVideos(mockVideos);
        }
      } catch (e) {
        // Parsing failed. Log error and use mock videos as a fallback.
        console.error("Failed to parse 'adminVideos' from localStorage. Using mock videos.", e);
        setActiveVideos(mockVideos);
      }
    } else {
      // No 'adminVideos' key in localStorage. Use mock videos.
      setActiveVideos(mockVideos);
    }
    
    setIsLoading(false);
  }, []); // Empty dependency array ensures this runs once on mount

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
        // Set a specific height or ensure parent provides enough height for scrolling
        // For example, style={{ height: 'calc(100vh - 200px)' }} if header/footer are fixed height
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
          <div className="flex items-center justify-center h-full text-center px-4">
            <p className="text-muted-foreground">No videos available at the moment. <br/> Admins can add videos in the dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
