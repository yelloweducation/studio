
"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Briefcase, Users, Lightbulb, ArrowRight } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

const personalityTestsPageTranslations = {
  en: {
    pageTitle: "Personality & Skill Assessments",
    pageDescription: "Gain deeper insights into your strengths, preferences, and potential pathways.",
    test1Title: "What's Your Learning Style?",
    test1Desc: "Understand how you learn best to maximize your study effectiveness and tailor your learning journey.",
    test2Title: "Career Path Explorer",
    test2Desc: "Explore career options that align with your personality, interests, and inherent strengths.",
    test3Title: "Team Dynamics Identifier",
    test3Desc: "Find out your natural role and contribution style when working collaboratively in a team setting.",
    startTestButton: "Start Assessment",
    comingSoon: "Quiz functionality is under development and will be available soon!",
    moreAssessmentsTitle: "More Assessments Coming Soon!",
    moreAssessmentsDesc: "We're developing more tools to help you understand yourself better, including detailed personality type indicators (like ENFJ, INFP, etc.) and skill-based assessments. Stay tuned!",
  },
  my: {
    pageTitle: "ကိုယ်ရည်ကိုယ်သွေးနှင့် ကျွမ်းကျင်မှု အကဲဖြတ်ချက်များ",
    pageDescription: "သင်၏ အားသာချက်များ၊ ဦးစားပေးမှုများနှင့် ဖြစ်နိုင်ခြေရှိသော လမ်းကြောင်းများကို ပိုမိုနက်ရှိုင်းစွာ ထိုးထွင်းသိမြင်ပါ။",
    test1Title: "သင်၏ သင်ယူမှုပုံစံက ဘာလဲ။",
    test1Desc: "သင်၏လေ့လာမှုထိရောက်မှုကို အမြင့်ဆုံးမြှင့်တင်ရန်နှင့် သင်၏သင်ယူမှုခရီးကို စိတ်ကြိုက်ပြင်ဆင်ရန် သင်မည်သို့အကောင်းဆုံးသင်ယူနိုင်သည်ကို နားလည်ပါ။",
    test2Title: "အသက်မွေးဝမ်းကြောင်းလမ်းကြောင်း ရှာဖွေသူ",
    test2Desc: "သင်၏ကိုယ်ရည်ကိုယ်သွေး၊ စိတ်ဝင်စားမှုများနှင့် ပင်ကိုယ်အားသာချက်များနှင့်ကိုက်ညီသော အသက်မွေးဝမ်းကြောင်းဆိုင်ရာ ရွေးချယ်မှုများကို စူးစမ်းပါ။",
    test3Title: "အဖွဲ့လိုက် အခန်းကဏ္ဍ ဖော်ထုတ်သူ",
    test3Desc: "အဖွဲ့လိုက်ပူးပေါင်းလုပ်ဆောင်သည့်အခါ သင်၏ပင်ကိုယ်အခန်းကဏ္ဍနှင့် ပံ့ပိုးကူညီမှုပုံစံကို ရှာဖွေပါ။",
    startTestButton: "အကဲဖြတ်မှု စတင်ပါ",
    comingSoon: "စစ်ဆေးမှုလုပ်ဆောင်ချက်ကို ဖန်တီးနေဆဲဖြစ်ပြီး မကြာမီ ရရှိနိုင်ပါမည်!",
    moreAssessmentsTitle: "နောက်ထပ် အကဲဖြတ်ချက်များ မကြာမီလာမည်!",
    moreAssessmentsDesc: "အသေးစိတ် ကိုယ်ရည်ကိုယ်သွေးအမျိုးအစား အညွှန်းကိန်းများ (ဥပမာ ENFJ, INFP) နှင့် ကျွမ်းကျင်မှုအခြေခံ အကဲဖြတ်ချက်များ အပါအဝင် သင့်ကိုယ်သင် ပိုမိုနားလည်နိုင်စေရန် ကိရိယာများ ပိုမိုဖန်တီးနေပါသည်။ စောင့်မျှော်ကြည့်ရှုပါ။",
  }
};

interface AssessmentCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonText: string;
  onStart: () => void;
}

const AssessmentCard: React.FC<AssessmentCardProps> = ({ icon: Icon, title, description, buttonText, onStart }) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="flex-row items-start gap-4 space-y-0 pb-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl font-headline">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onStart}>
          {buttonText} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function PersonalityTestsClient() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = personalityTestsPageTranslations[language];

  const handleStartTest = () => {
    toast({
      title: "Coming Soon!",
      description: t.comingSoon,
    });
  };

  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">{t.pageTitle}</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">{t.pageDescription}</p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AssessmentCard
          icon={Brain}
          title={t.test1Title}
          description={t.test1Desc}
          buttonText={t.startTestButton}
          onStart={handleStartTest}
        />
        <AssessmentCard
          icon={Briefcase}
          title={t.test2Title}
          description={t.test2Desc}
          buttonText={t.startTestButton}
          onStart={handleStartTest}
        />
        <AssessmentCard
          icon={Users}
          title={t.test3Title}
          description={t.test3Desc}
          buttonText={t.startTestButton}
          onStart={handleStartTest}
        />
      </section>

      <section>
        <Card className="bg-accent/10 border-accent/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
              <Lightbulb className="mr-3 h-6 w-6 text-accent" />
              {t.moreAssessmentsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">{t.moreAssessmentsDesc}</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
