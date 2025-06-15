
"use client";
import React, { useState, useEffect, useRef } from 'react';
import VideoCard from '@/components/videos/VideoCard';
import { type Video } from '@/lib/dbUtils';
import { serverGetVideos } from '@/actions/adminDataActions';
import { Loader2, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const videosPageTranslations = {
  en: {
    loadingVideos: "Loading videos...",
    noVideos: "No Videos Available",
    noVideosDescription: "It seems there are no videos here at the moment. Check back later!",
    backToHome: "Back to Home",
  },
  my: {
    loadingVideos: "ဗီဒီယိုများ တင်နေသည်...",
    noVideos: "ဗီဒီယိုများ မရှိပါ",
    noVideosDescription: "လောလောဆယ်တွင် ဤနေရာ၌ ဗီဒီယိုများ မရှိသေးပါ။ နောက်မှ ပြန်လည်စစ်ဆေးပါ။",
    backToHome: "ပင်မသို့ ပြန်သွားရန်",
  }
};

export default function VideosClient() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = videosPageTranslations[language];

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedVideos = await serverGetVideos();
        setVideos(fetchedVideos);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // Snap scrolling effect
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let isScrolling: NodeJS.Timeout;
    const handleScroll = () => {
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        const items = Array.from(container.children) as HTMLElement[];
        if (items.length === 0) return;

        const scrollPosition = container.scrollTop;
        const containerHeight = container.clientHeight;
        
        let closestItemIndex = 0;
        let minDistance = Infinity;

        items.forEach((item, index) => {
          const itemTop = item.offsetTop;
          const itemCenter = itemTop + item.offsetHeight / 2;
          const distance = Math.abs(scrollPosition + containerHeight / 2 - itemCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestItemIndex = index;
          }
        });
        
        if (items[closestItemIndex]) {
         container.scrollTo({ top: items[closestItemIndex].offsetTop, behavior: 'smooth' });
        }

      }, 150); // Adjust timeout as needed
    };
    
    // Debounce for resize as well
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (container && videos.length > 0) { // Ensure there are items to scroll to
             const currentVisibleItem = Array.from(container.children).find(child => {
                const rect = (child as HTMLElement).getBoundingClientRect();
                return rect.top >= 0 && rect.bottom <= window.innerHeight;
            }) as HTMLElement | undefined;

            if (currentVisibleItem) {
                 container.scrollTo({ top: currentVisibleItem.offsetTop, behavior: 'auto' }); // Snap immediately on resize
            } else if (container.firstChild) {
                 container.scrollTo({ top: (container.firstChild as HTMLElement).offsetTop, behavior: 'auto' });
            }
        }
      }, 200);
    };


    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(isScrolling);
      clearTimeout(resizeTimer);
    };
  }, [videos.length]); // Rerun if video count changes


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t.loadingVideos}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-4">
        <VideoOff className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">{error}</h2>
        <p className="text-muted-foreground mb-6">{t.noVideosDescription}</p>
        <Button asChild>
          <Link href="/">{t.backToHome}</Link>
        </Button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-4">
        <VideoOff className="h-16 w-16 text-primary/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t.noVideos}</h2>
        <p className="text-muted-foreground mb-6">{t.noVideosDescription}</p>
        <Button asChild>
          <Link href="/">{t.backToHome}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div 
      ref={scrollContainerRef}
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory bg-black hide-scrollbar pt-[var(--header-height,56px)] pb-[var(--footer-height,56px)]"
      style={{ 
        // @ts-ignore
        '--header-height': '56px', 
        '--footer-height': '56px' 
      }}
    >
      {videos.map((video) => (
        <div key={video.id} className="h-full snap-center flex items-center justify-center px-2 py-2">
          <VideoCard video={video} />
        </div>
      ))}
    </div>
  );
}
