
"use client";
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Circle, Home } from 'lucide-react'; // Added Home icon
import { Button } from '@/components/ui/button'; // Added Button

const videoPageHeaderTranslations = {
  en: {
    forYou: "For You",
    home: "Go to Home", // Added for aria-label
  },
  my: {
    forYou: "သင့်အတွက်",
    home: "ပင်မသို့သွားပါ", // Added for aria-label (Go to Home)
  }
};

const VideoPageHeader = () => {
  const { language } = useLanguage();
  const t = videoPageHeaderTranslations[language];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 bg-white shadow-md" // Changed to justify-between
      )}
    >
      {/* Title and Icon on the left */}
      <div className="flex items-center gap-2">
        <Circle size={18} className="text-primary fill-primary" /> 
        <h1 className="text-lg font-semibold text-gray-800">{t.forYou}</h1>
      </div>

      {/* Home Icon Button on the right */}
      <Button variant="ghost" size="icon" asChild aria-label={t.home}>
        <Link href="/">
          <Home className="h-6 w-6 text-gray-700 hover:text-primary" />
        </Link>
      </Button>
    </header>
  );
};

export default VideoPageHeader;
