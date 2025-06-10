
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
        "fixed top-0 left-0 right-0 z-40 flex h-14 items-center px-4 bg-white shadow-md"
      )}
    >
      {/* Title is now directly inside the header and will be left-aligned due to flex context */}
      <h1 className="text-lg font-semibold text-gray-800">{t.forYou}</h1>
    </header>
  );
};

export default VideoPageHeader;
