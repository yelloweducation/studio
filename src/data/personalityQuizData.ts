
import type { LucideIcon } from 'lucide-react';
import { Brain, Palette, Users, Zap } from 'lucide-react'; // Example icons

export type StyleId = 'analytical' | 'creative' | 'collaborative' | 'practical';

export interface QuizOption {
  text: string;
  value: StyleId;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface StyleOutcome {
  id: StyleId;
  titleKey: keyof typeof personalityTestsPageTranslations.en.styles; // For translation
  descriptionKey: keyof typeof personalityTestsPageTranslations.en.styles[StyleId]['descriptionKey']; // For translation
  Icon: LucideIcon;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    text: "When facing a new complex problem, I first tend to:",
    options: [
      { text: "Break it down into smaller pieces and analyze the details.", value: 'analytical' },
      { text: "Brainstorm many different, even unconventional, ideas.", value: 'creative' },
      { text: "Discuss it with others to get different perspectives.", value: 'collaborative' },
      { text: "Look for a quick, hands-on way to start tackling it.", value: 'practical' },
    ],
  },
  {
    id: 'q2',
    text: "I learn best when I can:",
    options: [
      { text: "Understand the underlying logic and theory.", value: 'analytical' },
      { text: "Experiment and try new things on my own.", value: 'creative' },
      { text: "Work with others and share insights.", value: 'collaborative' },
      { text: "Apply the information to real-world scenarios.", value: 'practical' },
    ],
  },
  {
    id: 'q3',
    text: "In a group project, I'm most likely to be the one who:",
    options: [
      { text: "Ensures the plan is logical and well-structured.", value: 'analytical' },
      { text: "Comes up with innovative solutions or approaches.", value: 'creative' },
      { text: "Helps build consensus and keeps the team motivated.", value: 'collaborative' },
      { text: "Focuses on getting tasks done efficiently.", value: 'practical' },
    ],
  },
  {
    id: 'q4',
    text: "When making an important decision, I rely most on:",
    options: [
      { text: "Data, facts, and logical reasoning.", value: 'analytical' },
      { text: "My intuition and exploring novel possibilities.", value: 'creative' },
      { text: "The opinions and advice of trusted people.", value: 'collaborative' },
      { text: "What has proven to work effectively in the past.", value: 'practical' },
    ],
  },
  {
    id: 'q5',
    text: "I feel most energized by activities that involve:",
    options: [
      { text: "Deep thinking and problem-solving.", value: 'analytical' },
      { text: "Imagination and self-expression.", value: 'creative' },
      { text: "Connecting with and helping others.", value: 'collaborative' },
      { text: "Producing tangible results and achievements.", value: 'practical' },
    ],
  },
];

export const styleOutcomes: StyleOutcome[] = [
  {
    id: 'analytical',
    titleKey: 'analyticalTitle',
    descriptionKey: 'analyticalDescription',
    Icon: Brain,
  },
  {
    id: 'creative',
    titleKey: 'creativeTitle',
    descriptionKey: 'creativeDescription',
    Icon: Palette,
  },
  {
    id: 'collaborative',
    titleKey: 'collaborativeTitle',
    descriptionKey: 'collaborativeDescription',
    Icon: Users,
  },
  {
    id: 'practical',
    titleKey: 'practicalTitle',
    descriptionKey: 'practicalDescription',
    Icon: Zap,
  },
];

// Helper type for translations
export type PersonalityTestsTranslations = {
  en: {
    pageTitle: string;
    pageDescription: string;
    quizIntroTitle: string;
    quizIntroDescription: string;
    startQuizButton: string;
    nextButton: string;
    seeResultsButton: string;
    retakeQuizButton: string;
    questionProgress: string; // e.g., "Question {current} of {total}"
    resultTitle: string;
    styles: {
      analyticalTitle: string;
      analyticalDescription: string;
      creativeTitle: string;
      creativeDescription: string;
      collaborativeTitle: string;
      collaborativeDescription: string;
      practicalTitle: string;
      practicalDescription: string;
      [key: string]: string | {descriptionKey: string}; // Index signature for dynamic access
    };
    comingSoon: string; // For initial toast, can be removed later
  };
  my: {
    pageTitle: string;
    pageDescription: string;
    quizIntroTitle: string;
    quizIntroDescription: string;
    startQuizButton: string;
    nextButton: string;
    seeResultsButton: string;
    retakeQuizButton: string;
    questionProgress: string;
    resultTitle: string;
    styles: {
      analyticalTitle: string;
      analyticalDescription: string;
      creativeTitle: string;
      creativeDescription: string;
      collaborativeTitle: string;
      collaborativeDescription: string;
      practicalTitle: string;
      practicalDescription: string;
      [key: string]: string | {descriptionKey: string}; // Index signature for dynamic access
    };
    comingSoon: string;
  };
};
// This type is duplicated from personality-tests-client.tsx, ideally it would be shared.
// For now, defining it here to ensure type safety for keys.
// In a real app, these would be centralized (e.g. i18next structure).
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
      // Added type assertion here for dynamic access in the component
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
      // Added type assertion here for dynamic access in the component
      analytical: { descriptionKey: "analyticalDescription" },
      creative: { descriptionKey: "creativeDescription" },
      collaborative: { descriptionKey: "collaborativeDescription" },
      practical: { descriptionKey: "practicalDescription" }
    },
    comingSoon: "စစ်ဆေးမှုလုပ်ဆောင်ချက်ကို ဖန်တီးနေဆဲဖြစ်ပြီး မကြာမီ ရရှိနိုင်ပါမည်!",
  }
};
