
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

const tosTranslations = {
  en: {
    backToHome: "Back to Home",
    title: "Terms of Service",
    welcome: "Welcome to the Yellow Institute Terms of Service. By accessing or using our platform, you agree to be bound by these terms.",
    accountRegTitle: "1. Account Registration",
    accountRegText: "You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account and password.",
    enrollmentTitle: "2. Course Enrollment and Access",
    enrollmentText: "Course enrollment may be subject to payment. We grant you a limited, non-exclusive, non-transferable license to access and view the course content for which you have paid all required fees.",
    userConductTitle: "3. User Conduct",
    userConductText: "You agree not to use the platform for any unlawful purpose or in any way that could damage, disable, overburden, or impair the platform.",
    ipTitle: "4. Intellectual Property",
    ipText: "All content on the platform, including courses, text, graphics, logos, and software, is the property of Yellow Institute or its content suppliers and protected by international copyright laws.",
    disclaimersTitle: "5. Disclaimers",
    disclaimersText: "The platform and its content are provided \"as is\" without warranty of any kind. We do not guarantee that the platform will be error-free or uninterrupted.",
    changesTitle: "6. Changes to Terms",
    changesText: "We reserve the right to modify these terms at any time. Your continued use of the platform after such changes constitutes your acceptance of the new terms.",
    placeholder: "This is a placeholder Terms of Service. More detailed content will be added here."
  },
  my: {
    backToHome: "ပင်မသို့ ပြန်သွားရန်",
    title: "ဝန်ဆောင်မှုစည်းမျဉ်းများ",
    welcome: "Yellow Institute ၏ ဝန်ဆောင်မှုစည်းမျဉ်းများသို့ ကြိုဆိုပါသည်။ ကျွန်ုပ်တို့၏ ပလက်ဖောင်းကို အသုံးပြုခြင်းဖြင့် ဤစည်းမျဉ်းများကို လိုက်နာရန် သဘောတူပါသည်။",
    accountRegTitle: "၁။ အကောင့်မှတ်ပုံတင်ခြင်း",
    accountRegText: "အကောင့်ဖန်တီးသည့်အခါ တိကျသောအချက်အလက်များကို ပေးရပါမည်။ သင်၏အကောင့်နှင့် စကားဝှက်၏ လျှို့ဝှက်ချက်ကို ထိန်းသိမ်းရန်မှာ သင်၏တာဝန်ဖြစ်သည်။",
    enrollmentTitle: "၂။ အတန်းစာရင်းသွင်းခြင်းနှင့် အသုံးပြုခွင့်",
    enrollmentText: "အတန်းစာရင်းသွင်းခြင်းသည် ငွေပေးချေမှု လိုအပ်နိုင်ပါသည်။ လိုအပ်သော အခကြေးငွေအားလုံး ပေးချေပြီးသော အတန်းအကြောင်းအရာများကို ကြည့်ရှုရန် ကန့်သတ်ထားသော၊ သီးသန့်မဟုတ်သော၊ လွှဲပြောင်း၍မရသော လိုင်စင်ကို သင့်အား ကျွန်ုပ်တို့ ပေးအပ်ပါသည်။",
    userConductTitle: "၃။ အသုံးပြုသူ၏ အပြုအမူ",
    userConductText: "ပလက်ဖောင်းကို တရားမဝင်သော ရည်ရွယ်ချက်များအတွက် သို့မဟုတ် ပလက်ဖောင်းကို ပျက်စီးစေခြင်း၊ ပိတ်ထားခြင်း၊ ဝန်ပိုစေခြင်း သို့မဟုတ် ထိခိုက်စေနိုင်သော မည်သည့်နည်းလမ်းဖြင့်မဆို အသုံးမပြုရန် သင်သဘောတူသည်။",
    ipTitle: "၄။ အသိပညာဆိုင်ရာ ပစ္စည်း",
    ipText: "အတန်းများ၊ စာသားများ၊ ဂရပ်ဖစ်များ၊ လိုဂိုများနှင့် ဆော့ဖ်ဝဲလ်များအပါအဝင် ပလက်ဖောင်းပေါ်ရှိ အကြောင်းအရာအားလုံးသည် Yellow Institute သို့မဟုတ် ၎င်း၏ အကြောင်းအရာပံ့ပိုးသူများ၏ ပိုင်ဆိုင်မှုဖြစ်ပြီး နိုင်ငံတကာ မူပိုင်ခွင့်ဥပဒေများဖြင့် ကာကွယ်ထားသည်။",
    disclaimersTitle: "၅။ ငြင်းဆိုချက်များ",
    disclaimersText: "ပလက်ဖောင်းနှင့် ၎င်း၏အကြောင်းအရာများကို \"ရှိရင်းစွဲအတိုင်း\" မည်သည့်အာမခံချက်မျှမရှိဘဲ ပံ့ပိုးပေးထားသည်။ ပလက်ဖောင်းသည် အမှားအယွင်းကင်းမည် သို့မဟုတ် အနှောင့်အယှက်ကင်းမည်ဟု ကျွန်ုပ်တို့ အာမမခံပါ။",
    changesTitle: "၆။ စည်းမျဉ်းများ ပြောင်းလဲခြင်း",
    changesText: "ဤစည်းမျဉ်းများကို အချိန်မရွေး ပြင်ဆင်ပိုင်ခွင့်ကို ကျွန်ုပ်တို့ လက်ဝယ်ထားရှိသည်။ ထိုသို့သော ပြောင်းလဲမှုများ ပြုလုပ်ပြီးနောက် သင်ပလက်ဖောင်းကို ဆက်လက်အသုံးပြုခြင်းသည် စည်းမျဉ်းအသစ်များကို သင်လက်ခံသည်ဟု ယူဆပါမည်။",
    placeholder: "ဤသည်မှာ ဝန်ဆောင်မှုစည်းမျဉ်းများအတွက် နေရာဖြည့်စာသား ဖြစ်သည်။ အသေးစိတ်အကြောင်းအရာများကို ဤနေရာတွင် ထပ်ထည့်ပါမည်။"
  }
};


export default function TermsOfServicePage() {
  const { language } = useLanguage();
  const t = tosTranslations[language];

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
          <h3 className="text-lg font-semibold font-headline pt-2">{t.accountRegTitle}</h3>
          <p>
            {t.accountRegText}
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">{t.enrollmentTitle}</h3>
          <p>
            {t.enrollmentText}
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">{t.userConductTitle}</h3>
          <p>
            {t.userConductText}
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">{t.ipTitle}</h3>
          <p>
            {t.ipText}
          </p>
           <h3 className="text-lg font-semibold font-headline pt-2">{t.disclaimersTitle}</h3>
          <p>
            {t.disclaimersText}
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">{t.changesTitle}</h3>
          <p>
            {t.changesText}
          </p>
          <p className="text-sm text-muted-foreground pt-4">
            {t.placeholder}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
