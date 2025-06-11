
"use client";
import React, { useState, useEffect } from 'react';
import type { Video } from '@/lib/dbUtils'; 
import VideoCard from '@/components/videos/VideoCard';
import { Loader2 } from 'lucide-react';
import VideoPageHeader from '@/components/layout/VideoPageHeader';
import VideoPageFooter from '@/components/layout/VideoPageFooter'; // Added import
import { getVideosFromDb } from '@/lib/dbUtils'; 

export default function VideosClient() { // Renamed from VideosPage
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingFeedVideos(true);
      const videosFromDb = await getVideosFromDb(); 
      setAllFeedVideos(videosFromDb);
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
        <div className="flex-grow overflow-y-auto snap-y snap-mandatory scrollbar-hide pt-14 pb-14"> {/* Added pb-14 for footer */}
          {allFeedVideos.map(video => (
            <div key={video.id} className="h-full w-full snap-center shrink-0 relative">
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center px-4 text-white pt-14">
          <p className="text-muted-foreground">No videos available at the moment.</p>
        </div>
      )}
      <VideoPageFooter /> {/* Added footer */}
    </div>
  );
}
