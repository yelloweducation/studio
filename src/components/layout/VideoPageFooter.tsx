
"use client";
import React from 'react';
import Link from 'next/link';
import { Home, Compass, UserCircle, PlusSquare } from 'lucide-react'; // Example icons
import { Button } from '@/components/ui/button';

const VideoPageFooter = () => {
  return (
    <footer 
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2.5 bg-black/50 backdrop-blur-sm border-t border-neutral-700"
      style={{ height: 'var(--footer-height, 56px)' }}
    >
      <Button variant="ghost" asChild className="flex flex-col items-center h-auto p-1 text-white hover:bg-white/10">
        <Link href="/">
          <Home className="h-5 w-5 mb-0.5" />
          <span className="text-[0.6rem] leading-none">Home</span>
        </Link>
      </Button>
      <Button variant="ghost" asChild className="flex flex-col items-center h-auto p-1 text-white hover:bg-white/10">
        <Link href="/courses/search">
          <Compass className="h-5 w-5 mb-0.5" />
          <span className="text-[0.6rem] leading-none">Explore</span>
        </Link>
      </Button>
      {/* Add "Create" button or other actions as needed */}
      {/* <Button variant="ghost" className="flex flex-col items-center h-auto p-1 text-white hover:bg-white/10">
        <PlusSquare className="h-6 w-6 mb-0.5 text-primary" />
         <span className="text-[0.6rem] leading-none">Create</span> 
      </Button> */}
      <Button variant="ghost" asChild className="flex flex-col items-center h-auto p-1 text-white hover:bg-white/10">
        <Link href="/dashboard/student"> {/* Or dynamically to admin/student/login */}
          <UserCircle className="h-5 w-5 mb-0.5" />
          <span className="text-[0.6rem] leading-none">Profile</span>
        </Link>
      </Button>
    </footer>
  );
};

export default VideoPageFooter;
