
"use client";
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Circle, Home } from 'lucide-react'; 
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

const VideoPageHeader = () => {
  const { language } = useLanguage();
  const t = videoPageHeaderTranslations[language];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 bg-black/80 backdrop-blur-sm text-white shadow-md" 
      )}
    >
      <div className="flex items-center gap-2">
        <Circle size={18} className="text-primary fill-primary" /> 
        <h1 className="text-lg font-semibold">{t.forYou}</h1>
      </div>

      <Button variant="ghost" size="icon" asChild aria-label={t.home} className="hover:bg-white/20">
        <Link href="/">
          <Home className="h-6 w-6 text-white hover:text-primary" />
        </Link>
      </Button>
    </header>
  );
};

export default VideoPageHeader;
    