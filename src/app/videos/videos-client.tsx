
"use client";
import React, { useState, useEffect, useRef } from 'react';
import type { Video } from '@/lib/dbUtils';
import VideoCard from '@/components/videos/VideoCard';
import { Loader2, AlertTriangle, VideoOff } from 'lucide-react';
import VideoPageHeader from '@/components/layout/VideoPageHeader';
import { serverGetVideos } from '@/actions/adminDataActions';
import { useLanguage } from '@/contexts/LanguageContext'; // Added

const videoClientTranslations = {
  en: {
    loadingVideos: "Loading videos...",
    errorLoadingTitle: "Error Loading Videos",
    errorLoadingMessage: "We couldn't load the videos at this time. Please try again later.",
    noVideosTitle: "No Videos Yet",
    noVideosMessage: "There are no videos available in the feed right now. Check back soon!"
  },
  my: {
    loadingVideos: "ဗီဒီယိုများ တင်နေသည်...",
    errorLoadingTitle: "ဗီဒီယိုများ တင်ရာတွင် အမှားအယွင်းဖြစ်သည်",
    errorLoadingMessage: "ယခုအချိန်တွင် ဗီဒီယိုများ တင်၍မရပါ။ နောက်မှ ထပ်ကြိုးစားကြည့်ပါ။",
    noVideosTitle: "ဗီဒီယိုများ မရှိသေးပါ",
    noVideosMessage: "ယခုအချိန်တွင် ဗီဒီယိုများ မရှိသေးပါ။ မကြာမီ ပြန်လည်စစ်ဆေးပေးပါ။"
  }
};

export default function VideosClient() {
  const [allFeedVideos, setAllFeedVideos] = useState<Video[]>([]);
  const [isLoadingFeedVideos, setIsLoadingFeedVideos] = useState(true);
  const [errorLoadingVideos, setErrorLoadingVideos] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage(); // Added
  const t = videoClientTranslations[language]; // Added

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingFeedVideos(true);
      setErrorLoadingVideos(null);
      try {
        const videosFromDb = await serverGetVideos();
        // Filter out any videos that might be null or lack essential properties (defensive)
        const validVideos = videosFromDb.filter(video => video && video.id && video.embedUrl);
        setAllFeedVideos(validVideos);
      } catch (error) {
        console.error("Error fetching videos for feed:", error);
        setErrorLoadingVideos(t.errorLoadingMessage);
        setAllFeedVideos([]);
      }
      setIsLoadingFeedVideos(false);
    };
    fetchVideos();
  }, [t.errorLoadingMessage]); // Added t.errorLoadingMessage to dependency array

  return (
    <div className="h-screen flex flex-col bg-black relative">
      <VideoPageHeader />
      {isLoadingFeedVideos ? (
        <div className="flex-grow flex flex-col items-center justify-center text-white pt-14">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-3" />
          <p>{t.loadingVideos}</p>
        </div>
      ) : errorLoadingVideos ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 text-white pt-14">
          <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
          <p className="text-lg font-semibold">{t.errorLoadingTitle}</p>
          <p className="text-sm text-gray-400">{errorLoadingVideos}</p>
        </div>
      ) : allFeedVideos.length > 0 ? (
        <div
          ref={scrollContainerRef}
          className="flex-grow overflow-y-auto snap-y snap-mandatory scrollbar-hide pt-14 pb-[env(safe-area-inset-bottom)]"
        >
          {allFeedVideos.map(video => (
            <div key={video.id} className="h-full w-full snap-center shrink-0 flex items-center justify-center px-2 py-2">
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 text-white pt-14">
          <VideoOff className="h-12 w-12 text-gray-500 mb-3" />
          <p className="text-lg font-semibold">{t.noVideosTitle}</p>
          <p className="text-sm text-gray-400">{t.noVideosMessage}</p>
        </div>
      )}
    </div>
  );
}
