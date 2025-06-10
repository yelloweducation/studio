
"use client";
import React, { useState, useEffect } from 'react';
import { videos as mockVideos, type Video } from '@/data/mockData'; 
import VideoCard from '@/components/videos/VideoCard';
import { Loader2 } from 'lucide-react';
import VideoPageHeader from '@/components/layout/VideoPageHeader'; // New Header

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
    <div className="h-screen flex flex-col bg-black relative"> {/* Full screen, dark background */}
      <VideoPageHeader />
      {isLoadingFeedVideos ? (
        <div className="flex-grow flex items-center justify-center pt-14"> {/* pt-14 to account for header */}
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : allFeedVideos.length > 0 ? (
        <div className="flex-grow overflow-y-auto snap-y snap-mandatory scrollbar-hide pt-14"> {/* pt-14 to ensure content starts below fixed header */}
          {allFeedVideos.map(video => (
            <div key={video.id} className="h-full w-full snap-center shrink-0 relative">
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center px-4 text-white pt-14"> {/* pt-14 here too */}
          <p className="text-muted-foreground">No videos available at the moment.</p>
        </div>
      )}
      {/* VideoPageFooter removed from here */}
    </div>
  );
}
