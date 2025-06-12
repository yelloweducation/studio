
"use client";
import React, { useState, useEffect } from 'react';
import type { Video } from '@/lib/dbUtils'; 
import VideoCard from '@/components/videos/VideoCard';
import { Loader2 } from 'lucide-react';
import VideoPageHeader from '@/components/layout/VideoPageHeader';
// VideoPageFooter is intentionally removed as per user request for the /videos page.
import { serverGetVideos } from '@/actions/adminDataActions'; 

export default function VideosClient() { 
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(true);

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

  return (
    <div className="h-screen flex flex-col bg-black relative">
      <VideoPageHeader />
      {isLoadingFeedVideos ? (
        <div className="flex-grow flex items-center justify-center pt-14">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : allFeedVideos.length > 0 ? (
        <div className="flex-grow overflow-y-auto snap-y snap-mandatory scrollbar-hide pt-14 pb-2"> {/* Adjusted pb for footer removal */}
          {allFeedVideos.map(video => (
            <div key={video.id} className="h-full w-full snap-center shrink-0 flex items-center justify-center"> {/* Added flex centering */}
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center px-4 text-white pt-14">
          <p className="text-muted-foreground">No videos available at the moment.</p>
        </div>
      )}
      {/* VideoPageFooter removed */}
    </div>
  );
}
    