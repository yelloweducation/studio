
"use client"; // Make client component for language hook
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Yellow Institute',
  description: 'Learn more about Yellow Institute, our mission, vision, and values in providing quality online education.',
};

const aboutPageTranslations = {
  en: {
    backToHome: "Back to Home",
    title: "About Yellow Institute",
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
    placeholder: "This is a placeholder About Us page. More detailed content about our story, team, and impact will be added here."
  },
  my: {
    backToHome: "ပင်မသို့ ပြန်သွားရန်",
    title: "Yellow Institute အကြောင်း",
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
    placeholder: "ဤသည်မှာ ကျွန်ုပ်တို့အကြောင်း စာမျက်နှာအတွက် နေရာဖြည့်စာသား ဖြစ်သည်။ ကျွန်ုပ်တို့၏ ဇာတ်လမ်း၊ အဖွဲ့နှင့် အကျိုးသက်ရောက်မှုများအကြောင်း အသေးစိတ်အကြောင်းအရာများကို ဤနေရာတွင် ထပ်ထည့်ပါမည်။"
  }
};


export default function AboutPage() {
  const { language } = useLanguage();
  const t = aboutPageTranslations[language];

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" /> {t.backToHome}
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-headline">{t.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t.welcome}
          </p>
          <p>
            {t.mission}
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">{t.visionTitle}</h3>
          <p>
            {t.visionText}
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">{t.valuesTitle}</h3>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>{t.value1}</li>
            <li>{t.value2}</li>
            <li>{t.value3}</li>
            <li>{t.value4}</li>
            <li>{t.value5}</li>
          </ul>
          <p className="text-sm text-muted-foreground pt-4">
            {t.placeholder}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
