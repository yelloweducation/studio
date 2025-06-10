
"use client";
import React, { useState, useEffect } from 'react';
import { videos as mockVideos, type Video } from '@/data/mockData'; 
import VideoCard from '@/components/videos/VideoCard';
import { Loader2 } from 'lucide-react';
import VideoPageFooter from '@/components/layout/VideoPageFooter'; // New Footer

export default function VideosPage() {
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(true);

  useEffect(() => {
    let videosToUse: Video[] = [];
    try {
        const storedVideosString = localStorage.getItem('adminVideos');
        if (storedVideosString) {
            const parsed = JSON.parse(storedVideosString);
            videosToUse = Array.isArray(parsed) ? parsed : mockVideos;
        } else {
            videosToUse = mockVideos;
        }
    } catch (error) {
        console.error("Error loading videos from localStorage for feed:", error);
        videosToUse = mockVideos;
    }
    setAllFeedVideos(videosToUse); 
    setIsLoadingFeedVideos(false);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-black"> {/* Full screen, dark background */}
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
        <div className="flex-grow flex items-center justify-center text-center px-4 text-white">
          <p className="text-muted-foreground">No videos available at the moment.</p>
        </div>
      )}
      <VideoPageFooter /> {/* Custom TikTok-style footer */}
    </div>
  );
}
