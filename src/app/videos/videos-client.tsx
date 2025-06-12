
"use client";
import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import type { Video } from '@/lib/dbUtils'; 
import VideoCard from '@/components/videos/VideoCard';
import { Loader2 } from 'lucide-react';
import VideoPageHeader from '@/components/layout/VideoPageHeader';
import { serverGetVideos } from '@/actions/adminDataActions'; 

export default function VideosClient() { 
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingFeedVideos(true);
      try {
        const videosFromDb = await serverGetVideos(); 
        setAllFeedVideos(videosFromDb);
      } catch (error) {
        console.error("Error fetching videos for feed:", error);
        setAllFeedVideos([]); 
      }
      setIsLoadingFeedVideos(false);
    };
    fetchVideos();
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop } = scrollContainerRef.current;
      setIsScrolled(scrollTop > 10); // Set to true if scrolled more than 10px
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black relative">
      <VideoPageHeader isScrolled={isScrolled} />
      {isLoadingFeedVideos ? (
        <div className="flex-grow flex items-center justify-center pt-14">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : allFeedVideos.length > 0 ? (
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-grow overflow-y-auto snap-y snap-mandatory scrollbar-hide pt-14 pb-2"
        >
          {allFeedVideos.map(video => (
            <div key={video.id} className="h-full w-full snap-center shrink-0 flex items-center justify-center">
              <VideoCard video={video} />
            </div>
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
