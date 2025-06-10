
import type { LucideIcon } from 'lucide-react';
import { Brain, Palette, Users, Zap } from 'lucide-react';

export type StyleId = 'analytical' | 'creative' | 'collaborative' | 'practical';

export interface TranslatedText {
  en: string;
  my: string;
}

export interface QuizOption {
  text: TranslatedText;
  value: StyleId;
}

export interface QuizQuestion {
  id: string;
  text: TranslatedText;
  options: QuizOption[];
}

export interface StyleOutcome {
  id: StyleId;
  titleKey: keyof typeof personalityTestsPageTranslations.en.styles;
  descriptionKey: keyof typeof personalityTestsPageTranslations.en.styles[StyleId]['descriptionKey'];
  Icon: LucideIcon;
}

export const initialQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    text: {
      en: "When facing a new complex problem, I first tend to:",
      my: "ပြဿနာအသစ်တစ်ခုနှင့် ကြုံတွေ့ရသောအခါ၊ ကျွန်ုပ်သည် ပထမဆုံးအနေဖြင့်:",
    },
    options: [
      { text: { en: "Break it down into smaller pieces and analyze the details.", my: "အပိုင်းငယ်များခွဲ၍ အသေးစိတ်လေ့လာသုံးသပ်သည်။" }, value: 'analytical' },
      { text: { en: "Brainstorm many different, even unconventional, ideas.", my: "ထူးခြားဆန်းသစ်သော အတွေးအခေါ်အမျိုးမျိုးကို စဉ်းစားသည်။" }, value: 'creative' },
      { text: { en: "Discuss it with others to get different perspectives.", my: "အခြားသူများနှင့် ဆွေးနွေး၍ ရှုထောင့်အမျိုးမျိုးကို ရယူသည်။" }, value: 'collaborative' },
      { text: { en: "Look for a quick, hands-on way to start tackling it.", my: "ချက်ချင်းလက်တွေ့လုပ်ဆောင်နိုင်မည့် နည်းလမ်းကို ရှာဖွေသည်။" }, value: 'practical' },
    ],
  },
  {
    id: 'q2',
    text: {
      en: "I learn best when I can:",
      my: "ကျွန်ုပ်သည် အကောင်းဆုံးသင်ယူနိုင်သည့်အချိန်မှာ:",
    },
    options: [
      { text: { en: "Understand the underlying logic and theory.", my: "အခြေခံကျသော ယုတ္တိဗေဒနှင့် သီအိုရီကို နားလည်သောအခါ။" }, value: 'analytical' },
      { text: { en: "Experiment and try new things on my own.", my: "ကိုယ်တိုင်စမ်းသပ်၍ အသစ်အဆန်းများ ပြုလုပ်သောအခါ။" }, value: 'creative' },
      { text: { en: "Work with others and share insights.", my: "အခြားသူများနှင့် လက်တွဲလုပ်ဆောင်၍ အသိပညာများ ဖလှယ်သောအခါ။" }, value: 'collaborative' },
      { text: { en: "Apply the information to real-world scenarios.", my: "အချက်အလက်များကို လက်တွေ့ဘဝအခြေအနေများတွင် အသုံးချသောအခါ။" }, value: 'practical' },
    ],
  },
  {
    id: 'q3',
    text: {
      en: "In a group project, I'm most likely to be the one who:",
      my: "အဖွဲ့လိုက်လုပ်ဆောင်ရသော ပရောဂျက်တစ်ခုတွင်၊ ကျွန်ုပ်သည် အများအားဖြင့်:",
    },
    options: [
      { text: { en: "Ensures the plan is logical and well-structured.", my: "အစီအစဉ်သည် ယုတ္တိရှိပြီး စနစ်တကျဖြစ်စေရန် သေချာလုပ်ဆောင်သူ။" }, value: 'analytical' },
      { text: { en: "Comes up with innovative solutions or approaches.", my: "ဆန်းသစ်သောဖြေရှင်းနည်းများ သို့မဟုတ် ချဉ်းကပ်မှုများကို ဖော်ထုတ်သူ။" }, value: 'creative' },
      { text: { en: "Helps build consensus and keeps the team motivated.", my: "သဘောတူညီမှုတည်ဆောက်ရန် ကူညီပြီး အဖွဲ့ကို စိတ်အားထက်သန်စေသူ။" }, value: 'collaborative' },
      { text: { en: "Focuses on getting tasks done efficiently.", my: "လုပ်ငန်းတာဝန်များကို ထိရောက်စွာပြီးမြောက်အောင် အာရုံစိုက်သူ။" }, value: 'practical' },
    ],
  },
  {
    id: 'q4',
    text: {
      en: "When making an important decision, I rely most on:",
      my: "အရေးကြီးသောဆုံးဖြတ်ချက်တစ်ခု ချမှတ်သည့်အခါ၊ ကျွန်ုပ်သည် အများဆုံးအားကိုးသည်မှာ:",
    },
    options: [
      { text: { en: "Data, facts, and logical reasoning.", my: "အချက်အလက်၊ အဖြစ်မှန်များနှင့် ယုတ္တိရှိသော ဆင်ခြင်တုံတရား။" }, value: 'analytical' },
      { text: { en: "My intuition and exploring novel possibilities.", my: "ကျွန်ုပ်၏ပင်ကိုယ်အသိနှင့် အသစ်အဆန်းဖြစ်နိုင်ခြေများကို စူးစမ်းရှာဖွေခြင်း။" }, value: 'creative' },
      { text: { en: "The opinions and advice of trusted people.", my: "ယုံကြည်ရသောသူများ၏ ထင်မြင်ချက်များနှင့် အကြံဉာဏ်များ။" }, value: 'collaborative' },
      { text: { en: "What has proven to work effectively in the past.", my: "အတိတ်က ထိရောက်စွာလုပ်ဆောင်နိုင်ခဲ့ကြောင်း သက်သေပြခဲ့သည့်အရာများ။" }, value: 'practical' },
    ],
  },
  {
    id: 'q5',
    text: {
      en: "I feel most energized by activities that involve:",
      my: "ကျွန်ုပ်ကို အများဆုံးအားအင်ပြည့်ဖြိုးစေသော လှုပ်ရှားမှုများမှာ:",
    },
    options: [
      { text: { en: "Deep thinking and problem-solving.", my: "နက်နက်ရှိုင်းရှိုင်းစဉ်းစားခြင်းနှင့် ပြဿနာဖြေရှင်းခြင်း။" }, value: 'analytical' },
      { text: { en: "Imagination and self-expression.", my: "စိတ်ကူးစိတ်သန်းနှင့် ကိုယ်ပိုင်ဖော်ထုတ်မှု။" }, value: 'creative' },
      { text: { en: "Connecting with and helping others.", my: "အခြားသူများနှင့် ဆက်သွယ်၍ ကူညီခြင်း။" }, value: 'collaborative' },
      { text: { en: "Producing tangible results and achievements.", my: "မြင်သာသောရလဒ်များနှင့် အောင်မြင်မှုများကို ထုတ်လုပ်ခြင်း။" }, value: 'practical' },
    ],
  },
];

export const additionalQuizQuestions: QuizQuestion[] = [
  {
    id: 'aq1',
    text: {
      en: "When learning a new skill, I prefer:",
      my: "ကျွမ်းကျင်မှုအသစ်တစ်ခု သင်ယူသောအခါ၊ ကျွန်ုပ်သည် ပို၍နှစ်သက်သည်မှာ:",
    },
    options: [
      { text: { en: "A structured course with clear steps and assessments.", my: "ရှင်းလင်းသော အဆင့်များနှင့် အကဲဖြတ်ချက်များပါသော စနစ်တကျသင်တန်း။" }, value: 'analytical' },
      { text: { en: "To dive in and figure things out as I go, trying different methods.", my: "ချက်ချင်းစတင်၍ နည်းလမ်းအမျိုးမျိုးကို ကြိုးစားရင်း သင်ယူခြင်း။" }, value: 'creative' },
      { text: { en: "Learning with a study group or mentor.", my: "လေ့လာရေးအဖွဲ့ သို့မဟုတ် လမ်းညွှန်သူနှင့်အတူ သင်ယူခြင်း။" }, value: 'collaborative' },
      { text: { en: "Watching demonstrations and then immediately practicing.", my: "သရုပ်ပြမှုများကို ကြည့်ရှုပြီးနောက် ချက်ချင်းလေ့ကျင့်ခြင်း။" }, value: 'practical' },
    ],
  },
  {
    id: 'aq2',
    text: {
      en: "My ideal work environment is:",
      my: "ကျွန်ုပ်၏ စိတ်ကူးထဲက အလုပ်ပတ်ဝန်းကျင်မှာ:",
    },
    options: [
      { text: { en: "Quiet, organized, and allows for deep concentration.", my: "တိတ်ဆိတ်၊ စနစ်ကျပြီး နက်ရှိုင်းစွာ အာရုံစိုက်နိုင်သောနေရာ။" }, value: 'analytical' },
      { text: { en: "Flexible, dynamic, and encourages experimentation.", my: "ပြောင်းလွယ်ပြင်လွယ်ရှိ၊ တက်ကြွပြီး စမ်းသပ်မှုကို အားပေးသောနေရာ။" }, value: 'creative' },
      { text: { en: "Supportive, communicative, and team-oriented.", my: "ပံ့ပိုးမှုရှိ၊ ဆက်သွယ်မှုကောင်းပြီး အဖွဲ့လိုက်လုပ်ဆောင်သောနေရာ။" }, value: 'collaborative' },
      { text: { en: "Productive, with clear goals and practical tasks.", my: "ရည်မှန်းချက်ရှင်းလင်းပြီး လက်တွေ့ကျသော လုပ်ငန်းတာဝန်များဖြင့် ပြည့်စုံသောနေရာ။" }, value: 'practical' },
    ],
  },
  {
    id: 'aq3',
    text: {
      en: "I am often described by others as:",
      my: "အခြားသူများက ကျွန်ုပ်ကို မကြာခဏ ဖော်ပြကြသည်မှာ:",
    },
    options: [
      { text: { en: "Logical and precise.", my: "ယုတ္တိရှိပြီး တိကျသည်။" }, value: 'analytical' },
      { text: { en: "Imaginative and original.", my: "စိတ်ကူးယဉ်တတ်ပြီး မူလဖန်တီးမှုရှိသည်။" }, value: 'creative' },
      { text: { en: "Empathetic and cooperative.", my: "စာနာတတ်ပြီး ပူးပေါင်းဆောင်ရွက်တတ်သည်။" }, value: 'collaborative' },
      { text: { en: "Resourceful and dependable.", my: "စွမ်းဆောင်ရည်ရှိပြီး အားကိုးရသည်။" }, value: 'practical' },
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
      [key: string]: string | {descriptionKey: string};
    };
    comingSoon: string;
    askMoreQuestionsTitle: string;
    askMoreQuestionsDescription: string;
    askMoreQuestionsConfirm: string;
    askMoreQuestionsDecline: string;
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
      [key: string]: string | {descriptionKey: string};
    };
    comingSoon: string;
    askMoreQuestionsTitle: string;
    askMoreQuestionsDescription: string;
    askMoreQuestionsConfirm: string;
    askMoreQuestionsDecline: string;
  };
};

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
    askMoreQuestionsDescription: "Answer 3 more questions to help us fine-tune your learning and working style profile.",
    askMoreQuestionsConfirm: "Yes, Ask More Questions",
    askMoreQuestionsDecline: "No, Show My Results Now",
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
    askMoreQuestionsDescription: "သင်၏ သင်ယူမှုနှင့် အလုပ်လုပ်ပုံစံကို ပိုမိုတိကျစေရန် နောက်ထပ် မေးခွန်း ၃ ခု ဖြေဆိုပေးပါ။",
    askMoreQuestionsConfirm: "ဟုတ်ကဲ့၊ နောက်ထပ်မေးခွန်းများ မေးပါ",
    askMoreQuestionsDecline: "မဟုတ်ပါ၊ ကျွန်ုပ်၏ရလဒ်များကို ယခုပြပါ",
  }
};
// Ensure this is exported if the client component needs it directly (though it likely won't if using useLanguage hook)
// export { personalityTestsPageTranslations };
