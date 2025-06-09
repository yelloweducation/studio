
"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import VideoCard from '@/components/videos/VideoCard';
import { videos as allVideos } from '@/data/mockData';
import { ChevronLeft, Video as VideoIcon } from 'lucide-react';

export default function VideosPage() {
  return (
    <div className="w-full max-w-2xl mx-auto py-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-semibold flex items-center">
          <VideoIcon className="mr-3 h-8 w-8 text-primary" /> Trending Videos
        </h1>
        <Button variant="outline" asChild>
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
      
      <div 
        className="h-[calc(100vh-280px)] sm:h-[calc(100vh-250px)] md:h-[calc(100vh-220px)] 
                   overflow-y-auto snap-y snap-mandatory space-y-4 
                   rounded-lg p-2 bg-card shadow-inner scrollbar-hide"
      >
        {allVideos.length > 0 ? (
          allVideos.map(video => (
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
