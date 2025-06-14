
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react'; // Import all for dynamic icon lookup

// --- MBTI Specific Types ---
export type DichotomyLetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type DichotomyPair = 'EI' | 'SN' | 'TF' | 'JP';

export interface TranslatedText {
  en: string;
  my: string;
}

export interface MbtiQuestionOption {
  text: TranslatedText;
  value: DichotomyLetter; // The preference this option leans towards (e.g., 'E', 'I')
}

export interface MbtiQuestion {
  id: string;
  dichotomy: DichotomyPair; // Which pair this question addresses (e.g., 'EI')
  text: TranslatedText;
  options: [MbtiQuestionOption, MbtiQuestionOption]; // Exactly two options per question
}

export interface MbtiType {
  id: string; // e.g., "INTJ"
  titleKey: string; // e.g., "intjTitle" for translation
  groupKey: string; // e.g., "analystsGroup" for translation
  descriptionKey: string; // e.g., "intjDescription" for translation
  characteristicsKey: string; // e.g., "intjCharacteristics" (array of strings)
  careerSuggestionsKey: string; // e.g., "intjCareers" (array of strings)
  iconName: keyof typeof LucideIcons;
}

export interface MbtiQuizCompletionRecord {
  id: string;
  userIdentifier: string;
  mbtiType: string; // e.g., "INTJ"
  mbtiTitle: string; // Translated title at time of completion
  mbtiIconName: keyof typeof LucideIcons;
  completedAt: string; // ISO Date string
}
// --- END MBTI Specific Types ---


// --- MBTI Personality Types Data ---
export const mbtiTypes: MbtiType[] = [
  // Analysts
  { id: "INTJ", titleKey: "intjTitle", groupKey: "analystsGroup", descriptionKey: "intjDescription", characteristicsKey: "intjCharacteristics", careerSuggestionsKey: "intjCareers", iconName: "SquareTerminal" },
  { id: "INTP", titleKey: "intpTitle", groupKey: "analystsGroup", descriptionKey: "intpDescription", characteristicsKey: "intpCharacteristics", careerSuggestionsKey: "intpCareers", iconName: "FlaskConical" },
  { id: "ENTJ", titleKey: "entjTitle", groupKey: "analystsGroup", descriptionKey: "entjDescription", characteristicsKey: "entjCharacteristics", careerSuggestionsKey: "entjCareers", iconName: "Target" },
  { id: "ENTP", titleKey: "entpTitle", groupKey: "analystsGroup", descriptionKey: "entpDescription", characteristicsKey: "entpCharacteristics", careerSuggestionsKey: "entpCareers", iconName: "Lightbulb" },
  // Diplomats
  { id: "INFJ", titleKey: "infjTitle", groupKey: "diplomatsGroup", descriptionKey: "infjDescription", characteristicsKey: "infjCharacteristics", careerSuggestionsKey: "infjCareers", iconName: "Sparkles" },
  { id: "INFP", titleKey: "infpTitle", groupKey: "diplomatsGroup", descriptionKey: "infpDescription", characteristicsKey: "infpCharacteristics", careerSuggestionsKey: "infpCareers", iconName: "Feather" },
  { id: "ENFJ", titleKey: "enfjTitle", groupKey: "diplomatsGroup", descriptionKey: "enfjDescription", characteristicsKey: "enfjCharacteristics", careerSuggestionsKey: "enfjCareers", iconName: "Users" },
  { id: "ENFP", titleKey: "enfpTitle", groupKey: "diplomatsGroup", descriptionKey: "enfpDescription", characteristicsKey: "enfpCharacteristics", careerSuggestionsKey: "enfpCareers", iconName: "Sun" },
  // Sentinels
  { id: "ISTJ", titleKey: "istjTitle", groupKey: "sentinelsGroup", descriptionKey: "istjDescription", characteristicsKey: "istjCharacteristics", careerSuggestionsKey: "istjCareers", iconName: "ClipboardCheck" },
  { id: "ISFJ", titleKey: "isfjTitle", groupKey: "sentinelsGroup", descriptionKey: "isfjDescription", characteristicsKey: "isfjCharacteristics", careerSuggestionsKey: "isfjCareers", iconName: "ShieldCheck" },
  { id: "ESTJ", titleKey: "estjTitle", groupKey: "sentinelsGroup", descriptionKey: "estjDescription", characteristicsKey: "estjCharacteristics", careerSuggestionsKey: "estjCareers", iconName: "Building" },
  { id: "ESFJ", titleKey: "esfjTitle", groupKey: "sentinelsGroup", descriptionKey: "esfjDescription", characteristicsKey: "esfjCharacteristics", careerSuggestionsKey: "esfjCareers", iconName: "HeartHandshake" },
  // Explorers
  { id: "ISTP", titleKey: "istpTitle", groupKey: "explorersGroup", descriptionKey: "istpDescription", characteristicsKey: "istpCharacteristics", careerSuggestionsKey: "istpCareers", iconName: "Wrench" },
  { id: "ISFP", titleKey: "isfpTitle", groupKey: "explorersGroup", descriptionKey: "isfpDescription", characteristicsKey: "isfpCharacteristics", careerSuggestionsKey: "isfpCareers", iconName: "Palette" },
  { id: "ESTP", titleKey: "estpTitle", groupKey: "explorersGroup", descriptionKey: "estpDescription", characteristicsKey: "estpCharacteristics", careerSuggestionsKey: "estpCareers", iconName: "Zap" },
  { id: "ESFP", titleKey: "esfpTitle", groupKey: "explorersGroup", descriptionKey: "esfpDescription", characteristicsKey: "esfpCharacteristics", careerSuggestionsKey: "esfpCareers", iconName: "PartyPopper" },
];
// --- END MBTI Personality Types Data ---


// --- MBTI Quiz Questions ---
// Aim for 4-5 questions per dichotomy (16-20 total)
export const mbtiQuizQuestions: MbtiQuestion[] = [
  // Extraversion (E) vs. Introversion (I)
  {
    id: "mbti_q1_ei",
    dichotomy: "EI",
    text: { en: "After a busy week, you prefer to:", my: "အလုပ်များသော ရက်သတ္တပတ်တစ်ခုပြီးနောက်၊ သင်သည်:" },
    options: [
      { text: { en: "Go out and socialize with friends.", my: "သူငယ်ချင်းများနှင့် အပြင်ထွက်၍ ပေါင်းသင်းဆက်ဆံလိုသည်။" }, value: "E" },
      { text: { en: "Spend quiet time alone or with a few close people.", my: "တစ်ယောက်တည်း သို့မဟုတ် ရင်းနှီးသူအနည်းငယ်နှင့် တိတ်ဆိတ်စွာ အချိန်ဖြုန်းလိုသည်။" }, value: "I" },
    ],
  },
  {
    id: "mbti_q2_ei",
    dichotomy: "EI",
    text: { en: "In group settings, you tend to:", my: "အဖွဲ့လိုက် ဆောင်ရွက်ရာတွင်၊ သင်သည်:" },
    options: [
      { text: { en: "Be talkative and engage with many people.", my: "စကားများပြီး လူအများအပြားနှင့် ဆက်ဆံတတ်သည်။" }, value: "E" },
      { text: { en: "Listen more and speak when you have something specific to say.", my: "ပို၍နားထောင်ပြီး တိကျသောအကြောင်းအရာရှိမှသာ ပြောတတ်သည်။" }, value: "I" },
    ],
  },
  {
    id: "mbti_q3_ei",
    dichotomy: "EI",
    text: { en: "You feel more energized when:", my: "သင်သည် မည်သည့်အချိန်တွင် ပို၍အားအင်ပြည့်ဖြိုးသနည်း။" },
    options: [
      { text: { en: "Interacting with a variety of people.", my: "လူအမျိုးမျိုးနှင့် ဆက်ဆံသည့်အခါ။" }, value: "E" },
      { text: { en: "Having time for quiet reflection and solitude.", my: "တိတ်ဆိတ်စွာ ဆင်ခြင်သုံးသပ်ရန်နှင့် တစ်ယောက်တည်းနေရန် အချိန်ရသည့်အခါ။" }, value: "I" },
    ],
  },
   {
    id: "mbti_q4_ei",
    dichotomy: "EI",
    text: { en: "When working on a project, you are more likely to:", my: "ပရောဂျက်တစ်ခု လုပ်ဆောင်နေချိန်တွင်၊ သင်သည်:" },
    options: [
      { text: { en: "Think out loud and bounce ideas off others.", my: "ကျယ်ကျယ်တွေးပြီး အခြားသူများနှင့် အတွေးအခေါ်များ ဖလှယ်တတ်သည်။" }, value: "E" },
      { text: { en: "Process your thoughts internally before sharing.", my: "မျှဝေခြင်းမပြုမီ သင်၏အတွေးများကို အတွင်း၌ စီစဉ်သည်။" }, value: "I" },
    ],
  },

  // Sensing (S) vs. Intuition (N)
  {
    id: "mbti_q1_sn",
    dichotomy: "SN",
    text: { en: "When learning something new, you focus more on:", my: "အသစ်အဆန်းတစ်ခုခုကို သင်ယူသောအခါ၊ သင်သည် ပို၍အာရုံစိုက်သည်မှာ:" },
    options: [
      { text: { en: "Practical applications and real-world details.", my: "လက်တွေ့အသုံးချမှုများနှင့် တကယ့်ကမ္ဘာမှ အသေးစိတ်အချက်အလက်များ။" }, value: "S" },
      { text: { en: "The underlying concepts and future possibilities.", my: "အခြေခံသဘောတရားများနှင့် အနာဂတ်ဖြစ်နိုင်ခြေများ။" }, value: "N" },
    ],
  },
  {
    id: "mbti_q2_sn",
    dichotomy: "SN",
    text: { en: "You tend to trust information that is:", my: "သင်သည် မည်သည့်အချက်အလက်မျိုးကို ပို၍ယုံကြည်သနည်း။" },
    options: [
      { text: { en: "Concrete, tangible, and based on experience.", my: "တိကျခိုင်မာပြီး အတွေ့အကြုံအပေါ် အခြေခံထားသော အချက်အလက်။" }, value: "S" },
      { text: { en: "Abstract, conceptual, and based on insights or patterns.", my: "သဘောတရားပိုင်းဆိုင်ရာ၊ ထိုးထွင်းသိမြင်မှု သို့မဟုတ် ပုံစံများအပေါ် အခြေခံထားသော အချက်အလက်။" }, value: "N" },
    ],
  },
  {
    id: "mbti_q3_sn",
    dichotomy: "SN",
    text: { en: "When describing an event, you are more likely to:", my: "အဖြစ်အပျက်တစ်ခုကို ဖော်ပြသည့်အခါ၊ သင်သည်:" },
    options: [
      { text: { en: "Detail the specific facts and sequence of what happened.", my: "ဖြစ်ပျက်ခဲ့သည့် တိကျသောအချက်အလက်များနှင့် အစီအစဉ်ကို အသေးစိတ်ဖော်ပြသည်။" }, value: "S" },
      { text: { en: "Focus on the overall meaning, implications, or symbolism.", my: "အလုံးစုံအဓိပ္ပာယ်၊ သက်ရောက်မှုများ သို့မဟုတ် သင်္ကေတများကို အာရုံစိုက်သည်။" }, value: "N" },
    ],
  },
  {
    id: "mbti_q4_sn",
    dichotomy: "SN",
    text: { en: "You are generally more interested in:", my: "သင်သည် ယေဘုယျအားဖြင့် ပို၍စိတ်ဝင်စားသည်မှာ:" },
    options: [
      { text: { en: "What is actual and present.", my: "လက်ရှိအမှန်တကယ်ဖြစ်ပျက်နေသောအရာ။" }, value: "S" },
      { text: { en: "What could be and future possibilities.", my: "ဖြစ်နိုင်ခြေရှိသော အနာဂတ်အလားအလာများ။" }, value: "N" },
    ],
  },

  // Thinking (T) vs. Feeling (F)
  {
    id: "mbti_q1_tf",
    dichotomy: "TF",
    text: { en: "When making decisions, you prioritize:", my: "ဆုံးဖြတ်ချက်များချမှတ်ရာတွင်၊ သင်သည် ဦးစားပေးသည်မှာ:" },
    options: [
      { text: { en: "Logic, objectivity, and impartial analysis.", my: "ယုတ္တိဗေဒ၊ ဓမ္မဓိဋ္ဌာန်ကျမှုနှင့် ဘက်မလိုက်သော သုံးသပ်ချက်။" }, value: "T" },
      { text: { en: "Harmony, empathy, and how it impacts people.", my: "သဟဇာတဖြစ်မှု၊ စာနာမှုနှင့် လူများအပေါ် သက်ရောက်မှု။" }, value: "F" },
    ],
  },
  {
    id: "mbti_q2_tf",
    dichotomy: "TF",
    text: { en: "You are more convinced by arguments based on:", my: "သင်သည် မည်သည့်အငြင်းအခုံမျိုးကို ပို၍လက်ခံနိုင်ဖွယ်ရှိသနည်း။" },
    options: [
      { text: { en: "Facts and logical principles.", my: "အချက်အလက်များနှင့် ယုတ္တိကျသော မူများ။" }, value: "T" },
      { text: { en: "Values and the human impact.", my: "တန်ဖိုးထားမှုများနှင့် လူသားများအပေါ် သက်ရောက်မှု။" }, value: "F" },
    ],
  },
  {
    id: "mbti_q3_tf",
    dichotomy: "TF",
    text: { en: "When giving feedback, you tend to be more:", my: "တုံ့ပြန်ချက်ပေးသည့်အခါ၊ သင်သည် ပို၍:" },
    options: [
      { text: { en: "Direct, critical, and focused on improvement.", my: "တိုက်ရိုက်၊ ဝေဖန်ပိုင်းခြားပြီး တိုးတက်မှုအပေါ် အာရုံစိုက်သည်။" }, value: "T" },
      { text: { en: "Tactful, encouraging, and supportive.", my: "လိမ္မာပါးနပ်၊ အားပေးပြီး ပံ့ပိုးကူညီသည်။" }, value: "F" },
    ],
  },
  {
    id: "mbti_q4_tf",
    dichotomy: "TF",
    text: { en: "It's more important for you to be seen as:", my: "သင့်အတွက် ပို၍အရေးကြီးသည်မှာ မည်သို့မြင်ခံရခြင်းဖြစ်သနည်း။" },
    options: [
      { text: { en: "Competent and fair.", my: "စွမ်းဆောင်ရည်ရှိပြီး တရားမျှတသည်။" }, value: "T" },
      { text: { en: "Kind and compassionate.", my: "ကြင်နာပြီး သနားကြင်နာတတ်သည်။" }, value: "F" },
    ],
  },

  // Judging (J) vs. Perceiving (P)
  {
    id: "mbti_q1_jp",
    dichotomy: "JP",
    text: { en: "You prefer your life to be more:", my: "သင်၏ဘဝသည် မည်သို့ဖြစ်စေလိုသနည်း။" },
    options: [
      { text: { en: "Planned, orderly, and decided.", my: "အစီအစဉ်ကျ၊ စနစ်တကျနှင့် ဆုံးဖြတ်ချက်ချပြီးသား။" }, value: "J" },
      { text: { en: "Spontaneous, flexible, and open to options.", my: "အလိုအလျောက်ဖြစ်ပေါ်၊ ပြောင်းလွယ်ပြင်လွယ်ရှိပြီး ရွေးချယ်စရာများအတွက် ပွင့်လင်းသည်။" }, value: "P" },
    ],
  },
  {
    id: "mbti_q2_jp",
    dichotomy: "JP",
    text: { en: "When working on a task, you prefer to:", my: "လုပ်ငန်းတစ်ခုလုပ်ဆောင်ရာတွင်၊ သင်သည် ပို၍နှစ်သက်သည်မှာ:" },
    options: [
      { text: { en: "Have clear deadlines and a structured approach.", my: "ရှင်းလင်းသော နောက်ဆုံးသတ်မှတ်ရက်များနှင့် စနစ်တကျချဉ်းကပ်မှု။" }, value: "J" },
      { text: { en: "Keep things open and adapt as you go.", my: "အရာအားလုံးကို ပွင့်လင်းထားပြီး အခြေအနေအရ လိုက်လျောညီထွေဖြစ်အောင် လုပ်ဆောင်ခြင်း။" }, value: "P" },
    ],
  },
  {
    id: "mbti_q3_jp",
    dichotomy: "JP",
    text: { en: "You generally feel more comfortable when:", my: "သင်သည် ယေဘုယျအားဖြင့် မည်သည့်အချိန်တွင် ပို၍သက်တောင့်သက်သာခံစားရသနည်း။" },
    options: [
      { text: { en: "Things are settled and decisions are made.", my: "အရာအားလုံးကို ဖြေရှင်းပြီး ဆုံးဖြတ်ချက်များ ချမှတ်ပြီးသည့်အခါ။" }, value: "J" },
      { text: { en: "There are many possibilities and you can explore them.", my: "ဖြစ်နိုင်ခြေများစွာရှိပြီး ၎င်းတို့ကို စူးစမ်းလေ့လာနိုင်သည့်အခါ။" }, value: "P" },
    ],
  },
  {
    id: "mbti_q4_jp",
    dichotomy: "JP",
    text: { en: "When approaching a new project, you usually start by:", my: "ပရောဂျက်အသစ်တစ်ခုကို ချဉ်းကပ်သည့်အခါ၊ သင်သည် များသောအားဖြင့်:" },
    options: [
      { text: { en: "Making a plan and organizing tasks.", my: "အစီအစဉ်ဆွဲပြီး လုပ်ငန်းတာဝန်များကို စီစဉ်ခြင်း။" }, value: "J" },
      { text: { en: "Gathering information and exploring various angles.", my: "အချက်အလက်များစုဆောင်းပြီး ရှုထောင့်အမျိုးမျိုးကို စူးစမ်းခြင်း။" }, value: "P" },
    ],
  },
];
// --- END MBTI Quiz Questions ---


// --- For Type Safety in Client Translations ---
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
    questionProgress: string;
    resultTitle: string;
    possibleTypesTitle: string;
    recentCompletionsTitle: string;
    historyUser: string;
    historyStyle: string; // Will be mbtiType
    historyDate: string;
    noHistory: string;
    
    // Group Titles
    analystsGroup: string;
    diplomatsGroup: string;
    sentinelsGroup: string;
    explorersGroup: string;

    // MBTI Type Titles
    intjTitle: string; intpTitle: string; entjTitle: string; entpTitle: string;
    infjTitle: string; infpTitle: string; enfjTitle: string; enfpTitle: string;
    istjTitle: string; isfjTitle: string; estjTitle: string; esfjTitle: string;
    istpTitle: string; isfpTitle: string; estpTitle: string; esfpTitle: string;

    // MBTI Type Descriptions
    intjDescription: string; intpDescription: string; entjDescription: string; entpDescription: string;
    infjDescription: string; infpDescription: string; enfjDescription: string; enfpDescription: string;
    istjDescription: string; isfjDescription: string; estjDescription: string; esfjDescription: string;
    istpDescription: string; isfpDescription: string; estpDescription: string; esfpDescription: string;

    // MBTI Characteristics (Keys for arrays of strings)
    intjCharacteristics: string; intpCharacteristics: string; entjCharacteristics: string; entpCharacteristics: string;
    infjCharacteristics: string; infpCharacteristics: string; enfjCharacteristics: string; enfpCharacteristics: string;
    istjCharacteristics: string; isfjCharacteristics: string; estjCharacteristics: string; esfjCharacteristics: string;
    istpCharacteristics: string; isfpCharacteristics: string; estpCharacteristics: string; esfpCharacteristics: string;

    // MBTI Career Suggestions (Keys for arrays of strings)
    intjCareers: string; intpCareers: string; entjCareers: string; entpCareers: string;
    infjCareers: string; infpCareers: string; enfjCareers: string; enfpCareers: string;
    istjCareers: string; isfjCareers: string; estjCareers: string; esfjCareers: string;
    istpCareers: string; isfpCareers: string; estpCareers: string; esfpCareers: string;

    // For the result display sections
    characteristicsSectionTitle: string;
    careerPathSectionTitle: string;
  };
  // Myanmar translations would follow the same structure
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
    possibleTypesTitle: string;
    recentCompletionsTitle: string;
    historyUser: string;
    historyStyle: string;
    historyDate: string;
    noHistory: string;

    analystsGroup: string; diplomatsGroup: string; sentinelsGroup: string; explorersGroup: string;
    intjTitle: string; intpTitle: string; entjTitle: string; entpTitle: string;
    infjTitle: string; infpTitle: string; enfjTitle: string; enfpTitle: string;
    istjTitle: string; isfjTitle: string; estjTitle: string; esfjTitle: string;
    istpTitle: string; isfpTitle: string; estpTitle: string; esfpTitle: string;

    intjDescription: string; intpDescription: string; entjDescription: string; entpDescription: string;
    infjDescription: string; infpDescription: string; enfjDescription: string; enfpDescription: string;
    istjDescription: string; isfjDescription: string; estjDescription: string; esfjDescription: string;
    istpDescription: string; isfpDescription: string; estpDescription: string; esfpDescription: string;

    intjCharacteristics: string; intpCharacteristics: string; entjCharacteristics: string; entpCharacteristics: string;
    infjCharacteristics: string; infpCharacteristics: string; enfjCharacteristics: string; enfpCharacteristics: string;
    istjCharacteristics: string; isfjCharacteristics: string; estjCharacteristics: string; esfjCharacteristics: string;
    istpCharacteristics: string; isfpCharacteristics: string; estpCharacteristics: string; esfpCharacteristics: string;

    intjCareers: string; intpCareers: string; entjCareers: string; entpCareers: string;
    infjCareers: string; infpCareers: string; enfjCareers: string; enfpCareers: string;
    istjCareers: string; isfjCareers: string; estjCareers: string; esfjCareers: string;
    istpCareers: string; isfpCareers: string; estpCareers: string; esfpCareers: string;

    characteristicsSectionTitle: string;
    careerPathSectionTitle: string;
  };
};
// --- END For Type Safety ---
