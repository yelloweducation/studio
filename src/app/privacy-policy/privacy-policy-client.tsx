
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
// Metadata is no longer exported from here

const privacyPolicyTranslations = {
  en: {
    backToHome: "Back to Home",
    title: "Privacy Policy",
    welcome: "Welcome to the Yellow Institute Privacy Policy page. Your privacy is important to us.",
    outline: "This policy outlines how we collect, use, and protect your personal information when you use our platform and services. We are committed to ensuring that your information is secure and handled with care.",
    infoCollectedTitle: "Information We Collect",
    infoCollectedText: "We may collect information such as your name, email address, and course progress to provide and improve our services. Payment information is handled securely by our payment processors and is not stored directly by us.",
    howWeUseTitle: "How We Use Information",
    howWeUseText: "Your information is used to manage your account, provide access to courses, process payments, communicate with you, and improve our platform.",
    dataSecurityTitle: "Data Security",
    dataSecurityText: "We implement a variety of security measures to maintain the safety of your personal information.",
    contactUsTitle: "Contact Us",
    contactUsText: "If you have any questions regarding this privacy policy, you may contact us using the information on our (future) contact page.",
    placeholder: "This is a placeholder Privacy Policy. More detailed content will be added here."
  },
  my: {
    backToHome: "ပင်မသို့ ပြန်သွားရန်",
    title: "ကိုယ်ရေးအချက်အလက်မူဝါဒ",
    welcome: "Yellow Institute ၏ ကိုယ်ရေးအချက်အလက်မူဝါဒ စာမျက်နှာမှ ကြိုဆိုပါသည်။ သင်၏ကိုယ်ရေးကိုယ်တာသည် ကျွန်ုပ်တို့အတွက် အရေးကြီးပါသည်။",
    outline: "ဤမူဝါဒသည် ကျွန်ုပ်တို့၏ ပလက်ဖောင်းနှင့် ဝန်ဆောင်မှုများကို သင်အသုံးပြုသည့်အခါ သင်၏ကိုယ်ရေးကိုယ်တာအချက်အလက်များကို ကျွန်ုပ်တို့ မည်သို့စုဆောင်း၊ အသုံးပြု၊ ကာကွယ်သည်ကို ဖော်ပြထားသည်။ သင်၏အချက်အလက်များ လုံခြုံမှုရှိစေရန်နှင့် ဂရုတစိုက်ကိုင်တွယ်ရန် ကျွန်ုပ်တို့ ကတိပြုပါသည်။",
    infoCollectedTitle: "ကျွန်ုပ်တို့ စုဆောင်းသော အချက်အလက်များ",
    infoCollectedText: "ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုများကို ပံ့ပိုးပေးရန်နှင့် တိုးတက်ကောင်းမွန်စေရန် သင်၏အမည်၊ အီးမေးလ်လိပ်စာနှင့် အတန်းတိုးတက်မှုစသည့် အချက်အလက်များကို စုဆောင်းနိုင်ပါသည်။ ငွေပေးချေမှုအချက်အလက်များကို ကျွန်ုပ်တို့၏ ငွေပေးချေမှု διεκπεραιωτέςများမှ လုံခြုံစွာကိုင်တွယ်ပြီး ကျွန်ုပ်တို့မှ တိုက်ရိုက်သိမ်းဆည်းထားခြင်းမရှိပါ။",
    howWeUseTitle: "အချက်အလက်များကို ကျွန်ုပ်တို့ မည်သို့အသုံးပြုသနည်း",
    howWeUseText: "သင်၏အချက်အလက်များကို သင်၏အကောင့်ကို စီမံခန့်ခွဲရန်၊ အတန်းများသို့ ဝင်ရောက်ခွင့်ပေးရန်၊ ငွေပေးချေမှုများ လုပ်ဆောင်ရန်၊ သင်နှင့် ဆက်သွယ်ရန်နှင့် ကျွန်ုပ်တို့၏ ပလက်ဖောင်းကို တိုးတက်ကောင်းမွန်စေရန် အသုံးပြုပါသည်။",
    dataSecurityTitle: "အချက်အလက် လုံခြုံရေး",
    dataSecurityText: "သင်၏ကိုယ်ရေးကိုယ်တာအချက်အလက်များ၏ ဘေးကင်းမှုကို ထိန်းသိမ်းရန် လုံခြုံရေးအစီအမံအမျိုးမျိုးကို ကျွန်ုပ်တို့ အကောင်အထည်ဖော်ပါသည်။",
    contactUsTitle: "ကျွန်ုပ်တို့ကို ဆက်သွယ်ပါ",
    contactUsText: "ဤကိုယ်ရေးအချက်အလက်မူဝါဒနှင့်ပတ်သက်၍ မေးခွန်းများရှိပါက၊ ကျွန်ုပ်တို့၏ (အနာဂတ်) ဆက်သွယ်ရန်စာမျက်နှာရှိ အချက်အလက်များကို အသုံးပြု၍ ကျွန်ုပ်တို့ကို ဆက်သွယ်နိုင်ပါသည်။",
    placeholder: "ဤသည်မှာ ကိုယ်ရေးအချက်အလက်မူဝါဒအတွက် နေရာဖြည့်စာသား ဖြစ်သည်။ အသေးစိတ်အကြောင်းအရာများကို ဤနေရာတွင် ထပ်ထည့်ပါမည်။"
  }
};

export default function PrivacyPolicyClient() { // Renamed from PrivacyPolicyPage
  const { language } = useLanguage();
  const t = privacyPolicyTranslations[language];

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
            {t.outline}
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">{t.infoCollectedTitle}</h3>
          <p>
            {t.infoCollectedText}
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">{t.howWeUseTitle}</h3>
          <p>
            {t.howWeUseText}
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">{t.dataSecurityTitle}</h3>
          <p>
            {t.dataSecurityText}
          </p>
          <h3 className="text-lg font-semibold font-headline pt-2">{t.contactUsTitle}</h3>
          <p>
            {t.contactUsText}
          </p>
          <p className="text-sm text-muted-foreground pt-4">
            {t.placeholder}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
