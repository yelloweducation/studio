
"use client";
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Home, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const videoPageHeaderTranslations = {
  en: {
    forYou: "For You",
    home: "Go to Home",
  },
  my: {
    forYou: "သင့်အတွက်",
    home: "ပင်မသို့သွားပါ",
  }
};

interface VideoPageHeaderProps {
  // isScrolled prop was removed, header is always transparent
}

const VideoPageHeader = (/*{ isScrolled }: VideoPageHeaderProps*/) => {
  const { language } = useLanguage();
  const t = videoPageHeaderTranslations[language];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 text-black dark:text-white transition-colors duration-300", // Changed default text color
        "bg-transparent"
      )}
    >
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-black dark:text-white flex items-center"> {/* Changed text color here */}
          {t.forYou}
          <Circle className="ml-1.5 h-2.5 w-2.5 fill-primary text-primary" />
        </h1>
      </div>

      <Button variant="ghost" size="icon" asChild aria-label={t.home} className="hover:bg-black/10">
        <Link href="/">
          <Home className="h-6 w-6 text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300" /> {/* Ensured home icon also respects dark mode for consistency */}
        </Link>
      </Button>
    </header>
  );
};

export default VideoPageHeader;

