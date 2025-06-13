
"use client";
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Circle, Home } from 'lucide-react'; // Circle is not used here anymore, Home is.
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
  // isScrolled prop removed as background is always transparent
}

const VideoPageHeader = (/*{ isScrolled }: VideoPageHeaderProps*/) => {
  const { language } = useLanguage();
  const t = videoPageHeaderTranslations[language];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 text-white transition-colors duration-300",
        "bg-transparent" // Made header fully transparent
      )}
    >
      <div className="flex items-center gap-2">
        {/* Optional: Add a small brand icon or "Reels" text if needed */}
        {/* <VideoIcon size={20} className="text-primary" /> */}
        <h1 className="text-lg font-semibold text-white">{t.forYou}</h1> {/* Text color to white for visibility on dark video backgrounds */}
      </div>

      <Button variant="ghost" size="icon" asChild aria-label={t.home} className="hover:bg-white/10">
        <Link href="/">
          <Home className="h-6 w-6 text-white hover:text-primary" />
        </Link>
      </Button>
    </header>
  );
};

export default VideoPageHeader;

    