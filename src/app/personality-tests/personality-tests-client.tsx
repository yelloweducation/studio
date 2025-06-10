
"use client";
import React, { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Brain, Palette, Users, Zap, CheckCircle, Lightbulb, ArrowRight, RotateCcw } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { quizQuestions, styleOutcomes, type StyleId, type StyleOutcome, type QuizQuestion, type PersonalityTestsTranslations } from '@/data/personalityQuizData'; // Updated import

// Translations (could be imported from personalityQuizData if preferred, but keeping here for component focus)
const personalityTestsPageTranslations: PersonalityTestsTranslations = {
  en: {
    pageTitle: "Personality & Skill Assessments",
    pageDescription: "Gain deeper insights into your strengths, preferences, and potential pathways.",
    quizIntroTitle: "Discover Your Learning & Working Style",
    quizIntroDescription: "Answer a few short questions to understand your dominant approach to learning and working. This quick quiz can help you identify environments and strategies where you might thrive.",
    startQuizButton: "Start Style Discovery Quiz",
    nextButton: "Next Question",
    seeResultsButton: "See My Style",
    retakeQuizButton: "Retake Quiz",
    questionProgress: "Question {current} of {total}",
    resultTitle: "Your Dominant Style:",
    styles: {
      analyticalTitle: "Analytical Thinker",
      analyticalDescription: "You excel at dissecting complex problems, focusing on logic, data, and systematic approaches. You value accuracy and thorough understanding.",
      creativeTitle: "Creative Explorer",
      creativeDescription: "You thrive on originality and innovation, often thinking outside the box. You enjoy experimenting and expressing new ideas.",
      collaborativeTitle: "Collaborative Leader",
      collaborativeDescription: "You're a people-person who values teamwork and harmony. You excel at motivating others and building consensus.",
      practicalTitle: "Practical Doer",
      practicalDescription: "You're results-oriented and hands-on, preferring to take action and see tangible outcomes. You value efficiency and common sense.",
      analytical: { descriptionKey: "analyticalDescription" },
      creative: { descriptionKey: "creativeDescription" },
      collaborative: { descriptionKey: "collaborativeDescription" },
      practical: { descriptionKey: "practicalDescription" }
    },
    comingSoon: "Quiz functionality is under development and will be available soon!",
  },
  my: {
    pageTitle: "ကိုယ်ရည်ကိုယ်သွေးနှင့် ကျွမ်းကျင်မှု အကဲဖြတ်ချက်များ",
    pageDescription: "သင်၏ အားသာချက်များ၊ ဦးစားပေးမှုများနှင့် ဖြစ်နိုင်ခြေရှိသော လမ်းကြောင်းများကို ပိုမိုနက်ရှိုင်းစွာ ထိုးထွင်းသိမြင်ပါ။",
    quizIntroTitle: "သင်၏ သင်ယူမှုနှင့် အလုပ်လုပ်ပုံစံကို ရှာဖွေပါ",
    quizIntroDescription: "သင်၏ သင်ယူမှုနှင့် အလုပ်လုပ်ပုံစံကို နားလည်ရန် မေးခွန်းအနည်းငယ်ကို ဖြေဆိုပါ။ ဤအမြန်စစ်ဆေးမှုသည် သင်တိုးတက်နိုင်သော ပတ်ဝန်းကျင်များနှင့် နည်းဗျူဟာများကို ဖော်ထုတ်ရန် ကူညီနိုင်ပါသည်။",
    startQuizButton: "ပုံစံရှာဖွေမှု စတင်ပါ",
    nextButton: "နောက်မေးခွန်း",
    seeResultsButton: "ကျွန်ုပ်၏ပုံစံကို ကြည့်ပါ",
    retakeQuizButton: "ထပ်မံဖြေဆိုပါ",
    questionProgress: "မေးခွန်း {current} / {total}",
    resultTitle: "သင်၏ အဓိက ပုံစံ:",
    styles: {
      analyticalTitle: "ခွဲခြမ်းစိတ်ဖြာတတ်သော တွေးခေါ်ရှင်",
      analyticalDescription: "သင်သည် ရှုပ်ထွေးသော ပြဿနာများကို ခွဲခြမ်းစိတ်ဖြာခြင်း၊ ယုတ္တိဗေဒ၊ အချက်အလက်များနှင့် စနစ်တကျ ချဉ်းကပ်မှုများကို အာရုံစိုက်ခြင်းတွင် ထူးချွန်သည်။ တိကျမှန်ကန်မှုနှင့် ပြည့်စုံသော နားလည်မှုကို တန်ဖိုးထားသည်။",
      creativeTitle: "တီထွင်ဖန်တီးနိုင်သော စူးစမ်းရှာဖွေသူ",
      creativeDescription: "သင်သည် မူလဖန်တီးမှုနှင့် ဆန်းသစ်တီထွင်မှုတွင် ရှင်သန်ပြီး ဘောင်အပြင်ဘက်တွင် မကြာခဏ တွေးခေါ်တတ်သည်။ စမ်းသပ်ခြင်းနှင့် အကြံဉာဏ်သစ်များ ဖော်ပြခြင်းကို နှစ်သက်သည်။",
      collaborativeTitle: "ပူးပေါင်းဆောင်ရွက်တတ်သော ခေါင်းဆောင်",
      collaborativeDescription: "သင်သည် အဖွဲ့လိုက်လုပ်ဆောင်မှုနှင့် သဟဇာတဖြစ်မှုကို တန်ဖိုးထားသော လူမှုဆက်ဆံရေးကောင်းမွန်သူတစ်ဦးဖြစ်သည်။ အခြားသူများကို လှုံ့ဆော်ခြင်းနှင့် သဘောတူညီမှုတည်ဆောက်ခြင်းတွင် ထူးချွန်သည်။",
      practicalTitle: "လက်တွေ့လုပ်ဆောင်တတ်သူ",
      practicalDescription: "သင်သည် ရလဒ်ကို ဦးတည်ပြီး လက်တွေ့လုပ်ဆောင်လိုသူဖြစ်ပြီး တိကျသောရလဒ်များကို မြင်တွေ့လိုသည်။ ထိရောက်မှုနှင့် လက်တွေ့ကျမှုကို တန်ဖိုးထားသည်။",
      analytical: { descriptionKey: "analyticalDescription" },
      creative: { descriptionKey: "creativeDescription" },
      collaborative: { descriptionKey: "collaborativeDescription" },
      practical: { descriptionKey: "practicalDescription" }
    },
    comingSoon: "စစ်ဆေးမှုလုပ်ဆောင်ချက်ကို ဖန်တီးနေဆဲဖြစ်ပြီး မကြာမီ ရရှိနိုင်ပါမည်!",
  }
};


type QuizState = 'not_started' | 'in_progress' | 'completed';

export default function PersonalityTestsClient() {
  const { language } = useLanguage();
  const t = personalityTestsPageTranslations[language];

  const [quizState, setQuizState] = useState<QuizState>('not_started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: StyleId }>({});
  const [resultStyle, setResultStyle] = useState<StyleOutcome | null>(null);

  const currentQuestion: QuizQuestion | undefined = quizQuestions[currentQuestionIndex];

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResultStyle(null);
    setQuizState('in_progress');
  };

  const handleAnswerSelect = (questionId: string, optionValue: StyleId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionValue }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate result
      const styleCounts: { [key in StyleId]?: number } = {};
      Object.values(answers).forEach(styleId => {
        styleCounts[styleId] = (styleCounts[styleId] || 0) + 1;
      });

      let dominantStyleId: StyleId = 'analytical'; // Default
      let maxCount = 0;
      for (const styleId in styleCounts) {
        if ((styleCounts[styleId as StyleId] || 0) > maxCount) {
          maxCount = styleCounts[styleId as StyleId] || 0;
          dominantStyleId = styleId as StyleId;
        }
      }
      
      const determinedStyle = styleOutcomes.find(s => s.id === dominantStyleId);
      setResultStyle(determinedStyle || styleOutcomes[0]); // Fallback to first style if not found
      setQuizState('completed');
    }
  };

  const progressPercentage = quizQuestions.length > 0 ? ((currentQuestionIndex + 1) / quizQuestions.length) * 100 : 0;

  if (quizState === 'not_started') {
    return (
      <div className="space-y-10 flex flex-col items-center">
        <section className="text-center max-w-2xl">
          <Lightbulb className="mx-auto h-16 w-16 text-primary mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-3">{t.quizIntroTitle}</h1>
          <p className="text-lg md:text-xl text-muted-foreground">{t.quizIntroDescription}</p>
        </section>
        <Button size="lg" onClick={handleStartQuiz} className="shadow-lg">
          {t.startQuizButton} <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
         <section className="w-full max-w-2xl mt-12">
            <Card className="bg-accent/10 border-accent/30 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center">
                <CheckCircle className="mr-3 h-6 w-6 text-accent" />
                {personalityTestsPageTranslations.en.pageTitle} {/* Using EN as key source */}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-base text-muted-foreground">{t.pageDescription}</p>
                 <p className="text-sm text-muted-foreground mt-3">
                    Note: This is a simplified illustrative quiz. For a comprehensive personality assessment like MBTI (e.g., ENFJ, INTP), further development is planned.
                </p>
            </CardContent>
            </Card>
      </section>
      </div>
    );
  }

  if (quizState === 'in_progress' && currentQuestion) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <Progress value={progressPercentage} className="w-full h-2 mb-3" />
            <CardTitle className="text-lg font-headline text-center">
              {t.questionProgress
                .replace('{current}', (currentQuestionIndex + 1).toString())
                .replace('{total}', quizQuestions.length.toString())}
            </CardTitle>
            <CardDescription className="text-xl text-center text-foreground pt-2 min-h-[60px]">
              {currentQuestion.text}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion.id]}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value as StyleId)}
              className="space-y-3"
            >
              {currentQuestion.options.map(option => (
                <Label
                  key={option.value}
                  htmlFor={`option-${currentQuestion.id}-${option.value}`}
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all
                    ${answers[currentQuestion.id] === option.value ? 'bg-primary/10 border-primary ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                >
                  <RadioGroupItem value={option.value} id={`option-${currentQuestion.id}-${option.value}`} />
                  <span>{option.text}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full text-lg py-3" 
              onClick={handleNextQuestion}
              disabled={!answers[currentQuestion.id]}
            >
              {currentQuestionIndex < quizQuestions.length - 1 ? t.nextButton : t.seeResultsButton}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizState === 'completed' && resultStyle) {
    const styleTitle = t.styles[resultStyle.titleKey as keyof typeof t.styles] as string;
    const styleDescription = t.styles[resultStyle.descriptionKey as keyof typeof t.styles] as string;

    return (
      <div className="max-w-xl mx-auto">
        <Card className="shadow-xl text-center">
          <CardHeader>
            <resultStyle.Icon className="mx-auto h-16 w-16 text-primary mb-3" />
            <CardTitle className="text-2xl font-headline">{t.resultTitle}</CardTitle>
            <CardDescription className="text-3xl font-bold text-accent pt-1">
              {styleTitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-foreground/90">{styleDescription}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full text-lg py-3" onClick={handleStartQuiz} variant="outline">
              <RotateCcw className="mr-2 h-5 w-5" /> {t.retakeQuizButton}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <p>Loading quiz or an unexpected state occurred...</p>; // Fallback
}
