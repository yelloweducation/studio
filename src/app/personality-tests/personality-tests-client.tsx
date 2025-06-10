
"use client";
import React, { useState, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Brain, Palette, Users, Zap, CheckCircle, Lightbulb, ArrowRight, RotateCcw, HelpCircle, ListChecks, History, UserCircle, type LucideIcon } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth'; // Added for user identification
import { 
  initialQuizQuestions, 
  additionalQuizQuestions, 
  styleOutcomes, 
  type StyleId, 
  type StyleOutcome, 
  type QuizQuestion, 
  type PersonalityTestsTranslations, // Import the main translations type
  type TranslatedText,
  type QuizCompletionRecord // Import QuizCompletionRecord
} from '@/data/personalityQuizData';
import * as LucideIcons from 'lucide-react'; // For dynamic icon rendering
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const QUIZ_HISTORY_STORAGE_KEY = 'personalityQuizHistory';
const MAX_HISTORY_ITEMS = 10;


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
    askMoreQuestionsTitle: "Want a More Refined Result?",
    askMoreQuestionsDescription: `Answer ${additionalQuizQuestions.length} more questions to help us fine-tune your learning and working style profile.`,
    askMoreQuestionsConfirm: "Yes, Ask More Questions",
    askMoreQuestionsDecline: "No, Show My Results Now",
    possibleStylesTitle: "Possible Styles You Can Discover",
    recentCompletionsTitle: "Recent Quiz Completions",
    historyUser: "User",
    historyStyle: "Style",
    historyDate: "Date",
    noHistory: "No quiz completions recorded yet. Be the first!",
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
    askMoreQuestionsTitle: "ပိုမိုတိကျသော ရလဒ်ကို လိုချင်ပါသလား။",
    askMoreQuestionsDescription: `သင်၏ သင်ယူမှုနှင့် အလုပ်လုပ်ပုံစံကို ပိုမိုတိကျစေရန် နောက်ထပ် မေးခွန်း ${additionalQuizQuestions.length} ခု ဖြေဆိုပေးပါ။`,
    askMoreQuestionsConfirm: "ဟုတ်ကဲ့၊ နောက်ထပ်မေးခွန်းများ မေးပါ",
    askMoreQuestionsDecline: "မဟုတ်ပါ၊ ကျွန်ုပ်၏ရလဒ်များကို ယခုပြပါ",
    possibleStylesTitle: "သင်ရှာဖွေတွေ့ရှိနိုင်သော ပုံစံများ",
    recentCompletionsTitle: "မကြာသေးမီက ပြီးဆုံးခဲ့သော စစ်ဆေးမှုများ",
    historyUser: "အသုံးပြုသူ",
    historyStyle: "ပုံစံ",
    historyDate: "ရက်စွဲ",
    noHistory: "စစ်ဆေးမှု ပြီးဆုံးခြင်း မှတ်တမ်း မရှိသေးပါ။ ပထမဆုံးဖြစ်လိုက်ပါ။",
  }
};

type QuizState = 'not_started' | 'in_progress_initial' | 'asking_for_more' | 'in_progress_additional' | 'completed';

const getLucideIcon = (iconName?: string): LucideIcon => {
  if (iconName && iconName in LucideIcons) {
    return LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
  }
  return HelpCircle; // Default icon
};

const asteriskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!domain) return "Invalid Email"; // Should not happen with valid emails

  if (localPart.length <= 4) {
    return `${localPart.substring(0,1)}${"*".repeat(Math.max(0, localPart.length -1))}@${domain}`;
  }
  return `${localPart.substring(0, 4)}${"*".repeat(localPart.length - 4)}@${domain}`;
};


export default function PersonalityTestsClient() {
  const { language } = useLanguage();
  const t = personalityTestsPageTranslations[language];
  const { user: loggedInUser } = useAuth();

  const [quizState, setQuizState] = useState<QuizState>('not_started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: StyleId }>({});
  const [resultStyle, setResultStyle] = useState<StyleOutcome | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizCompletionRecord[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem(QUIZ_HISTORY_STORAGE_KEY);
    if (storedHistory) {
      try {
        setQuizHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error("Failed to parse quiz history:", e);
        setQuizHistory([]);
      }
    }
  }, []);

  const getCurrentQuestionSet = () => {
    if (quizState === 'in_progress_initial') return initialQuizQuestions;
    if (quizState === 'in_progress_additional') return additionalQuizQuestions;
    return [];
  };

  const currentQuestionSet = getCurrentQuestionSet();
  const currentQuestion: QuizQuestion | undefined = currentQuestionSet[currentQuestionIndex];

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResultStyle(null);
    setQuizState('in_progress_initial');
  };

  const handleAnswerSelect = (questionId: string, optionValue: StyleId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionValue }));
  };

  const getTranslatedText = (textObj: TranslatedText): string => {
    return textObj[language] || textObj.en;
  };

  const getStyleDetailsById = (styleId: StyleId): StyleOutcome | undefined => {
    return styleOutcomes.find(s => s.id === styleId);
  };

  const calculateAndSetResults = () => {
    const styleCounts: { [key in StyleId]?: number } = {};
    Object.values(answers).forEach(styleId => {
      styleCounts[styleId] = (styleCounts[styleId] || 0) + 1;
    });

    let dominantStyleId: StyleId = 'analytical'; 
    let maxCount = 0;
    for (const styleId in styleCounts) {
      if ((styleCounts[styleId as StyleId] || 0) > maxCount) {
        maxCount = styleCounts[styleId as StyleId] || 0;
        dominantStyleId = styleId as StyleId;
      }
    }
    
    const determinedStyle = getStyleDetailsById(dominantStyleId);
    setResultStyle(determinedStyle || styleOutcomes[0]); // Fallback to first style if not found
    setQuizState('completed');

    // Save to history
    if (determinedStyle) {
      const userIdentifier = loggedInUser ? asteriskEmail(loggedInUser.email) : "Guest";
      // @ts-ignore // Accessing nested translation like this is okay if keys are consistent
      const styleTitle = t.styles[determinedStyle.titleKey as keyof typeof t.styles] || determinedStyle.titleKey;

      const newRecord: QuizCompletionRecord = {
        id: `hist-${Date.now()}`,
        userIdentifier,
        styleId: determinedStyle.id,
        styleTitle: styleTitle as string,
        styleIconName: determinedStyle.iconName,
        completedAt: new Date().toISOString(),
      };

      setQuizHistory(prevHistory => {
        const updatedHistory = [newRecord, ...prevHistory].slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(QUIZ_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestionSet.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (quizState === 'in_progress_initial' && additionalQuizQuestions.length > 0) {
        setQuizState('asking_for_more');
      } else {
        calculateAndSetResults();
      }
    }
  };

  const handleProceedWithAdditionalQuestions = () => {
    setCurrentQuestionIndex(0); 
    setQuizState('in_progress_additional');
  };

  const handleDeclineAdditionalQuestions = () => {
    calculateAndSetResults();
  };
  
  const totalQuestionsInCurrentSet = currentQuestionSet.length;
  const overallQuestionNumber = quizState === 'in_progress_initial' 
    ? currentQuestionIndex + 1
    : initialQuizQuestions.length + currentQuestionIndex + 1;
  
  const progressPercentage = totalQuestionsInCurrentSet > 0 
    ? ((currentQuestionIndex + 1) / totalQuestionsInCurrentSet) * 100 
    : 0;

  const PossibleStylesSection = () => (
    <section className="w-full max-w-3xl mt-10 md:mt-12">
      <h2 className="text-xl md:text-2xl font-bold font-headline mb-4 md:mb-6 text-center flex items-center justify-center">
        <ListChecks className="mr-2 md:mr-3 h-6 w-6 text-primary" />
        {t.possibleStylesTitle}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {styleOutcomes.map(style => {
          const StyleIcon = getLucideIcon(style.iconName);
           // @ts-ignore
          const title = t.styles[style.titleKey as keyof typeof t.styles] || style.titleKey;
           // @ts-ignore
          const descriptionKey = t.styles[style.id]?.descriptionKey as keyof typeof t.styles;
          const description = descriptionKey ? t.styles[descriptionKey] as string : "Description not found.";

          return (
            <Card key={style.id} className="shadow-md">
              <CardHeader className="flex flex-row items-center gap-3 pb-3">
                <StyleIcon className="h-8 w-8 text-accent" />
                <CardTitle className="text-lg md:text-xl font-semibold">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );

  const HistoryBoardSection = () => (
    <section className="w-full max-w-3xl mt-10 md:mt-12">
      <h2 className="text-xl md:text-2xl font-bold font-headline mb-4 md:mb-6 text-center flex items-center justify-center">
        <History className="mr-2 md:mr-3 h-6 w-6 text-primary" />
        {t.recentCompletionsTitle}
      </h2>
      {quizHistory.length > 0 ? (
        <ScrollArea className="h-72 border rounded-lg shadow-md">
          <div className="p-1 sm:p-2 md:p-3 space-y-2">
            {quizHistory.map(record => {
              const StyleIcon = getLucideIcon(record.styleIconName);
              return (
                <Card key={record.id} className="p-2 sm:p-3 bg-card hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <StyleIcon className="h-5 w-5 text-accent shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">{record.styleTitle}</p>
                        <p className="text-xs text-muted-foreground">{record.userIdentifier}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-left sm:text-right shrink-0">
                      {new Date(record.completedAt).toLocaleDateString(language === 'my' ? 'my-MM' : 'en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      ) : (
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center">
            <UserCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{t.noHistory}</p>
          </CardContent>
        </Card>
      )}
    </section>
  );


  if (quizState === 'not_started') {
    return (
      <div className="space-y-8 md:space-y-10 flex flex-col items-center pb-8">
        <section className="text-center max-w-2xl">
          <Lightbulb className="mx-auto h-10 w-10 md:h-12 md:w-12 text-primary mb-2 md:mb-3" />
          <h1 className="text-xl md:text-2xl font-bold font-headline mb-1 md:mb-2">{t.quizIntroTitle}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t.quizIntroDescription}</p>
        </section>
        <Button size="lg" onClick={handleStartQuiz} className="shadow-lg text-base py-2.5">
          {t.startQuizButton} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        <Separator className="my-6 md:my-8 w-full max-w-3xl" />
        <PossibleStylesSection />
        <Separator className="my-6 md:my-8 w-full max-w-3xl" />
        <HistoryBoardSection />
      </div>
    );
  }

  if (quizState === 'in_progress_initial' || quizState === 'in_progress_additional') {
    if (!currentQuestion) return <p>Loading question...</p>; 

    return (
      <div className="max-w-md md:max-w-lg mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <Progress value={progressPercentage} className="w-full h-1 md:h-1.5 mb-1.5 md:mb-2" />
            <CardTitle className="text-xs md:text-sm font-headline text-center text-muted-foreground">
              {t.questionProgress
                .replace('{current}', overallQuestionNumber.toString())
                .replace('{total}', (quizState === 'in_progress_initial' ? initialQuizQuestions.length : initialQuizQuestions.length + additionalQuizQuestions.length).toString())
              }
            </CardTitle>
            <CardDescription className="text-md md:text-lg text-center text-foreground pt-1 md:pt-1.5 min-h-[40px] md:min-h-[50px]">
              {getTranslatedText(currentQuestion.text)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion.id]}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value as StyleId)}
              className="space-y-2 md:space-y-2.5"
            >
              {currentQuestion.options.map(option => (
                <Label
                  key={option.value}
                  htmlFor={`option-${currentQuestion.id}-${option.value}`}
                  className={`flex items-center space-x-1.5 md:space-x-2 p-2.5 md:p-3 border rounded-md cursor-pointer transition-all text-xs leading-snug md:text-sm 
                    ${answers[currentQuestion.id] === option.value ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                >
                  <RadioGroupItem value={option.value} id={`option-${currentQuestion.id}-${option.value}`} />
                  <span className="leading-tight">{getTranslatedText(option.text)}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full text-sm md:text-base py-2 md:py-2.5" 
              onClick={handleNextQuestion}
              disabled={!answers[currentQuestion.id]}
            >
              {currentQuestionIndex < totalQuestionsInCurrentSet - 1 ? t.nextButton : 
                (quizState === 'in_progress_initial' && additionalQuizQuestions.length > 0 ? t.nextButton : t.seeResultsButton)
              }
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizState === 'asking_for_more') {
    return (
      <div className="max-w-md md:max-w-lg mx-auto">
        <Card className="shadow-xl text-center">
          <CardHeader>
            <HelpCircle className="mx-auto h-10 w-10 md:h-12 md:w-12 text-primary mb-1.5 md:mb-2" />
            <CardTitle className="text-lg md:text-xl font-headline">{t.askMoreQuestionsTitle}</CardTitle>
            <CardDescription className="text-sm md:text-base text-muted-foreground pt-0.5">
              {t.askMoreQuestionsDescription.replace(`${additionalQuizQuestions.length} more questions`, `${additionalQuizQuestions.length} ${language === 'my' ? 'ခု နောက်ထပ်မေးခွန်းများ' : 'more questions'}`)}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col sm:flex-row gap-1.5 md:gap-2">
            <Button className="w-full sm:flex-1 text-sm md:text-base py-2 md:py-2.5" onClick={handleProceedWithAdditionalQuestions}>
              {t.askMoreQuestionsConfirm}
            </Button>
            <Button className="w-full sm:flex-1 text-sm md:text-base py-2 md:py-2.5" variant="outline" onClick={handleDeclineAdditionalQuestions}>
              {t.askMoreQuestionsDecline}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizState === 'completed' && resultStyle) {
    const ResultIcon = getLucideIcon(resultStyle.iconName);
    // @ts-ignore
    const styleTitle = t.styles[resultStyle.titleKey as keyof typeof t.styles] || resultStyle.titleKey;
    // @ts-ignore
    const styleDescriptionKey = t.styles[resultStyle.id]?.descriptionKey as keyof typeof t.styles;
    const styleDescription = styleDescriptionKey ? t.styles[styleDescriptionKey] as string : "Description not found.";


    return (
      <div className="max-w-md md:max-w-lg mx-auto">
        <Card className="shadow-xl text-center">
          <CardHeader>
            <ResultIcon className="mx-auto h-10 w-10 md:h-12 md:w-12 text-primary mb-1.5 md:mb-2" />
            <CardTitle className="text-lg md:text-xl font-headline">{t.resultTitle}</CardTitle>
            <CardDescription className="text-xl md:text-2xl font-bold text-accent pt-0.5">
              {styleTitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm md:text-base text-foreground/90">{styleDescription}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full text-sm md:text-base py-2 md:py-2.5" onClick={handleStartQuiz} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" /> {t.retakeQuizButton}
            </Button>
          </CardFooter>
        </Card>
         <Separator className="my-6 md:my-8 w-full" />
        <HistoryBoardSection />
      </div>
    );
  }

  return <p>Loading quiz or an unexpected state occurred...</p>;
}
