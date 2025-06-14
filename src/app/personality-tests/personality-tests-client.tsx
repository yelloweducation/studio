
"use client";
import React, { useState, useEffect, type ChangeEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Lightbulb, ArrowRight, RotateCcw, HelpCircle, ListChecks, History, UserCircle, type LucideIcon, BarChartHorizontalBig, SearchCode, Handshake, Construction, Medal, BookUser, Users2, Award } from 'lucide-react';
import { useLanguage, type Language } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import {
  mbtiQuizQuestions,
  mbtiTypes,
  type MbtiType,
  type MbtiQuestion,
  type DichotomyLetter,
  type PersonalityTestsTranslations,
  type TranslatedText,
  type MbtiQuizCompletionRecord
} from '@/data/personalityQuizData';
import * as LucideIcons from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const QUIZ_HISTORY_STORAGE_KEY = 'mbtiQuizHistory_v1'; // Updated key
const MAX_HISTORY_ITEMS = 10;

// --- START TRANSLATIONS ---
const personalityTestsPageTranslations: PersonalityTestsTranslations = {
  en: {
    pageTitle: "Personality & Skill Assessments",
    pageDescription: "Discover your unique strengths and how they align with various career paths.",
    quizIntroTitle: "Understand Your Personality Type",
    quizIntroDescription: "This quiz helps you understand your preferences based on well-known personality archetypes. Answer honestly to get the most accurate insights.",
    startQuizButton: "Start Personality Quiz",
    nextButton: "Next Question",
    seeResultsButton: "See My Type",
    retakeQuizButton: "Retake Quiz",
    questionProgress: "Question {current} of {total}",
    resultTitle: "Your Personality Type:",
    possibleTypesTitle: "Possible Personality Types",
    recentCompletionsTitle: "Recent Quiz Completions",
    historyUser: "User",
    historyStyle: "Type",
    historyDate: "Date",
    noHistory: "No quiz completions recorded yet. Be the first!",
    characteristicsSectionTitle: "Key Characteristics",
    careerPathSectionTitle: "Suggested Career Paths",

    // Group Titles
    analystsGroup: "Analysts (Intuitive & Thinking)",
    diplomatsGroup: "Diplomats (Intuitive & Feeling)",
    sentinelsGroup: "Sentinels (Observant & Judging)",
    explorersGroup: "Explorers (Observant & Perceiving)",

    // MBTI Type Titles
    intjTitle: "INTJ - The Architect", intpTitle: "INTP - The Logician", entjTitle: "ENTJ - The Commander", entpTitle: "ENTP - The Debater",
    infjTitle: "INFJ - The Advocate", infpTitle: "INFP - The Mediator", enfjTitle: "ENFJ - The Protagonist", enfpTitle: "ENFP - The Campaigner",
    istjTitle: "ISTJ - The Logistician", isfjTitle: "ISFJ - The Defender", estjTitle: "ESTJ - The Executive", esfjTitle: "ESFJ - The Consul",
    istpTitle: "ISTP - The Virtuoso", isfpTitle: "ISFP - The Adventurer", estpTitle: "ESTP - The Entrepreneur", esfpTitle: "ESFP - The Entertainer",

    // MBTI Type Descriptions
    intjDescription: "Imaginative and strategic thinkers, with a plan for everything. They are rational, quick-witted, and excel at long-range planning.",
    intpDescription: "Innovative inventors with an unquenchable thirst for knowledge. They are logical, original, and independent problem-solvers.",
    entjDescription: "Bold, imaginative and strong-willed leaders, always finding or forging a way. They are decisive, efficient, and natural strategists.",
    entpDescription: "Smart and curious thinkers who cannot resist an intellectual challenge. They are quick-witted, resourceful, and love to debate.",
    infjDescription: "Quiet and mystical, yet very inspiring and tireless idealists. They are insightful, compassionate, and seek meaning and connection.",
    infpDescription: "Poetic, kind and altruistic people, always eager to help a good cause. They are idealistic, empathetic, and value harmony.",
    enfjDescription: "Charismatic and inspiring leaders, able to mesmerize their listeners. They are outgoing, empathetic, and natural motivators.",
    enfpDescription: "Enthusiastic, creative and sociable free spirits, who can always find a reason to smile. They are imaginative, independent, and value personal growth.",
    istjDescription: "Practical and fact-minded individuals, whose reliability cannot be doubted. They are responsible, thorough, and value order and tradition.",
    isfjDescription: "Very dedicated and warm protectors, always ready to defend their loved ones. They are loyal, supportive, and meticulous.",
    estjDescription: "Excellent administrators, unsurpassed at managing things – or people. They are organized, decisive, and enjoy implementing systems.",
    esfjDescription: "Extraordinarily caring, social and popular people, always eager to help. They are cooperative, conscientious, and value harmony in their communities.",
    istpDescription: "Bold and practical experimenters, masters of all kinds of tools. They are observant, adaptable, and enjoy hands-on problem-solving.",
    isfpDescription: "Flexible and charming artists, always ready to explore and experience something new. They are sensitive, aesthetic, and value freedom.",
    estpDescription: "Smart, energetic and very perceptive people, who truly enjoy living on the edge. They are action-oriented, resourceful, and thrive in dynamic environments.",
    esfpDescription: "Spontaneous, energetic and enthusiastic people – life is never boring around them. They are outgoing, fun-loving, and enjoy being the center of attention.",

    // MBTI Characteristics (Keys for arrays of strings) - Shortened for brevity
    intjCharacteristics: "Strategic; Independent; Decisive; Innovative; Prefers logic over emotion.",
    intpCharacteristics: "Analytical; Curious; Reserved; Objective; Enjoys theoretical problems.",
    entjCharacteristics: "Leaderly; Confident; Efficient; Outspoken; Goal-oriented.",
    entpCharacteristics: "Inventive; Enthusiastic; Argumentative; Resourceful; Dislikes routine.",
    infjCharacteristics: "Insightful; Principled; Compassionate; Private; Seeks meaning.",
    infpCharacteristics: "Idealistic; Empathetic; Creative; Value-driven; Avoids conflict.",
    enfjCharacteristics: "Charismatic; Persuasive; Altruistic; Organized; Inspires others.",
    enfpCharacteristics: "Imaginative; Energetic; Sociable; Optimistic; Dislikes constraints.",
    istjCharacteristics: "Responsible; Dependable; Detail-oriented; Traditional; Prefers order.",
    isfjCharacteristics: "Supportive; Loyal; Considerate; Practical; Dedicated.",
    estjCharacteristics: "Organized; Decisive; Direct; Rule-follower; Efficient manager.",
    esfjCharacteristics: "Caring; Sociable; Harmonious; Practical; Service-oriented.",
    istpCharacteristics: "Adaptable; Independent; Analytical; Hands-on; Action-oriented.",
    isfpCharacteristics: "Artistic; Gentle; Flexible; Observant; Values aesthetics.",
    estpCharacteristics: "Energetic; Pragmatic; Outgoing; Risk-taker; Thrives on action.",
    esfpCharacteristics: "Lively; Spontaneous; Friendly; Generous; Enjoys the spotlight.",

    // MBTI Career Suggestions (Keys for arrays of strings) - Shortened for brevity
    intjCareers: "Scientist; Engineer; Strategist; Systems Analyst; University Professor.",
    intpCareers: "Software Developer; Researcher; Philosopher; Technical Writer; Analyst.",
    entjCareers: "CEO; Entrepreneur; Manager; Consultant; Lawyer.",
    entpCareers: "Innovator; Entrepreneur; Lawyer; Political Strategist; Consultant.",
    infjCareers: "Counselor; Psychologist; Writer; Social Worker; Teacher.",
    infpCareers: "Author; Artist; Counselor; Graphic Designer; Non-profit Professional.",
    enfjCareers: "Teacher; HR Manager; Event Planner; Sales Manager; Politician.",
    enfpCareers: "Journalist; Marketing Manager; Actor; Entrepreneur; Creative Director.",
    istjCareers: "Accountant; Project Manager; Logistics Coordinator; Auditor; Database Administrator.",
    isfjCareers: "Nurse; Teacher; Social Worker; Office Manager; Veterinarian.",
    estjCareers: "Manager; Business Administrator; Police Officer; Judge; Financial Officer.",
    esfjCareers: "Teacher; Healthcare Provider; Event Coordinator; Customer Service Rep; HR Specialist.",
    istpCareers: "Mechanic; Engineer; Pilot; Forensic Scientist; Chef.",
    isfpCareers: "Artist; Musician; Fashion Designer; Photographer; Florist.",
    estpCareers: "Salesperson; Entrepreneur; Paramedic; Marketing Specialist; Stockbroker.",
    esfpCareers: "Performer; Event Planner; Tour Guide; Sales Representative; Flight Attendant.",
  },
  my: {
    pageTitle: "ကိုယ်ရည်ကိုယ်သွေးနှင့် ကျွမ်းကျင်မှု အကဲဖြတ်ချက်များ",
    pageDescription: "သင်၏ ထူးခြားသော အားသာချက်များနှင့် ၎င်းတို့သည် အသက်မွေးဝမ်းကျောင်း လမ်းကြောင်းအမျိုးမျိုးနှင့် မည်သို့ကိုက်ညီသည်ကို ရှာဖွေပါ။",
    quizIntroTitle: "သင်၏ ကိုယ်ရည်ကိုယ်သွေး အမျိုးအစားကို နားလည်ပါ",
    quizIntroDescription: "ဤစစ်ဆေးမှုသည် လူသိများသော ကိုယ်ရည်ကိုယ်သွေး ပုံစံများအပေါ် အခြေခံ၍ သင်၏ ဦးစားပေးမှုများကို နားလည်ရန် ကူညီပေးသည်။ အတိကျဆုံး ထိုးထွင်းသိမြင်မှုများ ရရှိရန် ရိုးသားစွာ ဖြေဆိုပါ။",
    startQuizButton: "ကိုယ်ရည်ကိုယ်သွေး စစ်ဆေးမှု စတင်ပါ",
    nextButton: "နောက်မေးခွန်း",
    seeResultsButton: "ကျွန်ုပ်၏ အမျိုးအစားကို ကြည့်ပါ",
    retakeQuizButton: "ထပ်မံဖြေဆိုပါ",
    questionProgress: "မေးခွန်း {current} / {total}",
    resultTitle: "သင်၏ ကိုယ်ရည်ကိုယ်သွေး အမျိုးအစား:",
    possibleTypesTitle: "ဖြစ်နိုင်သော ကိုယ်ရည်ကိုယ်သွေး အမျိုးအစားများ",
    recentCompletionsTitle: "မကြာသေးမီက ပြီးဆုံးခဲ့သော စစ်ဆေးမှုများ",
    historyUser: "အသုံးပြုသူ",
    historyStyle: "အမျိုးအစား",
    historyDate: "ရက်စွဲ",
    noHistory: "စစ်ဆေးမှု ပြီးဆုံးခြင်း မှတ်တမ်း မရှိသေးပါ။ ပထမဆုံးဖြစ်လိုက်ပါ။",
    characteristicsSectionTitle: "အဓိက လက္ခဏာများ",
    careerPathSectionTitle: "အကြံပြုထားသော အသက်မွေးဝမ်းကျောင်း လမ်းကြောင်းများ",

    analystsGroup: "သုံးသပ်သူများ (အလိုလိုသိမြင်ပြီး တွေးခေါ်တတ်သူ)",
    diplomatsGroup: "သံတမန်များ (အလိုလိုသိမြင်ပြီး ခံစားတတ်သူ)",
    sentinelsGroup: "အစောင့်အရှောက်များ (လက်တွေ့ကျပြီး ဆုံးဖြတ်တတ်သူ)",
    explorersGroup: "စူးစမ်းရှာဖွေသူများ (လက်တွေ့ကျပြီး ပြောင်းလွယ်ပြင်လွယ်ရှိသူ)",

    intjTitle: "INTJ - ဗိသုကာ", intpTitle: "INTP - ယုတ္တိဗေဒပညာရှင်", entjTitle: "ENTJ - တပ်မှူး", entpTitle: "ENTP - အငြင်းအခုံသမား",
    infjTitle: "INFJ - ထောက်ခံသူ", infpTitle: "INFP - ဖျန်ဖြေသူ", enfjTitle: "ENFJ - အဓိကဇာတ်ဆောင်", enfpTitle: "ENFP - လှုံ့ဆော်သူ",
    istjTitle: "ISTJ - ထောက်ပံ့ပို့ဆောင်ရေးသမား", isfjTitle: "ISFJ - ကာကွယ်သူ", estjTitle: "ESTJ - အုပ်ချုပ်ရေးမှူး", esfjTitle: "ESFJ - အတိုင်ပင်ခံ",
    istpTitle: "ISTP - ကျွမ်းကျင်သူ", isfpTitle: "ISFP - စွန့်စားသူ", estpTitle: "ESTP - စီးပွားရေးလုပ်ငန်းရှင်", esfpTitle: "ESFP - ဖျော်ဖြေသူ",

    intjDescription: "စိတ်ကူးဉာဏ်ကြွယ်ဝပြီး မဟာဗျူဟာကျကျ တွေးခေါ်သူများ၊ အရာအားလုံးအတွက် အစီအစဉ်ရှိသည်။ ကျိုးကြောင်းဆီလျော်ပြီး လျင်မြန်စွာတွေးခေါ်နိုင်စွမ်းရှိကာ ရေရှည်စီမံကိန်းများတွင် ထူးချွန်သည်။",
    intpDescription: "ဗဟုသုတကို အငမ်းမရရှာဖွေသော ဆန်းသစ်တီထွင်သူများ။ ယုတ္တိရှိ၊ မူလဖန်တီးနိုင်စွမ်းရှိပြီး လွတ်လပ်စွာ ပြဿနာဖြေရှင်းသူများ။",
    entjDescription: "ရဲရင့်၊ စိတ်ကူးဉာဏ်ကြွယ်ဝပြီး စိတ်ဓာတ်ကြံ့ခိုင်သော ခေါင်းဆောင်များ၊ နည်းလမ်းတစ်ခုကို အမြဲရှာဖွေဖော်ထုတ်တတ်သည်။ ဆုံးဖြတ်ချက်ခိုင်မာပြီး ထိရောက်သော မဟာဗျူဟာမှူးများ။",
    entpDescription: "ဥာဏ်ရည်ထက်မြက်ပြီး စူးစမ်းလိုစိတ်ပြင်းပြသော တွေးခေါ်ရှင်များ၊ ဉာဏ်စမ်းပဟေဠိများကို မရှောင်လွှဲနိုင်။ လျင်မြန်စွာတွေးခေါ်နိုင်ပြီး အငြင်းအခုံလုပ်ခြင်းကို နှစ်သက်သည်။",
    infjDescription: "တိတ်ဆိတ်ပြီး နက်နဲမှုရှိသော်လည်း အလွန်အားကျဖွယ်ကောင်းပြီး မမောမပန်းနိုင်သော စိတ်ကူးယဉ်ဝါဒီများ။ ထိုးထွင်းသိမြင်မှုရှိ၊ ကရုဏာကြီးမားပြီး အဓိပ္ပာယ်နှင့် ဆက်သွယ်မှုကို ရှာဖွေသည်။",
    infpDescription: "ကဗျာဆန်၊ ကြင်နာပြီး အများအကျိုးဆောင်တတ်သောသူများ၊ ကောင်းသောကိစ္စများအတွက် အမြဲကူညီရန် အသင့်ရှိသည်။ စိတ်ကူးယဉ်ဝါဒီ၊ စာနာတတ်ပြီး သဟဇာတဖြစ်မှုကို တန်ဖိုးထားသည်။",
    enfjDescription: "ဆွဲဆောင်မှုရှိပြီး အားကျဖွယ်ကောင်းသော ခေါင်းဆောင်များ၊ နားထောင်သူများကို ညှို့ယူဖမ်းစားနိုင်သည်။ ဖော်ရွေ၊ စာနာတတ်ပြီး ပင်ကိုစေ့ဆော်သူများ။",
    enfpDescription: "စိတ်အားထက်သန်၊ တီထွင်ဖန်တီးနိုင်စွမ်းရှိပြီး ဖော်ရွေသော လွတ်လပ်သူများ၊ အမြဲတမ်းပြုံးရွှင်ရန် အကြောင်းပြချက်ရှာတွေ့နိုင်သည်။ စိတ်ကူးယဉ်တတ်၊ လွတ်လပ်ပြီး ကိုယ်ပိုင်တိုးတက်မှုကို တန်ဖိုးထားသည်။",
    istjDescription: "လက်တွေ့ကျပြီး အချက်အလက်ကို ဦးစားပေးသောသူများ၊ သူတို့၏ယုံကြည်စိတ်ချရမှုကို သံသယဖြစ်ဖွယ်မရှိ။ တာဝန်ယူတတ်၊ စေ့စပ်သေချာပြီး စည်းစနစ်နှင့် ထုံးတမ်းစဉ်လာကို တန်ဖိုးထားသည်။",
    isfjDescription: "အလွန်အပ်နှံပြီး နွေးထွေးသော ကာကွယ်သူများ၊ မိမိချစ်ခင်ရသူများကို ကာကွယ်ရန် အမြဲအသင့်ရှိသည်။ သစ္စာရှိ၊ ပံ့ပိုးတတ်ပြီး စေ့စပ်သေချာသည်။",
    estjDescription: "အရာများ သို့မဟုတ် လူများကို စီမံခန့်ခွဲရာတွင် ပြိုင်ဘက်ကင်းသော ထူးချွန်သည့် အုပ်ချုပ်သူများ။ စနစ်တကျရှိ၊ ဆုံးဖြတ်ချက်ခိုင်မာပြီး စနစ်များအကောင်အထည်ဖော်ခြင်းကို နှစ်သက်သည်။",
    esfjDescription: "ထူးကဲစွာ ဂရုစိုက်တတ်၊ ဖော်ရွေပြီး လူကြိုက်များသူများ၊ အမြဲတမ်းကူညီရန် အသင့်ရှိသည်။ ပူးပေါင်းဆောင်ရွက်တတ်၊ တာဝန်သိပြီး ရပ်ရွာအတွင်း သဟဇာတဖြစ်မှုကို တန်ဖိုးထားသည်။",
    istpDescription: "ရဲရင့်ပြီး လက်တွေ့ကျသော စမ်းသပ်သူများ၊ ကိရိယာအမျိုးမျိုးကို ကျွမ်းကျင်စွာ အသုံးပြုနိုင်သူများ။ စူးစမ်းလေ့လာတတ်၊ လိုက်လျောညီထွေဖြစ်အောင်နေတတ်ပြီး လက်တွေ့ပြဿနာဖြေရှင်းခြင်းကို နှစ်သက်သည်။",
    isfpDescription: "ပြောင်းလွယ်ပြင်လွယ်ရှိပြီး ဆွဲဆောင်မှုရှိသော အနုပညာရှင်များ၊ အသစ်အဆန်းများကို စူးစမ်းလေ့လာပြီး တွေ့ကြုံခံစားရန် အမြဲအသင့်ရှိသည်။ စိတ်ခံစားလွယ်၊ အလှအပကို ခံစားတတ်ပြီး လွတ်လပ်မှုကို တန်ဖိုးထားသည်။",
    estpDescription: "ဥာဏ်ကောင်း၊ တက်ကြွပြီး အလွန်အကင်းပါးသောသူများ၊ စွန့်စားခြင်းကို အမှန်တကယ်နှစ်သက်သည်။ လုပ်ဆောင်မှုကို ဦးစားပေး၊ ပြဿနာဖြေရှင်းနိုင်စွမ်းရှိပြီး တက်ကြွသောပတ်ဝန်းကျင်တွင် ထူးချွန်သည်။",
    esfpDescription: "တက်ကြွ၊ အလိုအလျောက်ဖြစ်ပေါ်ပြီး စိတ်အားထက်သန်သောသူများ – သူတို့အနားတွင် ဘဝသည် ဘယ်တော့မှ ပျင်းစရာမကောင်း။ ဖော်ရွေ၊ ပျော်ပျော်နေတတ်ပြီး အများ၏အာရုံစိုက်မှုကို နှစ်သက်သည်။",

    intjCharacteristics: "မဟာဗျူဟာကျ; လွတ်လပ်; ဆုံးဖြတ်ချက်ပြတ်သား; ဆန်းသစ်; စိတ်ခံစားမှုထက် ယုတ္တိကို ဦးစားပေးသည်။",
    intpCharacteristics: "ခွဲခြမ်းစိတ်ဖြာတတ်; စူးစမ်းလိုစိတ်ပြင်းပြ; တည်ငြိမ်; ဓမ္မဓိဋ္ဌာန်ကျ; သီအိုရီဆိုင်ရာ ပြဿနာများကို နှစ်သက်သည်။",
    entjCharacteristics: "ခေါင်းဆောင်မှုစွမ်းရည်ရှိ; ယုံကြည်မှုရှိ; ထိရောက်; ပွင့်လင်း; ရည်မှန်းချက်ကို ဦးတည်သည်။",
    entpCharacteristics: "တီထွင်ဖန်တီးနိုင်စွမ်းရှိ; စိတ်အားထက်သန်; အငြင်းအခုံလုပ်တတ်; ပြဿနာဖြေရှင်းနိုင်စွမ်းရှိ; ပုံမှန်အလုပ်များကို မကြိုက်။",
    infjCharacteristics: "ထိုးထွင်းသိမြင်မှုရှိ; ကိုယ်ကျင့်တရားစောင့်ထိန်း; ကရုဏာကြီးမား; ကိုယ်ရေးကိုယ်တာကို တန်ဖိုးထား; အဓိပ္ပာယ်ကို ရှာဖွေသည်။",
    infpCharacteristics: "စိတ်ကူးယဉ်ဝါဒီ; စာနာတတ်; တီထွင်ဖန်တီးနိုင်စွမ်းရှိ; တန်ဖိုးထားမှုများကို ဦးတည်; ပဋိပက္ခကို ရှောင်ရှားသည်။",
    enfjCharacteristics: "ဆွဲဆောင်မှုရှိ; နားချတတ်; အများအကျိုးဆောင်; စနစ်တကျရှိ; အခြားသူများကို စေ့ဆော်သည်။",
    enfpCharacteristics: "စိတ်ကူးဉာဏ်ကြွယ်ဝ; တက်ကြွ; ဖော်ရွေ; အကောင်းမြင်; ကန့်သတ်ချက်များကို မကြိုက်။",
    istjCharacteristics: "တာဝန်ယူတတ်; ယုံကြည်စိတ်ချရ; အသေးစိတ်ကို ဂရုပြု; ထုံးတမ်းစဉ်လာကို လိုက်နာ; စည်းစနစ်ကို ဦးစားပေးသည်။",
    isfjCharacteristics: "ပံ့ပိုးတတ်; သစ္စာရှိ; ထောက်ထားစာနာတတ်; လက်တွေ့ကျ; အပ်နှံသည်။",
    estjCharacteristics: "စနစ်တကျရှိ; ဆုံးဖြတ်ချက်ပြတ်သား; တိုက်ရိုက်; စည်းမျဉ်းလိုက်နာ; ထိရောက်သော စီမံခန့်ခွဲသူ။",
    esfjCharacteristics: "ဂရုစိုက်တတ်; ဖော်ရွေ; သဟဇာတဖြစ်; လက်တွေ့ကျ; ဝန်ဆောင်မှုပေးလိုစိတ်ရှိသည်။",
    istpCharacteristics: "လိုက်လျောညီထွေဖြစ်အောင်နေတတ်; လွတ်လပ်; ခွဲခြမ်းစိတ်ဖြာတတ်; လက်တွေ့လုပ်ဆောင်; လုပ်ဆောင်မှုကို ဦးတည်သည်။",
    isfpCharacteristics: "အနုပညာဆန်; နူးညံ့သိမ်မွေ့; ပြောင်းလွယ်ပြင်လွယ်ရှိ; စူးစမ်းလေ့လာတတ်; အလှအပကို တန်ဖိုးထားသည်။",
    estpCharacteristics: "တက်ကြွ; လက်တွေ့ကျ; ဖော်ရွေ; စွန့်စားလိုစိတ်ရှိ; လုပ်ဆောင်မှုတွင် ထူးချွန်သည်။",
    esfpCharacteristics: "တက်ကြွ; အလိုအလျောက်ဖြစ်ပေါ်; ဖော်ရွေ; ရက်ရော; အများ၏အာရုံစိုက်မှုကို နှစ်သက်သည်။",

    intjCareers: "သိပ္ပံပညာရှင်; အင်ဂျင်နီယာ; မဟာဗျူဟာမှူး; စနစ်ခွဲခြမ်းစိတ်ဖြာသူ; တက္ကသိုလ်ပါမောက္ခ။",
    intpCareers: "ဆော့ဖ်ဝဲရေးဆွဲသူ; သုတေသီ; ဒဿနပညာရှင်; နည်းပညာဆိုင်ရာ စာရေးသူ; ခွဲခြမ်းစိတ်ဖြာသူ။",
    entjCareers: "စီအီးအို; စီးပွားရေးလုပ်ငန်းရှင်; မန်နေဂျာ; အတိုင်ပင်ခံ; ရှေ့နေ။",
    entpCareers: "ဆန်းသစ်တီထွင်သူ; စီးပွားရေးလုပ်ငန်းရှင်; ရှေ့နေ; နိုင်ငံရေးမဟာဗျူဟာမှူး; အတိုင်ပင်ခံ။",
    infjCareers: "အတိုင်ပင်ခံ; စိတ်ပညာရှင်; စာရေးဆရာ; လူမှုဝန်ထမ်း; ဆရာ။",
    infpCareers: "စာရေးဆရာ; အနုပညာရှင်; အတိုင်ပင်ခံ; ဂရပ်ဖစ်ဒီဇိုင်နာ; အကျိုးအမြတ်မယူသော အဖွဲ့အစည်းဝန်ထမ်း။",
    enfjCareers: "ဆရာ; လူ့စွမ်းအားအရင်းအမြစ်မန်နေဂျာ; ပွဲစီစဉ်သူ; အရောင်းမန်နေဂျာ; နိုင်ငံရေးသမား။",
    enfpCareers: "သတင်းထောက်; စျေးကွက်ရှာဖွေရေးမန်နေဂျာ; သရုပ်ဆောင်; စီးပွားရေးလုပ်ငန်းရှင်; တီထွင်ဖန်တီးမှုဆိုင်ရာ ဒါရိုက်တာ။",
    istjCareers: "စာရင်းကိုင်; ပရောဂျက်မန်နေဂျာ; ထောက်ပံ့ပို့ဆောင်ရေးညှိနှိုင်းရေးမှူး; စာရင်းစစ်; ဒေတာဘေ့စ်အုပ်ချုပ်ရေးမှူး။",
    isfjCareers: "သူနာပြု; ဆရာ; လူမှုဝန်ထမ်း; ရုံးမန်နေဂျာ; တိရစ္ဆာန်ဆေးကုဆရာဝန်။",
    estjCareers: "မန်နေဂျာ; စီးပွားရေးအုပ်ချုပ်ရေးမှူး; ရဲအရာရှိ; တရားသူကြီး; ဘဏ္ဍာရေးအရာရှိ။",
    esfjCareers: "ဆရာ; ကျန်းမာရေးစောင့်ရှောက်မှုပေးသူ; ပွဲညှိနှိုင်းရေးမှူး; ဖောက်သည်ဝန်ဆောင်မှုကိုယ်စားလှယ်; လူ့စွမ်းအားအရင်းအမြစ်ကျွမ်းကျင်သူ။",
    istpCareers: "စက်ပြင်ဆရာ; အင်ဂျင်နီယာ; လေယာဉ်မှူး; မှုခင်းသိပ္ပံပညာရှင်; စားဖိုမှူး။",
    isfpCareers: "အနုပညာရှင်; ဂီတပညာရှင်; ဖက်ရှင်ဒီဇိုင်နာ; ဓာတ်ပုံဆရာ; ပန်းအလှဆင်သူ။",
    estpCareers: "အရောင်းသမား; စီးပွားရေးလုပ်ငန်းရှင်; အရေးပေါ်ဆေးဘက်ဆိုင်ရာကျွမ်းကျင်သူ; စျေးကွက်ရှာဖွေရေးကျွမ်းကျင်သူ; စတော့ရှယ်ယာပွဲစား။",
    esfpCareers: "ဖျော်ဖြေသူ; ပွဲစီစဉ်သူ; ခရီးသွားလမ်းညွှန်; အရောင်းကိုယ်စားလှယ်; လေယာဉ်မယ်။",
  }
};
// --- END TRANSLATIONS ---


type QuizState = 'not_started' | 'in_progress' | 'completed';

const getLucideIcon = (iconName?: string): LucideIcon => {
  if (iconName && iconName in LucideIcons) {
    return LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
  }
  return HelpCircle;
};

const asteriskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (!domain) return "Invalid Email";
  if (localPart.length <= 4) {
    return `${localPart.substring(0, 1)}${"*".repeat(Math.max(0, localPart.length - 1))}@${domain}`;
  }
  return `${localPart.substring(0, 4)}${"*".repeat(localPart.length - 4)}@${domain}`;
};


export default function PersonalityTestsClient() {
  const { language } = useLanguage();
  const t = personalityTestsPageTranslations[language];
  const { user: loggedInUser } = useAuth();

  const [quizState, setQuizState] = useState<QuizState>('not_started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<DichotomyPair, Record<DichotomyLetter, number>>>({
    EI: { E: 0, I: 0 } as Record<DichotomyLetter, number>, // Ensure all keys are present for type safety
    SN: { S: 0, N: 0 } as Record<DichotomyLetter, number>,
    TF: { T: 0, F: 0 } as Record<DichotomyLetter, number>,
    JP: { J: 0, P: 0 } as Record<DichotomyLetter, number>,
  });
  const [selectedOptionForCurrentQuestion, setSelectedOptionForCurrentQuestion] = useState<DichotomyLetter | null>(null);
  const [resultType, setResultType] = useState<MbtiType | null>(null);
  const [quizHistory, setQuizHistory] = useState<MbtiQuizCompletionRecord[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem(QUIZ_HISTORY_STORAGE_KEY);
    if (storedHistory) {
      try { setQuizHistory(JSON.parse(storedHistory)); }
      catch (e) { console.error("Failed to parse quiz history:", e); setQuizHistory([]); }
    }
  }, []);

  const currentQuestion: MbtiQuestion | undefined = mbtiQuizQuestions[currentQuestionIndex];

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({
      EI: { E: 0, I: 0 } as Record<DichotomyLetter, number>,
      SN: { S: 0, N: 0 } as Record<DichotomyLetter, number>,
      TF: { T: 0, F: 0 } as Record<DichotomyLetter, number>,
      JP: { J: 0, P: 0 } as Record<DichotomyLetter, number>,
    });
    setSelectedOptionForCurrentQuestion(null);
    setResultType(null);
    setQuizState('in_progress');
  };

  const handleAnswerSelect = (dichotomy: DichotomyPair, preference: DichotomyLetter) => {
    setSelectedOptionForCurrentQuestion(preference);
  };

  const getTranslatedText = (textObj: TranslatedText | undefined): string => {
    if (!textObj) return "";
    return textObj[language] || textObj.en;
  };
  
  const getTranslatedArray = (key: string | undefined): string[] => {
    if (!key || !(key in t)) return [];
    const entry = t[key as keyof typeof t];
    if (typeof entry === 'string') { // Check if it's a string (actual translation)
      return entry.split(';').map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
  };


  const calculateAndSetResults = () => {
    let finalType = "";
    finalType += (answers.EI.E >= answers.EI.I) ? 'E' : 'I';
    finalType += (answers.SN.S >= answers.SN.N) ? 'S' : 'N';
    finalType += (answers.TF.T >= answers.TF.F) ? 'T' : 'F';
    finalType += (answers.JP.J >= answers.JP.P) ? 'J' : 'P';

    const determinedType = mbtiTypes.find(type => type.id === finalType);
    setResultType(determinedType || mbtiTypes[0]); // Fallback if something unexpected happens
    setQuizState('completed');

    if (determinedType) {
      const userIdentifier = loggedInUser ? asteriskEmail(loggedInUser.email) : "Guest";
      const typeTitle = getTranslatedText(t[determinedType.titleKey as keyof typeof t] as TranslatedText | undefined) || determinedType.titleKey;


      const newRecord: MbtiQuizCompletionRecord = {
        id: `hist-mbti-${Date.now()}`,
        userIdentifier,
        mbtiType: determinedType.id,
        mbtiTitle: typeTitle,
        mbtiIconName: determinedType.iconName,
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
    if (!currentQuestion || !selectedOptionForCurrentQuestion) return;

    setAnswers(prevAnswers => {
      const newAnswers = { ...prevAnswers };
      const dichotomyPair = currentQuestion.dichotomy;
      // Initialize if not present (should not happen with new structure)
      if (!newAnswers[dichotomyPair]) newAnswers[dichotomyPair] = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 } as any;

      newAnswers[dichotomyPair][selectedOptionForCurrentQuestion] = (newAnswers[dichotomyPair][selectedOptionForCurrentQuestion] || 0) + 1;
      return newAnswers;
    });


    if (currentQuestionIndex < mbtiQuizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionForCurrentQuestion(null); // Reset for next question
    } else {
      calculateAndSetResults();
    }
  };
  
  const progressPercentage = mbtiQuizQuestions.length > 0
    ? ((currentQuestionIndex + 1) / mbtiQuizQuestions.length) * 100
    : 0;

  const PossibleTypesSection = () => (
    <section className="w-full max-w-4xl mt-10 md:mt-12">
      <h2 className="text-xl md:text-2xl font-bold font-headline mb-4 md:mb-6 text-center flex items-center justify-center">
        <ListChecks className="mr-2 md:mr-3 h-6 w-6 text-primary" />
        {t.possibleTypesTitle}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {mbtiTypes.map(type => {
          const TypeIcon = getLucideIcon(type.iconName);
          const title = getTranslatedText(t[type.titleKey as keyof typeof t] as TranslatedText | undefined) || type.titleKey;
          const group = getTranslatedText(t[type.groupKey as keyof typeof t] as TranslatedText | undefined) || type.groupKey;
          return (
            <Card key={type.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col items-center text-center p-3">
              <TypeIcon className="h-7 w-7 md:h-8 md:w-8 text-accent mb-1.5" />
              <CardTitle className="text-sm md:text-base font-semibold">{type.id}</CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground leading-tight">{title}</CardDescription>
              <p className="text-xs text-muted-foreground/80 mt-0.5">({group})</p>
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
              const TypeIcon = getLucideIcon(record.mbtiIconName);
              return (
                <Card key={record.id} className="p-2 sm:p-3 bg-card hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-5 w-5 text-accent shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground">{record.mbtiTitle} ({record.mbtiType})</p>
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
        <PossibleTypesSection />
        <Separator className="my-6 md:my-8 w-full max-w-3xl" />
        <HistoryBoardSection />
      </div>
    );
  }

  if (quizState === 'in_progress') {
    if (!currentQuestion) return <p>Loading question...</p>;
    return (
      <div className="max-w-md md:max-w-lg mx-auto px-2">
        <Card className="shadow-xl">
          <CardHeader>
            <Progress value={progressPercentage} className="w-full h-1 md:h-1.5 mb-1.5 md:mb-2" />
            <CardTitle className="text-xs md:text-sm font-headline text-center text-muted-foreground">
              {t.questionProgress
                .replace('{current}', (currentQuestionIndex + 1).toString())
                .replace('{total}', mbtiQuizQuestions.length.toString())
              }
            </CardTitle>
            <CardDescription className="text-md md:text-lg text-center text-foreground pt-1 md:pt-1.5 min-h-[50px] md:min-h-[60px]">
              {getTranslatedText(currentQuestion.text)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedOptionForCurrentQuestion || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.dichotomy, value as DichotomyLetter)}
              className="space-y-2 md:space-y-2.5"
            >
              {currentQuestion.options.map(option => (
                <Label
                  key={option.value}
                  htmlFor={`option-${currentQuestion.id}-${option.value}`}
                  className={cn(
                    "flex items-center space-x-1.5 md:space-x-2 p-2.5 md:p-3 border rounded-md cursor-pointer transition-all text-xs leading-snug md:text-sm",
                    selectedOptionForCurrentQuestion === option.value ? 'bg-primary/10 border-primary ring-1 ring-primary' : 'hover:bg-muted/50'
                  )}
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
              disabled={!selectedOptionForCurrentQuestion}
            >
              {currentQuestionIndex < mbtiQuizQuestions.length - 1 ? t.nextButton : t.seeResultsButton}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quizState === 'completed' && resultType) {
    const ResultIcon = getLucideIcon(resultType.iconName);
    const typeTitle = getTranslatedText(t[resultType.titleKey as keyof typeof t] as TranslatedText | undefined) || resultType.titleKey;
    const typeGroup = getTranslatedText(t[resultType.groupKey as keyof typeof t] as TranslatedText | undefined) || resultType.groupKey;
    const typeDescription = getTranslatedText(t[resultType.descriptionKey as keyof typeof t] as TranslatedText | undefined);
    const characteristics = getTranslatedArray(t[resultType.characteristicsKey as keyof typeof t] as string | undefined);
    const careers = getTranslatedArray(t[resultType.careerSuggestionsKey as keyof typeof t] as string | undefined);

    return (
      <div className="max-w-xl md:max-w-2xl mx-auto px-2">
        <Card className="shadow-xl text-center">
          <CardHeader>
            <ResultIcon className="mx-auto h-10 w-10 md:h-12 md:w-12 text-primary mb-1.5 md:mb-2" />
            <CardTitle className="text-lg md:text-xl font-headline text-muted-foreground">{t.resultTitle}</CardTitle>
            <CardDescription className="text-xl md:text-3xl font-bold text-accent pt-0.5">
              {resultType.id} - {typeTitle}
            </CardDescription>
            <p className="text-sm text-muted-foreground">({typeGroup})</p>
          </CardHeader>
          <CardContent className="text-left space-y-4">
            <p className="text-sm md:text-base text-foreground/90">{typeDescription}</p>
            
            <div>
              <h3 className="text-md font-semibold mb-1.5 flex items-center"><BarChartHorizontalBig className="mr-2 h-5 w-5 text-primary"/>{t.characteristicsSectionTitle}</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 pl-2">
                {characteristics.map((char, idx) => <li key={idx}>{char}</li>)}
                {characteristics.length === 0 && <li>Characteristics will be listed here.</li>}
              </ul>
            </div>

            <div>
              <h3 className="text-md font-semibold mb-1.5 flex items-center"><SearchCode className="mr-2 h-5 w-5 text-primary"/>{t.careerPathSectionTitle}</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 pl-2">
                {careers.map((career, idx) => <li key={idx}>{career}</li>)}
                {careers.length === 0 && <li>Career suggestions will be listed here.</li>}
              </ul>
            </div>
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

  return <p className="text-center py-10">Loading quiz or an unexpected state occurred...</p>;
}
