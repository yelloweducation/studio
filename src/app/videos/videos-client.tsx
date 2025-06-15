
"use client";
import React, { useState, useEffect, useRef } from 'react';
import type { Video } from '@/lib/dbUtils';
import VideoCard from '@/components/videos/VideoCard';
import { Loader2, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import VideoPageHeader from '@/components/layout/VideoPageHeader';
import { serverGetVideos } from '@/actions/adminDataActions';

export default function VideosClient() {
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(true);
  const [errorLoadingVideos, setErrorLoadingVideos] = useState<string | null>(null); // New error state
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingFeedVideos(true);
      setErrorLoadingVideos(null); // Reset error state
      try {
        const videosFromDb = await serverGetVideos();
        setAllFeedVideos(videosFromDb);
      } catch (error) {
        console.error("Error fetching videos for feed:", error);
        setErrorLoadingVideos("Failed to load videos. Please try again later.");
        setAllFeedVideos([]);
      }
      setIsLoadingFeedVideos(false);
    };
    fetchVideos();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-black relative">
      <VideoPageHeader />
      {isLoadingFeedVideos ? (
        <div className="flex-grow flex items-center justify-center pt-14">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : errorLoadingVideos ? ( // Handle error state
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 text-white pt-14">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg font-semibold">Error Loading Videos</p>
          <p className="text-muted-foreground">{errorLoadingVideos}</p>
        </div>
      ) : allFeedVideos.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="flex-grow overflow-y-auto snap-y snap-mandatory scrollbar-hide pt-14 pb-[env(safe-area-inset-bottom)]"
        >
          {allFeedVideos.map(video => (
            // Ensure video object is valid before passing
            video && video.id && video.embedUrl ? (
              <div key={video.id} className="h-full w-full snap-center shrink-0 flex items-center justify-center px-2 py-2">
                <VideoCard video={video} />
              </div>
            ) : null
          ))}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center px-4 text-white pt-14">
          <p className="text-muted-foreground">No videos available at the moment.</p>
        </div>
      )}
    </div>
  );
}
