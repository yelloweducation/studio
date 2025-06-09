
"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import VideoCard from '@/components/videos/VideoCard';
import { videos as allVideos } from '@/data/mockData';
import { ChevronLeft, Video as VideoIcon } from 'lucide-react';

export default function VideosPage() {
  return (
    <div className="w-full flex flex-col items-center h-full">
      <div className="w-full max-w-4xl flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 px-1 sm:px-0">
        <h1 className="text-2xl md:text-3xl font-headline font-semibold flex items-center">
          <VideoIcon className="mr-2 h-6 w-6 md:mr-3 md:h-7 md:w-7 text-primary" /> Trending Videos
        </h1>
        <Button variant="outline" asChild className="mt-2 sm:mt-0 self-start sm:self-auto">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
      
      <div 
        className="w-full max-w-md flex-grow overflow-y-auto snap-y snap-mandatory 
                   rounded-lg bg-card shadow-inner scrollbar-hide"
      >
        {allVideos.length > 0 ? (
          allVideos.map(video => (
            // Ensure each snap item fills the height of the scrollport
            // The VideoCard itself should be designed to fill its parent
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

// Helper class to hide scrollbar, add this to globals.css if preferred
// For Tailwind JIT to pick this up, it would need to be in a real CSS file or setup.
// Using inline style for simplicity for now if needed, but Tailwind plugin preferred.
// For now, assuming scrollbar-hide is a utility (it's common but not default TW)
// If scrollbar-hide is not available, add this to your globals.css:
/*
@layer utilities {
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
*/

