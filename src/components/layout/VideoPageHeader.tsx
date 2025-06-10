
"use client";
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const videoPageHeaderTranslations = {
  en: {
    forYou: "For You",
  },
  my: {
    forYou: "သင့်အတွက်",
  }
};

const VideoPageHeader = () => {
  const { language } = useLanguage();
  const t = videoPageHeaderTranslations[language];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-center bg-black/70 px-4 text-white shadow-md backdrop-blur-sm",
        // Add padding top to account for safe area insets (e.g., iPhone notch)
        "pt-[env(safe-area-inset-top)]" 
      )}
    >
      {/* The inner div's height will be h-14 effectively, content centered within it */}
      <div className="flex items-center justify-center h-full">
        <h1 className="text-lg font-semibold">{t.forYou}</h1>
      </div>
    </header>
  );
};

export default VideoPageHeader;
