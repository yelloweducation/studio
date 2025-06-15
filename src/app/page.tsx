
"use client";
import React, { useState, type FormEvent, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Compass, Brain, Layers, Circle, PlaySquare } from 'lucide-react'; // Removed View
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from "@/lib/utils";

const homePageTranslations = {
  en: {
    title: "Yellow Institute",
    subtitle: "Your Future Tech Infused Education.",
    searchPlaceholder: "Search courses, e.g., Web Development",
    coursesButton: "Courses",
    reelsButton: "Reels",
    flashCardsButton: "Flash Cards",
    personalityTestLink: "Discover Your Strengths",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    aboutUs: "About Us",
    darkTheme: "Dark Theme",
    availableLanguages: "Available languages",
    english: "English",
    myanmar: "Myanmar"
  },
  my: {
    title: "Yellow Institute", 
    subtitle: "သင့်အတွက် အနာဂတ်နည်းပညာပညာရေး။",
    searchPlaceholder: "အတန်းများရှာပါ၊ ဥပမာ - Web Development",
    coursesButton: "အတန်း",
    reelsButton: "ဗီဒီယိုတို",
    flashCardsButton: "ကတ်ပြားများ",
    personalityTestLink: "သင်၏ အားသာချက်များကို ရှာဖွေပါ",
    privacyPolicy: "ကိုယ်ရေးအချက်အလက်မူဝါဒ",
    termsOfService: "ဝန်ဆောင်မှုစည်းမျဉ်းများ",
    aboutUs: "ကျွန်ုပ်တို့အကြောင်း",
    darkTheme: "အမဲရောင်",
    availableLanguages: "ရရှိနိုင်သောဘာသာစကားများ",
    english: "အင်္ဂလိပ်",
    myanmar: "မြန်မာ"
  }
};

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const { language, setLanguage } = useLanguage(); 

  const t = homePageTranslations[language]; 

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <div className="flex flex-col items-center pb-8">
      <section className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl text-center pt-12 md:pt-16 lg:pt-24 mb-10">
        <div className={cn(
          "flex items-center justify-center space-x-2 lg:space-x-3 font-bold font-headline text-foreground mb-4",
          'text-2xl sm:text-3xl lg:text-4xl' 
        )}>
          <Circle size={language === 'my' ? 28 : 32} className="text-primary" /> 
          <span>{t.title}</span>
        </div>
        <p className={cn(
          "text-muted-foreground mb-8",
          language === 'my' ? 'text-base sm:text-lg lg:text-xl' : 'text-lg sm:text-xl lg:text-2xl'
        )}>
          {t.subtitle}
        </p>
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto">
          <Input
            type="search"
            placeholder={t.searchPlaceholder}
            className="flex-grow rounded-r-none focus:z-10 shadow-sm text-sm sm:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" className="rounded-l-none">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
        </form>
        
        <div className="mt-8 grid grid-cols-2 items-center justify-center gap-2 sm:gap-3 w-full max-w-xs sm:max-w-sm lg:max-w-lg mx-auto">
            <Button 
              asChild 
              size="lg" 
              variant="default" 
              className={cn(
                "w-full",
                language === 'my' ? 'text-xs sm:text-sm' : 'text-sm'
              )}
            >
                <Link href="/courses/search">
                    <Compass className="mr-2 h-5 w-5" /> {t.coursesButton}
                </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="default" 
              className={cn(
                "w-full",
                language === 'my' ? 'text-xs sm:text-sm' : 'text-sm'
              )}
            >
                <Link href="/videos">
                    <PlaySquare className="mr-2 h-5 w-5" /> {t.reelsButton}
                </Link>
            </Button>
        </div>

        <div className="mt-8 text-center space-y-3">
          <Link href="/personality-tests" className={cn(
            "inline-flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors py-1 group",
            language === 'my' ? 'text-xs sm:text-sm' : 'text-sm'
          )}>
            <Brain className="mr-2 h-4 w-4 text-primary/80 group-hover:text-primary transition-colors" />
            {t.personalityTestLink}
          </Link>
          <br /> 
          <Link href="/flash-cards" className={cn(
            "inline-flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors py-1 group",
            language === 'my' ? 'text-xs sm:text-sm' : 'text-sm'
          )}>
            <Layers className="mr-2 h-4 w-4 text-primary/80 group-hover:text-primary transition-colors" />
            {t.flashCardsButton}
          </Link>
        </div>
      </section>

      <section className="w-full max-w-4xl text-center mt-6 mb-4">
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <span>{t.availableLanguages}:</span>
          <Button 
            variant="link" 
            className={`p-0 h-auto text-xs hover:text-primary ${language === 'en' ? 'text-primary font-semibold underline' : 'text-muted-foreground'}`}
            onClick={() => setLanguage('en')}
          >
            {t.english}
          </Button>
          <span>|</span>
          <Button 
            variant="link" 
            className={`p-0 h-auto text-xs hover:text-primary ${language === 'my' ? 'text-primary font-semibold underline' : 'text-muted-foreground'}`}
            onClick={() => setLanguage('my')}
          >
            {t.myanmar}
          </Button>
        </div>
      </section>

      <section className="w-full max-w-4xl text-center mt-2 mb-4">
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Link href="/privacy-policy" className="hover:text-primary hover:underline">
            {t.privacyPolicy}
          </Link>
          <Link href="/terms-of-service" className="hover:text-primary hover:underline">
            {t.termsOfService}
          </Link>
          <Link href="/about" className="hover:text-primary hover:underline">
            {t.aboutUs}
          </Link>
          <span>
            {t.darkTheme}: {theme === 'dark' ? (language === 'en' ? 'On' : 'ဖွင့်') : (language === 'en' ? 'Off' : 'ပိတ်')}
          </span>
        </div>
      </section>
    </div>
  );
}
