
"use client";
import React, { useState, useEffect, useRef } from 'react'; 
import type { Video } from '@/lib/dbUtils'; 
import VideoCard from '@/components/videos/VideoCard';
import { Loader2 } from 'lucide-react';
import VideoPageHeader from '@/components/layout/VideoPageHeader';
import { serverGetVideos } from '@/actions/adminDataActions'; 
import VideoPageFooter from '@/components/layout/VideoPageFooter'; // Import the footer

export default function VideosClient() { 
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(true);
  // isScrolled state and handleScroll removed as header is always transparent and doesn't change based on scroll.
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

  return (
    <div className="h-screen flex flex-col bg-black relative">
      <VideoPageHeader />
      {isLoadingFeedVideos ? (
        <div className="flex-grow flex items-center justify-center pt-14"> {/* Ensure content starts below header */}
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : allFeedVideos.length > 0 ? (
        <div 
          ref={scrollContainerRef}
          // onScroll={handleScroll} // Removed as isScrolled is not used by VideoPageHeader anymore
          className="flex-grow overflow-y-auto snap-y snap-mandatory scrollbar-hide pt-14 pb-[calc(theme(space.14)+env(safe-area-inset-bottom))]" // Added padding top for header and padding bottom for footer
        >
          {allFeedVideos.map(video => (
            // This div is the snap item, it should remain h-full of the scroll container
            <div key={video.id} className="h-full w-full snap-center shrink-0 flex items-center justify-center px-2 py-2"> {/* Added some padding */}
              <VideoCard video={video} /> {/* VideoCard will control its own max-height */}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center px-4 text-white pt-14"> {/* Ensure content starts below header */}
          <p className="text-muted-foreground">No videos available at the moment.</p>
        </div>
      )}
      <VideoPageFooter /> {/* Add the footer */}
    </div>
  );
}
