
"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lightbulb, ArrowRight, ArrowLeft, RotateCcw, ListChecks, BarChartHorizontalBig, SearchCode, Medal, Brain, type LucideIcon, Loader2, AlertTriangle, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import {
  mbtiQuizQuestionsLikert,
  mbtiTypesInfo,
  mbtiLikertChoices,
  type MbtiTypeInfo,
  type MbtiQuestionLikert,
  type DichotomyLetter,
  type PersonalityTestsTranslations, // Import the main translation type
} from '@/data/personalityQuizData';
import * as LucideIcons from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
// Import the server action
import { serverSubmitMbtiResult } from '@/actions/personalityTestActions';

// Placeholder for translations - user will need to fill this in personalityQuizData.ts
const getFullTranslations = (): PersonalityTestsTranslations => {
  // In a real scenario, this might fetch from a JSON or be directly in personalityQuizData.ts
  // For now, returning a structure with some English defaults and expecting user to fill
  return {
    en: {
      pageTitle: "Personality & Skill Assessments",
      pageDescription: "Discover your unique strengths and how they align with various career paths.",
      quizIntroTitle: "Understand Your Personality Type",
      quizIntroDescription: "This quiz helps you understand your preferences. Answer honestly to get the most accurate insights.",
      startQuizButton: "Start Personality Quiz",
      nextButton: "Next",
      backButton: "Back",
      submitButton: "Submit & See My Type",
      seeResultsButton: "See My Type",
      retakeQuizButton: "Retake Quiz",
      questionProgress: "Question {current} of {total}",
      resultTitle: "Your Personality Type:",
      shareResultButton: "Share Result",
      shareResultText: "I discovered I'm an {type} - {title}! Find out your type: {url}",
      likertStronglyDisagree: "Strongly Disagree",
      likertDisagree: "Disagree",
      likertNeutral: "Neutral",
      likertAgree: "Agree",
      likertStronglyAgree: "Strongly Agree",
      analystsGroup: "Analysts", diplomatsGroup: "Diplomats", sentinelsGroup: "Sentinels", explorersGroup: "Explorers",
      intjTitle: "INTJ - The Architect", intpTitle: "INTP - The Logician", entjTitle: "ENTJ - The Commander", entpTitle: "ENTP - The Debater",
      infjTitle: "INFJ - The Advocate", infpTitle: "INFP - The Mediator", enfjTitle: "ENFJ - The Protagonist", enfpTitle: "ENFP - The Campaigner",
      istjTitle: "ISTJ - The Logistician", isfjTitle: "ISFJ - The Defender", estjTitle: "ESTJ - The Executive", esfjTitle: "ESFJ - The Consul",
      istpTitle: "ISTP - The Virtuoso", isfpTitle: "ISFP - The Adventurer", estpTitle: "ESTP - The Entrepreneur", esfpTitle: "ESFP - The Entertainer",
      intjDescription: "Strategic thinkers, with a plan for everything.", intpDescription: "Inventors with a thirst for knowledge.", entjDescription: "Bold, strong-willed leaders.", entpDescription: "Smart, curious, love challenges.",
      infjDescription: "Quiet, mystical, inspiring idealists.", infpDescription: "Poetic, kind, altruistic people.", enfjDescription: "Charismatic, inspiring leaders.", enfpDescription: "Enthusiastic, creative, sociable.",
      istjDescription: "Practical, fact-minded, reliable.", isfjDescription: "Dedicated, warm protectors.", estjDescription: "Excellent administrators, manage things/people.", esfjDescription: "Caring, social, popular people.",
      istpDescription: "Bold, practical experimenters.", isfpDescription: "Flexible, charming artists.", estpDescription: "Smart, energetic, perceptive.", esfpDescription: "Spontaneous, energetic, enthusiastic.",
      characteristicsSectionTitle: "Key Characteristics",
      intjCharacteristics: "Strategic;Independent;Decisive", intpCharacteristics: "Analytical;Curious;Objective", entjCharacteristics: "Leaderly;Confident;Efficient", entpCharacteristics: "Inventive;Enthusiastic;Resourceful",
      infjCharacteristics: "Insightful;Principled;Compassionate", infpCharacteristics: "Idealistic;Empathetic;Creative", enfjCharacteristics: "Charismatic;Persuasive;Altruistic", enfpCharacteristics: "Imaginative;Energetic;Sociable",
      istjCharacteristics: "Responsible;Dependable;Detail-oriented", isfjCharacteristics: "Supportive;Loyal;Considerate", estjCharacteristics: "Organized;Decisive;Direct", esfjCharacteristics: "Caring;Sociable;Harmonious",
      istpCharacteristics: "Adaptable;Independent;Analytical", isfpCharacteristics: "Artistic;Gentle;Flexible", estpCharacteristics: "Energetic;Pragmatic;Outgoing", esfpCharacteristics: "Lively;Spontaneous;Friendly",
      careerPathSectionTitle: "Suggested Career Paths",
      intjCareers: "Scientist;Engineer;Strategist", intpCareers: "Software Developer;Researcher;Philosopher", entjCareers: "CEO;Entrepreneur;Manager", entpCareers: "Innovator;Entrepreneur;Lawyer",
      infjCareers: "Counselor;Psychologist;Writer", infpCareers: "Author;Artist;Counselor", enfjCareers: "Teacher;HR Manager;Event Planner", enfpCareers: "Journalist;Marketing Manager;Actor",
      istjCareers: "Accountant;Project Manager;Logistics Coordinator", isfjCareers: "Nurse;Teacher;Social Worker", estjCareers: "Manager;Business Administrator;Police Officer", esfjCareers: "Teacher;Healthcare Provider;Event Coordinator",
      istpCareers: "Mechanic;Engineer;Pilot", isfpCareers: "Artist;Musician;Fashion Designer", estpCareers: "Salesperson;Entrepreneur;Paramedic", esfpCareers: "Performer;Event Planner;Tour Guide",
      q_ei1_text: "I prefer to spend my free time actively engaging with a large group of friends or new acquaintances.", q_ei2_text: "I find solitude and quiet time essential for recharging my energy.",
      q_sn1_text: "When making decisions, I rely more on concrete facts and past experiences.", q_sn2_text: "I often trust my intuition and focus on the underlying patterns and future possibilities.",
      q_tf1_text: "I value fairness and logical consistency above maintaining harmony in a group.", q_tf2_text: "I prioritize empathy and considering others' feelings when making decisions, even if it's less efficient.",
      q_jp1_text: "I like to have things planned out and prefer a structured, organized approach to tasks.", q_jp2_text: "I enjoy being spontaneous and flexible, adapting to new situations as they arise.",
      submittingResults: "Submitting your results...", submissionSuccess: "Results submitted successfully!", submissionError: "Failed to submit results. Please try again.", errorCalculatingType: "Error calculating personality type.",
      recentCompletionsTitle: "Recent Quiz Completions", historyUser: "User", historyStyle: "Type", historyDate: "Date", noHistory: "No quiz completions recorded yet.", possibleTypesTitle: "Possible Personality Types",
    },
    my: { // Minimal Myanmar stubs, user to complete these.
      pageTitle: "ကိုယ်ရည်ကိုယ်သွေး စစ်ဆေးမှု", pageDescription: "သင်၏ အားသာချက်များကို ရှာဖွေပါ။",
      quizIntroTitle: "သင်၏ ကိုယ်ရည်ကိုယ်သွေးကို နားလည်ပါ", quizIntroDescription: "ဤစစ်ဆေးမှုသည် သင့်အား ကူညီပေးပါလိမ့်မည်။",
      startQuizButton: "စတင်ပါ", nextButton: "နောက်တစ်ခု", backButton: "နောက်သို့", submitButton: "တင်သွင်းပြီး အမျိုးအစားကြည့်ရန်", seeResultsButton: "အမျိုးအစားကြည့်ရန်", retakeQuizButton: "ထပ်မံဖြေဆိုပါ",
      questionProgress: "မေးခွန်း {current} / {total}", resultTitle: "သင်၏ ကိုယ်ရည်ကိုယ်သွေး:",
      shareResultButton: "မျှဝေမည်", shareResultText: "ကျွန်ုပ် {type} - {title} ဖြစ်သည်ကို ရှာဖွေတွေ့ရှိခဲ့သည်! သင်၏အမျိုးအစားကို ရှာဖွေပါ: {url}",
      likertStronglyDisagree: "လုံးဝ သဘောမတူပါ", likertDisagree: "သဘောမတူပါ", likertNeutral: "ကြားနေ", likertAgree: "သဘောတူပါ", likertStronglyAgree: "လုံးဝ သဘောတူပါ",
      analystsGroup: "သုံးသပ်သူများ", diplomatsGroup: "သံတမန်များ", sentinelsGroup: "အစောင့်အရှောက်များ", explorersGroup: "စူးစမ်းရှာဖွေသူများ",
      intjTitle: "INTJ - ဗိသုကာ", intpTitle: "INTP - ယုတ္တိပညာရှင်", entjTitle: "ENTJ - တပ်မှူး", entpTitle: "ENTP - အငြင်းအခုံသမား",
      infjTitle: "INFJ - ထောက်ခံသူ", infpTitle: "INFP - ဖျန်ဖြေသူ", enfjTitle: "ENFJ - အဓိကဇာတ်ဆောင်", enfpTitle: "ENFP - လှုံ့ဆော်သူ",
      istjTitle: "ISTJ - ထောက်ပံ့ပို့ဆောင်ရေးသမား", isfjTitle: "ISFJ - ကာကွယ်သူ", estjTitle: "ESTJ - အုပ်ချုပ်ရေးမှူး", esfjTitle: "ESFJ - အတိုင်ပင်ခံ",
      istpTitle: "ISTP - ကျွမ်းကျင်သူ", isfpTitle: "ISFP - စွန့်စားသူ", estpTitle: "ESTP - စီးပွားရေးလုပ်ငန်းရှင်", esfpTitle: "ESFP - ဖျော်ဖြေသူ",
      intjDescription: "မဟာဗျူဟာကျသော တွေးခေါ်ရှင်။", intpDescription: "ဗဟုသုတကို ရှာဖွေသူ။", entjDescription: "ရဲရင့်သော ခေါင်းဆောင်။", entpDescription: "ဉာဏ်ကောင်းပြီး စူးစမ်းလိုစိတ်ရှိသူ။",
      infjDescription: "တိတ်ဆိတ်ပြီး နက်နဲသူ။", infpDescription: "ကဗျာဆန်ပြီး ကြင်နာသူ။", enfjDescription: "ဆွဲဆောင်မှုရှိသော ခေါင်းဆောင်။", enfpDescription: "စိတ်အားထက်သန်ပြီး ဖန်တီးနိုင်စွမ်းရှိသူ။",
      istjDescription: "လက်တွေ့ကျပြီး ယုံကြည်ရသူ။", isfjDescription: "နွေးထွေးသော ကာကွယ်သူ။", estjDescription: "ထူးချွန်သော အုပ်ချုပ်သူ။", esfjDescription: "ဂရုစိုက်တတ်ပြီး ဖော်ရွေသူ။",
      istpDescription: "ရဲရင့်ပြီး လက်တွေ့ကျသူ။", isfpDescription: "ပြောင်းလွယ်ပြီး ဆွဲဆောင်မှုရှိသူ။", estpDescription: "ဥာဏ်ကောင်းပြီး တက်ကြွသူ။", esfpDescription: "တက်ကြွပြီး ပျော်ပျော်နေတတ်သူ။",
      characteristicsSectionTitle: "အဓိက လက္ခဏာများ",
      intjCharacteristics: "မဟာဗျူဟာကျ;လွတ်လပ်;ဆုံးဖြတ်ချက်ပြတ်သား", intpCharacteristics: "ခွဲခြမ်းစိတ်ဖြာ;စူးစမ်း;ဓမ္မဓိဋ္ဌာန်ကျ", entjCharacteristics: "ခေါင်းဆောင်မှု;ယုံကြည်မှုရှိ;ထိရောက်", entpCharacteristics: "တီထွင်;စိတ်အားထက်သန်;ပြဿနာဖြေရှင်း",
      infjCharacteristics: "ထိုးထွင်းသိမြင်;ကိုယ်ကျင့်တရားရှိ;ကရုဏာကြီး", infpCharacteristics: "စိတ်ကူးယဉ်;စာနာ;ဖန်တီးနိုင်စွမ်း", enfjCharacteristics: "ဆွဲဆောင်မှု;နားချတတ်;အများအကျိုးဆောင်", enfpCharacteristics: "စိတ်ကူးဉာဏ်ကြွယ်ဝ;တက်ကြွ;ဖော်ရွေ",
      istjCharacteristics: "တာဝန်ယူ;ယုံကြည်ရ;အသေးစိတ်ဂရုပြု", isfjCharacteristics: "ပံ့ပိုး;သစ္စာရှိ;ထောက်ထားစာနာ", estjCharacteristics: "စနစ်တကျ;ဆုံးဖြတ်ချက်ပြတ်သား;တိုက်ရိုက်", esfjCharacteristics: "ဂရုစိုက်;ဖော်ရွေ;သဟဇာတ",
      istpCharacteristics: "လိုက်လျောညီထွေ;လွတ်လပ်;ခွဲခြမ်းစိတ်ဖြာ", isfpCharacteristics: "အနုပညာဆန်;နူးညံ့;ပြောင်းလွယ်", estpCharacteristics: "တက်ကြွ;လက်တွေ့ကျ;ဖော်ရွေ", esfpCharacteristics: "တက်ကြွ;အလိုအလျောက်;ဖော်ရွေ",
      careerPathSectionTitle: "အကြံပြုထားသော အသက်မွေးဝမ်းကျောင်း လမ်းကြောင်းများ",
      intjCareers: "သိပ္ပံပညာရှင်;အင်ဂျင်နီယာ;မဟာဗျူဟာမှူး", intpCareers: "ဆော့ဖ်ဝဲရေးဆွဲသူ;သုတေသီ;ဒဿနပညာရှင်", entjCareers: "စီအီးအို;စီးပွားရေးလုပ်ငန်းရှင်;မန်နေဂျာ", entpCareers: "ဆန်းသစ်တီထွင်သူ;စီးပွားရေးလုပ်ငန်းရှင်;ရှေ့နေ",
      infjCareers: "အတိုင်ပင်ခံ;စိတ်ပညာရှင်;စာရေးဆရာ", infpCareers: "စာရေးဆရာ;အနုပညာရှင်;အတိုင်ပင်ခံ", enfjCareers: "ဆရာ;လူ့စွမ်းအားမန်နေဂျာ;ပွဲစီစဉ်သူ", enfpCareers: "သတင်းထောက်;စျေးကွက်မန်နေဂျာ;သရုပ်ဆောင်",
      istjCareers: "စာရင်းကိုင်;ပရောဂျက်မန်နေဂျာ;ထောက်ပံ့ပို့ဆောင်ရေး", isfjCareers: "သူနာပြု;ဆရာ;လူမှုဝန်ထမ်း", estjCareers: "မန်နေဂျာ;စီးပွားရေးအုပ်ချုပ်သူ;ရဲအရာရှိ", esfjCareers: "ဆရာ;ကျန်းမာရေးဝန်ထမ်း;ပွဲညှိနှိုင်းရေးမှူး",
      istpCareers: "စက်ပြင်ဆရာ;အင်ဂျင်နီယာ;လေယာဉ်မှူး", isfpCareers: "အနုပညာရှင်;ဂီတပညာရှင်;ဖက်ရှင်ဒီဇိုင်နာ", estpCareers: "အရောင်းသမား;စီးပွားရေးလုပ်ငန်းရှင်;အရေးပေါ်ဆေးဝန်ထမ်း", esfpCareers: "ဖျော်ဖြေသူ;ပွဲစီစဉ်သူ;ခရီးသွားလမ်းညွှန်",
      q_ei1_text: "အားလပ်ချိန်တွင် လူအများအပြား သို့မဟုတ် မိတ်ဆွေသစ်များနှင့် တက်ကြွစွာ ပေါင်းသင်းဆက်ဆံလိုပါသည်။", q_ei2_text: "တိတ်ဆိတ်ငြိမ်သက်သောအချိန်သည် ကျွန်ုပ်၏စွမ်းအင်ကို ပြန်လည်ဖြည့်တင်းရန်အတွက် မရှိမဖြစ်လိုအပ်သည်ဟု တွေ့ရှိရပါသည်။",
      q_sn1_text: "ဆုံးဖြတ်ချက်ချသည့်အခါ လက်တွေ့အချက်အလက်များနှင့် ယခင်အတွေ့အကြုံများကို ပိုမိုအားကိုးပါသည်။", q_sn2_text: "ကျွန်ုပ်သည် ကျွန်ုပ်၏ပင်ကိုယ်အသိစိတ်ကို မကြာခဏယုံကြည်ပြီး အရင်းခံပုံစံများနှင့် အနာဂတ်ဖြစ်နိုင်ခြေများကို အာရုံစိုက်လေ့ရှိပါသည်။",
      q_tf1_text: "အဖွဲ့အတွင်း သဟဇာတဖြစ်မှုကို ထိန်းသိမ်းခြင်းထက် တရားမျှတမှုနှင့် ယုတ္တိကျသော တသမတ်တည်းဖြစ်မှုကို ပိုတန်ဖိုးထားပါသည်။", q_tf2_text: "ထိရောက်မှုနည်းပါးစေကာမူ ဆုံးဖြတ်ချက်ချသည့်အခါ အခြားသူများ၏ စိတ်ခံစားချက်ကို စာနာထောက်ထားခြင်းနှင့် ထည့်သွင်းစဉ်းစားခြင်းကို ဦးစားပေးပါသည်။",
      q_jp1_text: "အလုပ်များကို စီစဉ်ထားပြီး စနစ်တကျချဉ်းကပ်လိုပါသည်။", q_jp2_text: "အခြေအနေသစ်များ ပေါ်ပေါက်လာသည်နှင့်အမျှ လိုက်လျောညီထွေစွာ ပြုမူခြင်းဖြင့် ပေါ့ပေါ့ပါးပါး နေထိုင်လိုပါသည်။",
      submittingResults: "ရလဒ်များ တင်သွင်းနေသည်...", submissionSuccess: "ရလဒ်များ အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ!", submissionError: "ရလဒ်များ တင်သွင်းရန် မအောင်မြင်ပါ။ ထပ်မံကြိုးစားပါ။", errorCalculatingType: "ကိုယ်ရည်ကိုယ်သွေး အမျိုးအစား တွက်ချက်ရာတွင် အမှားအယွင်း ဖြစ်ပေါ်နေပါသည်။",
      recentCompletionsTitle: "မကြာသေးမီက ဖြေဆိုမှုများ", historyUser: "အသုံးပြုသူ", historyStyle: "အမျိုးအစား", historyDate: "ရက်စွဲ", noHistory: "ဖြေဆိုမှု မှတ်တမ်း မရှိသေးပါ။", possibleTypesTitle: "ဖြစ်နိုင်သော ကိုယ်ရည်ကိုယ်သွေး အမျိုးအစားများ",
    }
  };
};


type QuizState = 'not_started' | 'in_progress' | 'completed';
type AnswersState = Record<number, number>; // questionId: likertValue

const getLucideIcon = (iconName?: string): LucideIcon => {
  if (iconName && iconName in LucideIcons) {
    return LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
  }
  return Brain; // Default icon
};

export default function PersonalityTestsClient() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const allTranslations = getFullTranslations(); // Get all translations
  const t = allTranslations[language]; // Use the current language

  const [quizState, setQuizState] = useState<QuizState>('not_started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [determinedTypeInfo, setDeterminedTypeInfo] = useState<MbtiTypeInfo | null>(null);
  const [finalScores, setFinalScores] = useState<Record<DichotomyLetter, number> | null>(null);
  const [isSubmittingToDb, setIsSubmittingToDb] = useState(false);

  const questions = mbtiQuizQuestionsLikert; // Using the sample set

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setDeterminedTypeInfo(null);
    setFinalScores(null);
    setQuizState('in_progress');
  };

  const handleAnswerSelect = (questionId: number, likertValue: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: likertValue }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResults = async () => {
    const scores: Record<DichotomyLetter, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    questions.forEach(q => {
      const answerValue = answers[q.id];
      if (answerValue === undefined) return; // Skip unanswered

      let effectiveScore = answerValue;
      if (q.reverse_scored) {
        effectiveScore *= -1;
      }
      
      // Add score to the specific trait of the dimension
      // Example: if q.trait is 'E', add to 'E'. If q.trait is 'I', add to 'I'.
      scores[q.trait] = (scores[q.trait] || 0) + effectiveScore;
    });

    setFinalScores(scores);

    let mbtiResult = "";
    mbtiResult += scores.E >= scores.I ? "E" : "I";
    mbtiResult += scores.S >= scores.N ? "S" : "N";
    mbtiResult += scores.T >= scores.F ? "T" : "F";
    mbtiResult += scores.J >= scores.P ? "J" : "P";
    
    const foundType = mbtiTypesInfo.find(type => type.type === mbtiResult);
    if (foundType) {
      setDeterminedTypeInfo(foundType);
      setQuizState('completed');
      
      // Submit to DB
      setIsSubmittingToDb(true);
      try {
        const submissionData = {
          mbti_type: foundType.type,
          score_breakdown: {
            E: scores.E, I: scores.I,
            S: scores.S, N: scores.N,
            T: scores.T, F: scores.F,
            J: scores.J, P: scores.P,
          },
          userId: user?.id || undefined,
        };
        await serverSubmitMbtiResult(submissionData);
        toast({ title: t.submissionSuccess });
      } catch (error) {
        console.error("Error submitting MBTI results:", error);
        toast({ title: t.submissionError, variant: "destructive" });
      } finally {
        setIsSubmittingToDb(false);
      }

    } else {
      console.error("Could not determine MBTI type for scores:", scores);
      toast({ title: t.errorCalculatingType, variant: "destructive"});
      setQuizState('not_started'); // Or some error state
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  
  const getTranslatedText = (key: keyof PersonalityTestsTranslations['en'] | undefined, replacements?: Record<string, string | number>): string => {
    if (!key || !t[key]) return key || ""; // Fallback to key if not found
    let text = t[key] as string;
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, String(value));
      });
    }
    return text;
  };

  const getTranslatedArray = (key: keyof PersonalityTestsTranslations['en'] | undefined): string[] => {
    if (!key || !t[key]) return [];
    const entry = t[key] as string; // Assuming translations are semi-colon separated strings
    return entry.split(';').map(s => s.trim()).filter(s => s.length > 0);
  };
  
  const handleShare = () => {
    if (determinedTypeInfo && typeof window !== 'undefined') {
      const typeTitle = getTranslatedText(determinedTypeInfo.titleKey);
      const shareText = getTranslatedText('shareResultText', {
        type: determinedTypeInfo.type,
        title: typeTitle,
        url: window.location.href
      });
      navigator.clipboard.writeText(shareText)
        .then(() => toast({ title: "Result Copied!", description: "Link and text copied to clipboard." }))
        .catch(() => toast({ title: "Copy Failed", description: "Could not copy result to clipboard.", variant: "destructive" }));
    }
  };


  if (quizState === 'not_started') {
    return (
      <div className="space-y-8 md:space-y-10 flex flex-col items-center pb-8 px-4">
        <section className="text-center max-w-2xl pt-4 md:pt-0">
          <Medal className="mx-auto h-10 w-10 md:h-12 md:w-12 text-primary mb-2 md:mb-3" />
          <h1 className="text-xl md:text-2xl font-bold font-headline mb-1 md:mb-2">{t.quizIntroTitle}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{t.quizIntroDescription}</p>
        </section>
        <Button size="lg" onClick={handleStartQuiz} className="shadow-lg text-base py-2.5">
          {t.startQuizButton} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Separator className="my-6 md:my-8 w-full max-w-3xl" />
        <section className="w-full max-w-4xl mt-10 md:mt-12">
          <h2 className="text-xl md:text-2xl font-bold font-headline mb-4 md:mb-6 text-center flex items-center justify-center">
            <ListChecks className="mr-2 md:mr-3 h-6 w-6 text-primary" />
            {t.possibleTypesTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {mbtiTypesInfo.map(typeInfo => {
              const TypeIcon = getLucideIcon(typeInfo.iconName);
              return (
                <Card key={typeInfo.type} className="shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center p-3">
                  <TypeIcon className="h-7 w-7 md:h-8 md:w-8 text-accent mb-1.5" />
                  <CardTitle className="text-sm md:text-base font-semibold">{typeInfo.type}</CardTitle>
                  <CardDescription className="text-xs md:text-sm text-muted-foreground leading-tight">{getTranslatedText(typeInfo.titleKey)}</CardDescription>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">({getTranslatedText(typeInfo.groupKey)})</p>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  if (quizState === 'in_progress' && currentQuestion) {
    return (
      <div className="max-w-md md:max-w-lg mx-auto px-2">
        <Card className="shadow-xl">
          <CardHeader>
            <Progress value={progressPercentage} className="w-full h-1.5 md:h-2 mb-2 md:mb-3" />
            <CardTitle className="text-xs md:text-sm font-headline text-center text-muted-foreground">
              {getTranslatedText('questionProgress', {current: currentQuestionIndex + 1, total: questions.length})}
            </CardTitle>
            <CardDescription className="text-md md:text-lg text-center text-foreground pt-1.5 md:pt-2 min-h-[60px] md:min-h-[70px]">
              {getTranslatedText(currentQuestion.textKey)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 md:space-y-3">
            {mbtiLikertChoices.map(choice => (
              <Button
                key={choice.value}
                variant={answers[currentQuestion.id] === choice.value ? "default" : "outline"}
                className={cn("w-full justify-start text-left h-auto py-2.5 px-3.5 md:py-3 md:px-4 text-sm md:text-base leading-snug",
                  answers[currentQuestion.id] === choice.value && "ring-2 ring-primary shadow-md"
                )}
                onClick={() => handleAnswerSelect(currentQuestion.id, choice.value)}
              >
                {getTranslatedText(choice.labelKey)}
              </Button>
            ))}
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentQuestionIndex === 0}
              className="text-sm md:text-base py-2 md:py-2.5"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> {t.backButton}
            </Button>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={answers[currentQuestion.id] === undefined}
                className="text-sm md:text-base py-2 md:py-2.5"
              >
                {t.nextButton} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={calculateResults}
                disabled={answers[currentQuestion.id] === undefined || isSubmittingToDb}
                className="text-sm md:text-base py-2 md:py-2.5"
              >
                {isSubmittingToDb ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1.5 h-4 w-4" />}
                {isSubmittingToDb ? t.submittingResults : t.submitButton}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizState === 'completed' && determinedTypeInfo) {
    const ResultIcon = getLucideIcon(determinedTypeInfo.iconName);
    const typeTitle = getTranslatedText(determinedTypeInfo.titleKey);
    const typeGroup = getTranslatedText(determinedTypeInfo.groupKey);
    const typeDescription = getTranslatedText(determinedTypeInfo.descriptionKey);
    const characteristics = getTranslatedArray(determinedTypeInfo.characteristicsKey);
    const careers = getTranslatedArray(determinedTypeInfo.careerSuggestionsKey);

    return (
      <div className="max-w-xl md:max-w-2xl mx-auto px-2 pb-10">
        <Card className="shadow-xl text-center">
          <CardHeader>
            <ResultIcon className="mx-auto h-10 w-10 md:h-12 md:w-12 text-primary mb-1.5 md:mb-2" />
            <CardTitle className="text-lg md:text-xl font-headline text-muted-foreground">{t.resultTitle}</CardTitle>
            <CardDescription className="text-2xl md:text-3xl font-bold text-accent pt-0.5">
              {determinedTypeInfo.type} - {typeTitle}
            </CardDescription>
            <p className="text-sm text-muted-foreground">({typeGroup})</p>
          </CardHeader>
          <CardContent className="text-left space-y-5 px-4 md:px-6">
            <p className="text-sm md:text-base text-foreground/90 leading-relaxed">{typeDescription}</p>
            
            <div>
              <h3 className="text-md md:text-lg font-semibold mb-2 flex items-center text-primary">
                <BarChartHorizontalBig className="mr-2 h-5 w-5"/>{t.characteristicsSectionTitle}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 pl-3">
                {characteristics.map((char, idx) => <li key={idx}>{char}</li>)}
                {characteristics.length === 0 && <li>Characteristics will be listed here.</li>}
              </ul>
            </div>

            <div>
              <h3 className="text-md md:text-lg font-semibold mb-2 flex items-center text-primary">
                <SearchCode className="mr-2 h-5 w-5"/>{t.careerPathSectionTitle}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 pl-3">
                {careers.map((career, idx) => <li key={idx}>{career}</li>)}
                {careers.length === 0 && <li>Career suggestions will be listed here.</li>}
              </ul>
            </div>

            {/* Optional: Display score breakdown if needed for debugging or user interest */}
            {/* <details className="text-xs">
              <summary>Score Breakdown (Debug)</summary>
              <pre>{JSON.stringify(finalScores, null, 2)}</pre>
            </details> */}

          </CardContent>
          <CardFooter className="flex-col sm:flex-row gap-3 pt-5">
            <Button className="w-full sm:w-auto text-sm md:text-base py-2 md:py-2.5" onClick={handleStartQuiz} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" /> {t.retakeQuizButton}
            </Button>
            <Button className="w-full sm:w-auto text-sm md:text-base py-2 md:py-2.5" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" /> {t.shareResultButton}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">
      <AlertTriangle className="h-8 w-8 text-destructive mr-2" />
      <p className="text-destructive">An unexpected error occurred or quiz state is invalid.</p>
    </div>
  );
}

    