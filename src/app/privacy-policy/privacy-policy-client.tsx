
"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { serverGetSitePageBySlug } from '@/actions/adminDataActions';
import type { SitePage } from '@/lib/dbUtils';

const privacyPolicyStaticTranslations = {
  en: {
    backToHome: "Back to Home",
    pageTitle: "Privacy Policy",
    defaultContent: "<p>Our privacy policy details will be available here soon. Please check back later or contact us for more information.</p>",
    loadingError: "Could not load privacy policy content. Please try again later.",
  },
  my: {
    backToHome: "ပင်မသို့ ပြန်သွားရန်",
    pageTitle: "ကိုယ်ရေးအချက်အလက်မူဝါဒ",
    defaultContent: "<p>ကျွန်ုပ်တို့၏ ကိုယ်ရေးအချက်အလက်မူဝါဒ အသေးစိတ်ကို ဤနေရာတွင် မကြာမီ ရရှိနိုင်ပါမည်။ နောက်မှ ပြန်လည်စစ်ဆေးပါ သို့မဟုတ် နောက်ထပ်အချက်အလက်များအတွက် ကျွန်ုပ်တို့ထံ ဆက်သွယ်ပါ။</p>",
    loadingError: "ကိုယ်ရေးအချက်အလက်မူဝါဒ အကြောင်းအရာကို တင်၍မရပါ။ နောက်မှ ပြန်ကြိုးစားကြည့်ပါ။",
  }
};

const SLUG = 'privacy-policy';

export default function PrivacyPolicyClient() {
  const { language } = useLanguage();
  const t_static = privacyPolicyStaticTranslations[language];

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
        console.error("Error fetching privacy policy content:", err);
        setError(t_static.loadingError);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [language, t_static.loadingError]);
  
  const pageTitle = pageData?.title || t_static.pageTitle;
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
            <div dangerouslySetInnerHTML={{ __html: t_static.defaultContent }} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    