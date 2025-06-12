
"use client"; 
import React, { useState, useEffect } from 'react'; // Added React, useState, useEffect
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { serverGetSitePageBySlug } from '@/actions/adminDataActions'; // To fetch dynamic content
import type { SitePage } from '@/lib/dbUtils';

const aboutPageStaticTranslations = { // Keep for fallback if dynamic content fails
  en: {
    backToHome: "Back to Home",
    pageTitle: "About Yellow Institute", // Use this for card title if dynamic fails
    welcome: "Yellow Institute is dedicated to providing high-quality online education to learners around the globe.",
    mission: "Our mission is to make learning accessible, engaging, and effective. We believe that education is a powerful tool for personal and professional growth, and we strive to create a platform that empowers individuals to achieve their learning goals.",
    visionTitle: "Our Vision",
    visionText: "To be a leading online learning platform recognized for its innovative teaching methods, comprehensive course offerings, and commitment to student success.",
    valuesTitle: "Our Values",
    value1: "Excellence in Education",
    value2: "Accessibility for All",
    value3: "Continuous Innovation",
    value4: "Supportive Learning Community",
    value5: "Integrity and Transparency",
    loadingError: "Could not load page content. Please try again later.",
  },
  my: {
    backToHome: "ပင်မသို့ ပြန်သွားရန်",
    pageTitle: "Yellow Institute အကြောင်း",
    welcome: "Yellow Institute သည် ကမ္ဘာတစ်ဝှမ်းရှိ သင်ယူသူများအတွက် အရည်အသွေးမြင့် အွန်လိုင်းပညာရေးကို ပံ့ပိုးပေးရန် ရည်စူးပါသည်။",
    mission: "ကျွန်ုပ်တို့၏ ရည်မှန်းချက်မှာ သင်ယူမှုကို အလွယ်တကူရရှိနိုင်စေရန်၊ ဆွဲဆောင်မှုရှိစေရန်နှင့် ထိရောက်စေရန် ဖြစ်သည်။ ပညာရေးသည် တစ်ကိုယ်ရေနှင့် အသက်မွေးဝမ်းကျောင်း ကြီးထွားတိုးတက်မှုအတွက် အစွမ်းထက်သောကိရိယာတစ်ခုဖြစ်သည်ဟု ကျွန်ုပ်တို့ယုံကြည်ပြီး တစ်ဦးချင်းစီ၏ သင်ယူမှုပန်းတိုင်များ အောင်မြင်စေရန် စွမ်းဆောင်နိုင်သော ပလက်ဖောင်းတစ်ခုကို ဖန်တီးရန် ကြိုးပမ်းပါသည်။",
    visionTitle: "ကျွန်ုပ်တို့၏ မျှော်မှန်းချက်",
    visionText: "ဆန်းသစ်သော သင်ကြားရေးနည်းလမ်းများ၊ ကျယ်ပြန့်သော အတန်းကမ်းလှမ်းမှုများနှင့် ကျောင်းသားအောင်မြင်မှုအပေါ် ကတိကဝတ်ပြုမှုတို့အတွက် အသိအမှတ်ပြုခံရသော ထိပ်တန်းအွန်လိုင်းသင်ယူမှုပလက်ဖောင်းတစ်ခု ဖြစ်လာရန်။",
    valuesTitle: "ကျွန်ုပ်တို့၏ တန်ဖိုးထားမှုများ",
    value1: "ပညာရေးတွင် ထူးချွန်မှု",
    value2: "အားလုံးအတွက် အသုံးပြုနိုင်စွမ်း",
    value3: "စဉ်ဆက်မပြတ် ဆန်းသစ်တီထွင်မှု",
    value4: "ပံ့ပိုးပေးသော သင်ယူမှုအသိုင်းအဝိုင်း",
    value5: "သမာဓိနှင့် ပွင့်လင်းမြင်သာမှု",
    loadingError: "စာမျက်နှာ အကြောင်းအရာကို တင်၍မရပါ။ နောက်မှ ပြန်ကြိုးစားကြည့်ပါ။",
  }
};

const SLUG = 'about-us';

export default function AboutClient() {
  const { language } = useLanguage();
  const t_static = aboutPageStaticTranslations[language];

  const [pageData, setPageData] = useState<SitePage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await serverGetSitePageBySlug(SLUG);
        setPageData(data);
      } catch (err) {
        console.error("Error fetching about us content:", err);
        setError(t_static.loadingError);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [language, t_static.loadingError]);

  const pageTitle = pageData?.title || t_static.pageTitle;
  // Assuming content is stored as an HTML string
  const pageContent = typeof pageData?.content === 'string' ? pageData.content : null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" /> {t_static.backToHome}
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-headline">{pageTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 prose dark:prose-invert max-w-none">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Loading content...</p>
            </div>
          ) : error ? (
             <div className="text-destructive flex items-center gap-2">
                <Info size={20}/> {error}
             </div>
          ) : pageContent ? (
            <div dangerouslySetInnerHTML={{ __html: pageContent }} />
          ) : (
            // Fallback to static translations if dynamic content is empty or not string
            <>
              <p className="text-muted-foreground">{t_static.welcome}</p>
              <p>{t_static.mission}</p>
              <h3>{t_static.visionTitle}</h3>
              <p>{t_static.visionText}</p>
              <h3>{t_static.valuesTitle}</h3>
              <ul>
                <li>{t_static.value1}</li>
                <li>{t_static.value2}</li>
                <li>{t_static.value3}</li>
                <li>{t_static.value4}</li>
                <li>{t_static.value5}</li>
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    