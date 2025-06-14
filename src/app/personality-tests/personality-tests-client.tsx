
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
      q_ei1_text: "I prefer to spend my free time actively engaging with a large group of friends or new acquaintances.",
      q_ei2_text: "I find solitude and quiet time essential for recharging my energy.",
      q_ei3_text: "I enjoy being the center of attention in social settings.",
      q_ei4_text: "I usually prefer one-on-one conversations over group discussions.",
      q_ei5_text: "I am often the one to initiate conversations with new people.",
      q_ei6_text: "After a lot of social interaction, I feel drained and need alone time.",
      q_ei7_text: "I like to talk things through with others to understand them better.",
      q_ei8_text: "I prefer to reflect internally to understand things deeply.",
      q_ei9_text: "I am generally outgoing and expressive with my thoughts and feelings.",
      q_ei10_text: "In new situations, I tend to be more reserved and quiet at first.",
      q_ei11_text: "I find it relatively easy to make new friends and acquaintances.",
      q_ei12_text: "In conversations, I tend to listen more than I talk.",
      q_ei13_text: "Brainstorming ideas with a group energizes me.",
      q_ei14_text: "I prefer to work on projects alone or in a small, quiet group.",
      q_ei15_text: "I am often uncomfortable in large social gatherings and prefer smaller get-togethers.",
      q_sn1_text: "When making decisions, I rely more on concrete facts and past experiences.",
      q_sn2_text: "I often trust my intuition and focus on the underlying patterns and future possibilities.",
      q_sn3_text: "I prefer practical, hands-on learning experiences.",
      q_sn4_text: "I enjoy exploring abstract theories and concepts.",
      q_sn5_text: "My focus is typically on what is real and actual in the present.",
      q_sn6_text: "I often think about the deeper meaning or implications behind things.",
      q_sn7_text: "I value clear, step-by-step instructions and established methods.",
      q_sn8_text: "I enjoy coming up with new and innovative ways of doing things.",
      q_sn9_text: "I am usually more interested in the specific details rather than the overall picture.",
      q_sn10_text: "I tend to see the big picture and connections between ideas easily.",
      q_sn11_text: "I trust what is certain, tangible, and concrete.",
      q_sn12_text: "I am often inspired by new ideas and future possibilities.",
      q_sn13_text: "I prefer to live in the present moment and deal with current realities.",
      q_sn14_text: "I tend to focus on future outcomes and potential developments.",
      q_sn15_text: "I often find myself daydreaming or getting lost in my thoughts and ideas.",
      q_tf1_text: "I value fairness and logical consistency above maintaining harmony in a group.",
      q_tf2_text: "I prioritize empathy and considering others' feelings when making decisions, even if it's less efficient.",
      q_tf3_text: "My decisions are primarily based on objective analysis and reasoning.",
      q_tf4_text: "I always consider how my decisions will affect others' emotions and well-being.",
      q_tf5_text: "People might describe me as direct or critical when I offer feedback.",
      q_tf6_text: "I strive to create a supportive and encouraging environment for others.",
      q_tf7_text: "I believe it's important to uphold truth and principles, even if it causes discomfort.",
      q_tf8_text: "I prefer to seek harmony and avoid conflict whenever possible.",
      q_tf9_text: "I think it's crucial to be rational and impartial in most situations.",
      q_tf10_text: "I am highly attuned to the emotional atmosphere and how others are feeling.",
      q_tf11_text: "I naturally critique ideas to find flaws and improve them.",
      q_tf12_text: "I value cooperation and work towards achieving consensus in groups.",
      q_tf13_text: "I find it relatively easy to set aside my emotions when making important decisions.",
      q_tf14_text: "I am primarily driven by a desire to help and support other people.",
      q_tf15_text: "I often find that my heart rules my head when making choices.",
      q_jp1_text: "I like to have things planned out and prefer a structured, organized approach to tasks.",
      q_jp2_text: "I enjoy being spontaneous and flexible, adapting to new situations as they arise.",
      q_jp3_text: "I prefer to make decisions quickly and move on.",
      q_jp4_text: "I like to keep my options open and may delay making decisions.",
      q_jp5_text: "I feel more comfortable and productive when things are settled and organized.",
      q_jp6_text: "I enjoy adapting to new or unexpected situations as they come.",
      q_jp7_text: "I work best when I have clear deadlines and a set schedule.",
      q_jp8_text: "I often work in bursts of energy, especially when a deadline is approaching.",
      q_jp9_text: "I like to complete tasks well in advance before relaxing.",
      q_jp10_text: "I see rules and procedures more as flexible guidelines than strict requirements.",
      q_jp11_text: "I value order, predictability, and closure in my work and life.",
      q_jp12_text: "I often enjoy starting new projects more than I enjoy finishing existing ones.",
      q_jp13_text: "I dislike surprises and last-minute changes to plans.",
      q_jp14_text: "I find too much routine and structure to be confining and boring.",
      q_jp15_text: "I often procrastinate and find myself doing things at the last minute.",
      submittingResults: "Submitting your results...", submissionSuccess: "Results submitted successfully!", submissionError: "Failed to submit results. Please try again.", errorCalculatingType: "Error calculating personality type.",
      recentCompletionsTitle: "Recent Quiz Completions", historyUser: "User", historyStyle: "Type", historyDate: "Date", noHistory: "No quiz completions recorded yet.", possibleTypesTitle: "Possible Personality Types",
    },
    my: { 
      pageTitle: "ကိုယ်ရည်ကိုယ်သွေး စစ်ဆေးမှု", pageDescription: "သင်၏ အားသာချက်များကို ရှာဖွေပါ။",
      quizIntroTitle: "သင်၏ ကိုယ်ရည်ကိုယ်သွေးကို နားလည်ပါ", quizIntroDescription: "ဤစစ်ဆေးမှုသည် သင့်ကိုယ်သင် ပိုမိုနားလည်စေရန် ကူညီပေးပါလိမ့်မည်။ အမှန်ကန်ဆုံးရလဒ်များရရှိရန် ရိုးသားစွာဖြေဆိုပါ။",
      startQuizButton: "ကိုယ်ရည်ကိုယ်သွေး စစ်ဆေးမှု စတင်ပါ", nextButton: "နောက်တစ်ခု", backButton: "နောက်သို့", submitButton: "တင်သွင်းပြီး အမျိုးအစားကြည့်ရန်", seeResultsButton: "အမျိုးအစားကြည့်ရန်", retakeQuizButton: "ထပ်မံဖြေဆိုပါ",
      questionProgress: "မေးခွန်း {current} / {total}", resultTitle: "သင်၏ ကိုယ်ရည်ကိုယ်သွေး:",
      shareResultButton: "မျှဝေမည်", shareResultText: "ကျွန်ုပ် {type} - {title} ဖြစ်သည်ကို ရှာဖွေတွေ့ရှိခဲ့သည်! သင်၏အမျိုးအစားကို ရှာဖွေပါ: {url}",
      likertStronglyDisagree: "လုံးဝ သဘောမတူပါ", likertDisagree: "သဘောမတူပါ", likertNeutral: "ကြားနေ", likertAgree: "သဘောတူပါ", likertStronglyAgree: "လုံးဝ သဘောတူပါ",
      analystsGroup: "သုံးသပ်သူများ", diplomatsGroup: "သံတမန်များ", sentinelsGroup: "အစောင့်အရှောက်များ", explorersGroup: "စူးစမ်းရှာဖွေသူများ",
      intjTitle: "INTJ - ဗိသုကာ", intpTitle: "INTP - ယုတ္တိပညာရှင်", entjTitle: "ENTJ - တပ်မှူး", entpTitle: "ENTP - အငြင်းအခုံသမား",
      infjTitle: "INFJ - ထောက်ခံသူ", infpTitle: "INFP - ဖျန်ဖြေသူ", enfjTitle: "ENFJ - အဓိကဇာတ်ဆောင်", enfpTitle: "ENFP - လှုံ့ဆော်သူ",
      istjTitle: "ISTJ - ထောက်ပံ့ပို့ဆောင်ရေးသမား", isfjTitle: "ISFJ - ကာကွယ်သူ", estjTitle: "ESTJ - အုပ်ချုပ်ရေးမှူး", esfjTitle: "ESFJ - အတိုင်ပင်ခံ",
      istpTitle: "ISTP - ကျွမ်းကျင်သူ", isfpTitle: "ISFP - စွန့်စားသူ", estpTitle: "ESTP - စီးပွားရေးလုပ်ငန်းရှင်", esfpTitle: "ESFP - ဖျော်ဖြေသူ",
      intjDescription: "အရာရာတိုင်းအတွက် အစီအစဉ်ရှိသော မဟာဗျူဟာကျသည့် တွေးခေါ်ရှင်များ။", intpDescription: "ဗဟုသုတကို အစဉ်လိုလားသော တီထွင်သူများ။", entjDescription: "ရဲရင့်ပြီး စိတ်ဓာတ်ခိုင်မာသော ခေါင်းဆောင်များ။", entpDescription: "စမတ်ကျပြီး စူးစမ်းလိုစိတ်ပြင်းပြကာ စိန်ခေါ်မှုများကို နှစ်သက်သူများ။",
      infjDescription: "တိတ်ဆိတ်ပြီး နက်နဲကာ စိတ်ဓာတ်တက်ကြွစေသော စံပြုစရာ ပုဂ္ဂိုလ်များ။", infpDescription: "ကဗျာဆန်ပြီး ကြင်နာတတ်ကာ အများအကျိုးသယ်ပိုးတတ်သော ပုဂ္ဂိုလ်များ။", enfjDescription: "ဆွဲဆောင်မှုရှိပြီး စိတ်ဓာတ်တက်ကြွစေသော ခေါင်းဆောင်များ။", enfpDescription: "စိတ်အားထက်သန်ပြီး တီထွင်ဖန်တီးနိုင်စွမ်းရှိကာ ဖော်ရွေသော ပုဂ္ဂိုလ်များ။",
      istjDescription: "လက်တွေ့ကျပြီး အချက်အလက်ကို အခြေခံကာ ယုံကြည်အားကိုးရသော ပုဂ္ဂိုလ်များ။", isfjDescription: "မြှုပ်နှံပြီး နွေးထွေးသော ကာကွယ်စောင့်ရှောက်သူများ။", estjDescription: "အရာရာကို စီမံခန့်ခွဲနိုင်သော ထူးချွန်သည့် အုပ်ချုပ်သူများ။", esfjDescription: "ဂရုစိုက်တတ်ပြီး လူမှုဆက်ဆံရေးကောင်းမွန်ကာ လူချစ်လူခင်ပေါများသော ပုဂ္ဂိုလ်များ။",
      istpDescription: "ရဲရင့်ပြီး လက်တွေ့ကျသော စမ်းသပ်လုပ်ကိုင်တတ်သူများ။", isfpDescription: "ပြောင်းလွယ်ပြင်လွယ်ရှိပြီး ဆွဲဆောင်မှုရှိသော အနုပညာရှင်များ။", estpDescription: "စမတ်ကျပြီး တက်ကြွကာ ပတ်ဝန်းကျင်ကို သတိပြုမိသော ပုဂ္ဂိုလ်များ။", esfpDescription: "အလိုအလျောက် တက်ကြွပြီး စိတ်အားထက်သန်သော ဖျော်ဖြေသူများ။",
      characteristicsSectionTitle: "အဓိက လက္ခဏာများ",
      intjCharacteristics: "မဟာဗျူဟာကျ;လွတ်လပ်;ဆုံးဖြတ်ချက်ပြတ်သား", intpCharacteristics: "ခွဲခြမ်းစိတ်ဖြာတတ်;စူးစမ်းလိုစိတ်ရှိ;ဓမ္မဓိဋ္ဌာန်ကျ", entjCharacteristics: "ခေါင်းဆောင်မှုကောင်း;ယုံကြည်မှုရှိ;ထိရောက်", entpCharacteristics: "တီထွင်နိုင်စွမ်းရှိ;စိတ်အားထက်သန်;ပြဿနာဖြေရှင်းနိုင်စွမ်းရှိ",
      infjCharacteristics: "ထိုးထွင်းဉာဏ်ရှိ;ကိုယ်ကျင့်တရားကောင်း;ကရုဏာကြီးမား", infpCharacteristics: "စံပြုထိုက်;စာနာတတ်;ဖန်တီးနိုင်စွမ်းရှိ", enfjCharacteristics: "ဆွဲဆောင်မှုရှိ;နားချတတ်;အများအကျိုးဆောင်", enfpCharacteristics: "စိတ်ကူးဉာဏ်ကြွယ်ဝ;တက်ကြွ;ဖော်ရွေ",
      istjCharacteristics: "တာဝန်ယူမှုရှိ;အားကိုးထိုက်;အသေးစိတ်ဂရုပြု", isfjCharacteristics: "ပံ့ပိုးတတ်;သစ္စာရှိ;ထောက်ထားစာနာတတ်", estjCharacteristics: "စနစ်တကျရှိ;ဆုံးဖြတ်ချက်ပြတ်သား;တိုက်ရိုက်", esfjCharacteristics: "ဂရုစိုက်တတ်;ဖော်ရွေ;သဟဇာတဖြစ်",
      istpCharacteristics: "လိုက်လျောညီထွေရှိ;လွတ်လပ်;ခွဲခြမ်းစိတ်ဖြာတတ်", isfpCharacteristics: "အနုပညာဆန်;နူးညံ့;ပြောင်းလွယ်ပြင်လွယ်ရှိ", estpCharacteristics: "တက်ကြွ;လက်တွေ့ကျ;ဖော်ရွေ", esfpCharacteristics: "တက်ကြွ;အလိုအလျောက်;ဖော်ရွေ",
      careerPathSectionTitle: "အကြံပြုထားသော အသက်မွေးဝမ်းကျောင်း လမ်းကြောင်းများ",
      intjCareers: "သိပ္ပံပညာရှင်;အင်ဂျင်နီယာ;မဟာဗျူဟာမှူး", intpCareers: "ဆော့ဖ်ဝဲရေးဆွဲသူ;သုတေသီ;ဒဿနပညာရှင်", entjCareers: "အမှုဆောင်အရာရှိချုပ်;စီးပွားရေးလုပ်ငန်းရှင်;မန်နေဂျာ", entpCareers: "ဆန်းသစ်တီထွင်သူ;စီးပွားရေးလုပ်ငန်းရှင်;ရှေ့နေ",
      infjCareers: "အတိုင်ပင်ခံ;စိတ်ပညာရှင်;စာရေးဆရာ", infpCareers: "စာရေးဆရာ;အနုပညာရှင်;အတိုင်ပင်ခံ", enfjCareers: "ဆရာ;လူ့စွမ်းအားအရင်းအမြစ်မန်နေဂျာ;ပွဲစီစဉ်သူ", enfpCareers: "သတင်းထောက်;စျေးကွက်မန်နေဂျာ;သရုပ်ဆောင်",
      istjCareers: "စာရင်းကိုင်;စီမံကိန်းမန်နေဂျာ;ထောက်ပံ့ပို့ဆောင်ရေးညှိနှိုင်းရေးမှူး", isfjCareers: "သူနာပြု;ဆရာ;လူမှုဝန်ထမ်း", estjCareers: "မန်နေဂျာ;စီးပွားရေးအုပ်ချုပ်သူ;ရဲအရာရှိ", esfjCareers: "ဆရာ;ကျန်းမာရေးဝန်ထမ်း;ပွဲညှိနှိုင်းရေးမှူး",
      istpCareers: "စက်ပြင်ဆရာ;အင်ဂျင်နီယာ;လေယာဉ်မှူး", isfpCareers: "အနုပညာရှင်;ဂီတပညာရှင်;ဖက်ရှင်ဒီဇိုင်နာ", estpCareers: "အရောင်းသမား;စီးပွားရေးလုပ်ငန်းရှင်;အရေးပေါ်ဆေးဘက်ဆိုင်ရာပညာရှင်", esfpCareers: "ဖျော်ဖြေသူ;ပွဲစီစဉ်သူ;ခရီးသွားလမ်းညွှန်",
      q_ei1_text: "ကျွန်ုပ်သည် အားလပ်ချိန်များတွင် မိတ်ဆွေအများအပြား သို့မဟုတ် မိတ်ဆွေသစ်များနှင့် တက်တက်ကြွကြွ ပေါင်းသင်းဆက်ဆံလိုပါသည်။",
      q_ei2_text: "ကျွန်ုပ်၏စွမ်းအင်ကို ပြန်လည်ဖြည့်တင်းရန်အတွက် တကိုယ်တည်းနေခြင်းနှင့် တိတ်ဆိတ်ငြိမ်သက်သောအချိန်သည် မရှိမဖြစ်လိုအပ်သည်ဟု တွေ့ရှိရပါသည်။",
      q_ei3_text: "လူမှုရေးပွဲများတွင် အာရုံစိုက်ခံရခြင်းကို နှစ်သက်ပါသည်။",
      q_ei4_text: "အုပ်စုဖွဲ့စကားပြောခြင်းထက် တစ်ဦးချင်းစကားပြောဆိုမှုကို ပိုနှစ်သက်လေ့ရှိပါသည်။",
      q_ei5_text: "လူသစ်များနှင့် စကားစမြည်ပြောဆိုမှုကို ကျွန်ုပ်က ဦးဆောင်စတင်လေ့ရှိပါသည်။",
      q_ei6_text: "လူအများနှင့် အချိန်ကြာမြင့်စွာ ပေါင်းသင်းဆက်ဆံပြီးနောက် ပင်ပန်းနွမ်းနယ်ပြီး တစ်ယောက်တည်းနေရန် လိုအပ်သည်ဟု ခံစားရပါသည်။",
      q_ei7_text: "အကြောင်းအရာများကို ပိုမိုနားလည်ရန် အခြားသူများနှင့် ဆွေးနွေးတိုင်ပင်လိုပါသည်။",
      q_ei8_text: "အကြောင်းအရာများကို နက်နက်နဲနဲ နားလည်ရန် ကိုယ်တိုင်အတွင်းစိတ်မှ ပြန်လည်သုံးသပ်လိုပါသည်။",
      q_ei9_text: "ကျွန်ုပ်သည် ယေဘုယျအားဖြင့် ပွင့်လင်းပြီး ကျွန်ုပ်၏အတွေးအမြင်နှင့် ခံစားချက်များကို ဖော်ပြလေ့ရှိပါသည်။",
      q_ei10_text: "အခြေအနေသစ်များတွင် အစပိုင်း၌ ပို၍ထိန်းထိန်းသိမ်းသိမ်းနှင့် တိတ်ဆိတ်နေလေ့ရှိပါသည်။",
      q_ei11_text: "မိတ်ဆွေသစ်များနှင့် အသိမိတ်ဆွေသစ်များဖွဲ့ရန် အတော်လေး လွယ်ကူသည်ဟု တွေ့ရှိရပါသည်။",
      q_ei12_text: "စကားပြောဆိုမှုများတွင် ကျွန်ုပ်သည် စကားပြောခြင်းထက် နားထောင်ခြင်းကို ပိုပြုလုပ်လေ့ရှိပါသည်။",
      q_ei13_text: "အုပ်စုဖွဲ့၍ စိတ်ကူးစိတ်သန်းများ ဖလှယ်ခြင်းသည် ကျွန်ုပ်ကို စိတ်အားတက်ကြွစေပါသည်။",
      q_ei14_text: "စီမံကိန်းများကို တစ်ယောက်တည်း သို့မဟုတ် သေးငယ်ပြီး တိတ်ဆိတ်သော အုပ်စုငယ်ဖြင့် လုပ်ဆောင်လိုပါသည်။",
      q_ei15_text: "လူအများအပြားတက်ရောက်သော ပွဲလမ်းသဘင်များတွင် မကြာခဏ မသက်မသာခံစားရပြီး လူနည်းသော တွေ့ဆုံပွဲများကို ပိုနှစ်သက်ပါသည်။",
      q_sn1_text: "ဆုံးဖြတ်ချက်ချသည့်အခါ လက်တွေ့အချက်အလက်များနှင့် ယခင်အတွေ့အကြုံများကို ပိုမိုအားကိုးပါသည်။",
      q_sn2_text: "ကျွန်ုပ်သည် ကျွန်ုပ်၏ပင်ကိုယ်အသိစိတ်ကို မကြာခဏယုံကြည်ပြီး အရင်းခံပုံစံများနှင့် အနာဂတ်ဖြစ်နိုင်ခြေများကို အာရုံစိုက်လေ့ရှိပါသည်။",
      q_sn3_text: "လက်တွေ့ကျပြီး လက်တွေ့လုပ်ဆောင်ရသော သင်ယူမှုအတွေ့အကြုံများကို ပိုနှစ်သက်ပါသည်။",
      q_sn4_text: "သဘောတရားရေးရာများနှင့် အယူအဆရေးရာများကို စူးစမ်းလေ့လာခြင်းကို နှစ်သက်ပါသည်။",
      q_sn5_text: "ကျွန်ုပ်၏အာရုံစိုက်မှုသည် ပုံမှန်အားဖြင့် လက်ရှိအချိန်တွင် အမှန်တကယ်ရှိနေသောအရာများပေါ်တွင် ဖြစ်ပါသည်။",
      q_sn6_text: "အရာများ၏ နောက်ကွယ်ရှိ နက်ရှိုင်းသော အဓိပ္ပာယ် သို့မဟုတ် သက်ရောက်မှုများအကြောင်း မကြာခဏ စဉ်းစားမိပါသည်။",
      q_sn7_text: "ရှင်းလင်းသော၊ အဆင့်ဆင့်ညွှန်ကြားချက်များနှင့် တည်ဆဲနည်းလမ်းများကို တန်ဖိုးထားပါသည်။",
      q_sn8_text: "အသစ်အဆန်းနှင့် ဆန်းသစ်သော လုပ်ဆောင်နည်းများကို တီထွင်ရခြင်းကို နှစ်သက်ပါသည်။",
      q_sn9_text: "ကျွန်ုပ်သည် ပုံမှန်အားဖြင့် အလုံးစုံခြုံငုံသောအမြင်ထက် တိကျသောအသေးစိတ်အချက်အလက်များကို ပို၍စိတ်ဝင်စားပါသည်။",
      q_sn10_text: "ကျွန်ုပ်သည် အလုံးစုံခြုံငုံသောအမြင်နှင့် စိတ်ကူးစိတ်သန်းများအကြား ဆက်စပ်မှုများကို လွယ်ကူစွာ မြင်တွေ့လေ့ရှိပါသည်။",
      q_sn11_text: "သေချာပြီး၊ လက်ဆုပ်လက်ကိုင်ပြနိုင်သော၊ တိကျသောအရာများကို ယုံကြည်ပါသည်။",
      q_sn12_text: "ကျွန်ုပ်သည် အသစ်သောစိတ်ကူးများနှင့် အနာဂတ်ဖြစ်နိုင်ခြေများကြောင့် မကြာခဏ စိတ်အားတက်ကြွမိပါသည်။",
      q_sn13_text: "ကျွန်ုပ်သည် လက်ရှိအချိန်ကာလတွင် နေထိုင်ပြီး လက်ရှိအမှန်တရားများကို ကိုင်တွယ်ဖြေရှင်းလိုပါသည်။",
      q_sn14_text: "ကျွန်ုပ်သည် အနာဂတ်ရလဒ်များနှင့် ဖြစ်ပေါ်လာနိုင်သော တိုးတက်မှုများကို အာရုံစိုက်လေ့ရှိပါသည်။",
      q_sn15_text: "ကျွန်ုပ်သည် မကြာခဏဆိုသလို အတွေးနယ်ချဲ့ခြင်း သို့မဟုတ် ကျွန်ုပ်၏အတွေးအမြင်များနှင့် စိတ်ကူးများထဲတွင် နစ်မျောနေတတ်ပါသည်။",
      q_tf1_text: "အဖွဲ့အတွင်း သဟဇာတဖြစ်မှုကို ထိန်းသိမ်းခြင်းထက် တရားမျှတမှုနှင့် ယုတ္တိကျသော တသမတ်တည်းဖြစ်မှုကို ပိုတန်ဖိုးထားပါသည်။",
      q_tf2_text: "ထိရောက်မှုနည်းပါးစေကာမူ ဆုံးဖြတ်ချက်ချသည့်အခါ အခြားသူများ၏ စိတ်ခံစားချက်ကို စာနာထောက်ထားခြင်းနှင့် ထည့်သွင်းစဉ်းစားခြင်းကို ဦးစားပေးပါသည်။",
      q_tf3_text: "ကျွန်ုပ်၏ဆုံးဖြတ်ချက်များသည် အဓိကအားဖြင့် ဓမ္မဓိဋ္ဌာန်ကျသော ခွဲခြမ်းစိတ်ဖြာမှုနှင့် ကျိုးကြောင်းဆင်ခြင်မှုအပေါ် အခြေခံပါသည်။",
      q_tf4_text: "ကျွန်ုပ်၏ဆုံးဖြတ်ချက်များသည် အခြားသူများ၏ စိတ်ခံစားချက်နှင့် ကောင်းကျိုးချမ်းသာကို မည်သို့အကျိုးသက်ရောက်မည်ကို အမြဲထည့်သွင်းစဉ်းစားပါသည်။",
      q_tf5_text: "တုံ့ပြန်ချက်ပေးသည့်အခါ လူအများက ကျွန်ုပ်ကို တိုက်ရိုက်ပြောတတ်သူ သို့မဟုတ် ဝေဖန်တတ်သူဟု ထင်မြင်နိုင်ပါသည်။",
      q_tf6_text: "ကျွန်ုပ်သည် အခြားသူများအတွက် ပံ့ပိုးကူညီမှုနှင့် အားပေးမှုရှိသော ပတ်ဝန်းကျင်တစ်ခုကို ဖန်တီးရန် ကြိုးပမ်းပါသည်။",
      q_tf7_text: "အဆင်မပြေမှုများ ဖြစ်စေနိုင်သော်လည်း အမှန်တရားနှင့် ကိုယ်ကျင့်တရားဆိုင်ရာ အခြေခံမူများကို ထိန်းသိမ်းရန် အရေးကြီးသည်ဟု ယုံကြည်ပါသည်။",
      q_tf8_text: "ဖြစ်နိုင်သည့်အခါတိုင်း သဟဇာတဖြစ်မှုကို ရှာဖွေပြီး ပဋိပက္ခကို ရှောင်ရှားလိုပါသည်။",
      q_tf9_text: "အခြေအနေအများစုတွင် ကျိုးကြောင်းဆီလျော်ပြီး ဘက်မလိုက်မှုရှိရန် အရေးကြီးသည်ဟု ထင်ပါသည်။",
      q_tf10_text: "ကျွန်ုပ်သည် စိတ်ခံစားမှုဆိုင်ရာ ပတ်ဝန်းကျင်နှင့် အခြားသူများ မည်သို့ခံစားနေရသည်ကို အလွန်အမင်း သတိပြုမိပါသည်။",
      q_tf11_text: "ချို့ယွင်းချက်များကို ရှာဖွေပြီး ပိုမိုကောင်းမွန်အောင်ပြုလုပ်ရန် စိတ်ကူးစိတ်သန်းများကို သဘာဝအတိုင်း ဝေဖန်သုံးသပ်လေ့ရှိပါသည်။",
      q_tf12_text: "ကျွန်ုပ်သည် ပူးပေါင်းဆောင်ရွက်မှုကို တန်ဖိုးထားပြီး အဖွဲ့များတွင် တူညီသောသဘောတူညီချက်ရရှိရန် လုပ်ဆောင်ပါသည်။",
      q_tf13_text: "အရေးကြီးသော ဆုံးဖြတ်ချက်များချသည့်အခါ ကျွန်ုပ်၏စိတ်ခံစားချက်များကို ဘေးဖယ်ထားရန် အတော်လေး လွယ်ကူသည်ဟု တွေ့ရှိရပါသည်။",
      q_tf14_text: "ကျွန်ုပ်သည် အဓိကအားဖြင့် အခြားသူများကို ကူညီပံ့ပိုးလိုစိတ်ဖြင့် တွန်းအားပေးခံရပါသည်။",
      q_tf15_text: "ရွေးချယ်မှုများပြုလုပ်သည့်အခါ ကျွန်ုပ်၏နှလုံးသားက ဦးနှောက်ကို လွှမ်းမိုးနေသည်ကို မကြာခဏ တွေ့ရှိရပါသည်။",
      q_jp1_text: "အလုပ်များကို စီစဉ်ထားပြီး စနစ်တကျချဉ်းကပ်လိုပါသည်။",
      q_jp2_text: "အခြေအနေသစ်များ ပေါ်ပေါက်လာသည်နှင့်အမျှ လိုက်လျောညီထွေစွာ ပြုမူခြင်းဖြင့် ပေါ့ပေါ့ပါးပါး နေထိုင်လိုပါသည်။",
      q_jp3_text: "ဆုံးဖြတ်ချက်များကို လျင်မြန်စွာချပြီး ရှေ့ဆက်လုပ်ဆောင်လိုပါသည်။",
      q_jp4_text: "ကျွန်ုပ်၏ ရွေးချယ်ခွင့်များကို ချန်ထားလိုပြီး ဆုံးဖြတ်ချက်ချရန် နှောင့်နှေးနိုင်ပါသည်။",
      q_jp5_text: "အရာရာကို စီစဉ်တကျထားရှိပြီး ပြီးပြတ်အောင်လုပ်ဆောင်ထားသည့်အခါ ပို၍ သက်တောင့်သက်သာရှိပြီး အလုပ်တွင်သည်ဟု ခံစားရပါသည်။",
      q_jp6_text: "အသစ် သို့မဟုတ် မမျှော်လင့်ထားသော အခြေအနေများ ပေါ်ပေါက်လာသည့်အခါ လိုက်လျောညီထွေစွာ ပြုမူရခြင်းကို နှစ်သက်ပါသည်။",
      q_jp7_text: "ရှင်းလင်းသော အချိန်သတ်မှတ်ချက်များနှင့် စီစဉ်ထားသော အချိန်ဇယားများရှိသည့်အခါ အကောင်းဆုံး လုပ်ဆောင်နိုင်ပါသည်။",
      q_jp8_text: "အထူးသဖြင့် အချိန်နီးကပ်လာသည့်အခါ စွမ်းအင်အပြည့်ဖြင့် အလုပ်လုပ်လေ့ရှိပါသည်။",
      q_jp9_text: "အနားမယူမီ အလုပ်များကို ကောင်းစွာ ကြိုတင်ပြီးစီးအောင် လုပ်ဆောင်လိုပါသည်။",
      q_jp10_text: "စည်းမျဉ်းစည်းကမ်းများနှင့် လုပ်ထုံးလုပ်နည်းများကို တင်းကျပ်သော လိုအပ်ချက်များထက် ပြောင်းလွယ်ပြင်လွယ်ရှိသော လမ်းညွှန်ချက်များအဖြစ် ပို၍ရှုမြင်ပါသည်။",
      q_jp11_text: "ကျွန်ုပ်၏အလုပ်နှင့် ဘဝတွင် စနစ်ကျမှု၊ ကြိုတင်ခန့်မှန်းနိုင်မှုနှင့် ပြီးပြတ်မှုတို့ကို တန်ဖိုးထားပါသည်။",
      q_jp12_text: "လက်ရှိစီမံကိန်းများကို အဆုံးသတ်ခြင်းထက် စီမံကိန်းအသစ်များ စတင်ရခြင်းကို ပို၍နှစ်သက်လေ့ရှိပါသည်။",
      q_jp13_text: "အံ့အားသင့်စရာများနှင့် နောက်ဆုံးမိနစ် အစီအစဉ်ပြောင်းလဲမှုများကို မကြိုက်ပါ။",
      q_jp14_text: "ပုံမှန်လုပ်ရိုးလုပ်စဉ်များနှင့် တင်းကျပ်သောဖွဲ့စည်းပုံများသည် ချုပ်ချယ်ပြီး ပျင်းစရာကောင်းသည်ဟု ယူဆပါသည်။",
      q_jp15_text: "မကြာခဏဆိုသလို အချိန်ဆွဲတတ်ပြီး နောက်ဆုံးမိနစ်မှ အလုပ်များကို လုပ်ဆောင်မိတတ်ပါသည်။",
      submittingResults: "သင်၏ရလဒ်များကို တင်သွင်းနေပါသည်...", submissionSuccess: "ရလဒ်များ အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ!", submissionError: "ရလဒ်များ တင်သွင်းရန် မအောင်မြင်ပါ။ ထပ်မံကြိုးစားပါ။", errorCalculatingType: "ကိုယ်ရည်ကိုယ်သွေး အမျိုးအစား တွက်ချက်ရာတွင် အမှားအယွင်း ဖြစ်ပေါ်နေပါသည်။",
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
      setCurrentQuestionIndex(prev => prev + 1);
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
          score_breakdown: { // Ensure all 8 scores are submitted
            E: scores.E || 0, I: scores.I || 0,
            S: scores.S || 0, N: scores.N || 0,
            T: scores.T || 0, F: scores.F || 0,
            J: scores.J || 0, P: scores.P || 0,
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

    