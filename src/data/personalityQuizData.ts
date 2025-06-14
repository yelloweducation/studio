
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// --- MBTI Specific Types ---
export type DichotomyLetter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type DichotomyPair = 'EI' | 'SN' | 'TF' | 'JP';

export interface TranslatedText {
  en: string;
  my: string;
}

export interface MbtiChoice {
  labelKey: keyof PersonalityTestsTranslations['en']; // Key for translation
  value: -2 | -1 | 0 | 1 | 2;
}

export interface MbtiQuestionLikert {
  id: number; // Unique integer
  textKey: keyof PersonalityTestsTranslations['en']; // Key for translation
  dimension: DichotomyPair; // Which pair this question addresses
  trait: DichotomyLetter; // The trait this question scores towards if positive (e.g., 'E' for EI dimension)
  reverse_scored: boolean; // If true, Likert score is multiplied by -1 for this trait
}

export interface MbtiTypeInfo {
  type: string; // e.g., "INFP"
  titleKey: keyof PersonalityTestsTranslations['en'];
  descriptionKey: keyof PersonalityTestsTranslations['en'];
  groupKey: keyof PersonalityTestsTranslations['en'];
  careerSuggestionsKey: keyof PersonalityTestsTranslations['en']; // Key for an array of career suggestion keys
  characteristicsKey: keyof PersonalityTestsTranslations['en']; // Key for an array of characteristic keys
  iconName: keyof typeof LucideIcons;
}

export const mbtiLikertChoices: MbtiChoice[] = [
  { labelKey: "likertStronglyDisagree", value: -2 },
  { labelKey: "likertDisagree", value: -1 },
  { labelKey: "likertNeutral", value: 0 },
  { labelKey: "likertAgree", value: 1 },
  { labelKey: "likertStronglyAgree", value: 2 }
];

export const mbtiQuizQuestionsLikert: MbtiQuestionLikert[] = [
  // EI Dimension (15 questions)
  { id: 1, textKey: "q_ei1_text", dimension: "EI", trait: "E", reverse_scored: false }, // Prefer large group activities
  { id: 2, textKey: "q_ei2_text", dimension: "EI", trait: "I", reverse_scored: false }, // Solitude recharges
  { id: 3, textKey: "q_ei3_text", dimension: "EI", trait: "E", reverse_scored: false }, // Enjoy being the center of attention
  { id: 4, textKey: "q_ei4_text", dimension: "EI", trait: "I", reverse_scored: false }, // Prefer one-on-one conversations
  { id: 5, textKey: "q_ei5_text", dimension: "EI", trait: "E", reverse_scored: false }, // Often initiate conversations with new people
  { id: 6, textKey: "q_ei6_text", dimension: "EI", trait: "I", reverse_scored: false }, // Feel drained after a lot of social interaction
  { id: 7, textKey: "q_ei7_text", dimension: "EI", trait: "E", reverse_scored: false }, // Like to talk things through to understand them
  { id: 8, textKey: "q_ei8_text", dimension: "EI", trait: "I", reverse_scored: false }, // Prefer to reflect internally to understand things
  { id: 9, textKey: "q_ei9_text", dimension: "EI", trait: "E", reverse_scored: false }, // Generally outgoing and expressive
  { id: 10, textKey: "q_ei10_text", dimension: "EI", trait: "I", reverse_scored: false }, // More reserved and quiet in new situations
  { id: 11, textKey: "q_ei11_text", dimension: "EI", trait: "E", reverse_scored: false }, // Find it easy to make new friends
  { id: 12, textKey: "q_ei12_text", dimension: "EI", trait: "I", reverse_scored: false }, // Tend to listen more than I talk
  { id: 13, textKey: "q_ei13_text", dimension: "EI", trait: "E", reverse_scored: false }, // Feel energized by brainstorming with a group
  { id: 14, textKey: "q_ei14_text", dimension: "EI", trait: "I", reverse_scored: false }, // Prefer to work on projects alone or in a small, quiet group
  { id: 15, textKey: "q_ei15_text", dimension: "EI", trait: "E", reverse_scored: true }, // (Reversed E) I am often uncomfortable in large social gatherings.

  // SN Dimension (15 questions)
  { id: 16, textKey: "q_sn1_text", dimension: "SN", trait: "S", reverse_scored: false }, // Rely on facts and past experiences
  { id: 17, textKey: "q_sn2_text", dimension: "SN", trait: "N", reverse_scored: false }, // Trust intuition and future possibilities
  { id: 18, textKey: "q_sn3_text", dimension: "SN", trait: "S", reverse_scored: false }, // Prefer practical, hands-on learning
  { id: 19, textKey: "q_sn4_text", dimension: "SN", trait: "N", reverse_scored: false }, // Enjoy exploring abstract theories and concepts
  { id: 20, textKey: "q_sn5_text", dimension: "SN", trait: "S", reverse_scored: false }, // Focus on what is real and actual
  { id: 21, textKey: "q_sn6_text", dimension: "SN", trait: "N", reverse_scored: false }, // Often think about the meaning behind things
  { id: 22, textKey: "q_sn7_text", dimension: "SN", trait: "S", reverse_scored: false }, // Value clear instructions and established methods
  { id: 23, textKey: "q_sn8_text", dimension: "SN", trait: "N", reverse_scored: false }, // Like to come up with new ways of doing things
  { id: 24, textKey: "q_sn9_text", dimension: "SN", trait: "S", reverse_scored: false }, // More interested in the details than the overall picture
  { id: 25, textKey: "q_sn10_text", dimension: "SN", trait: "N", reverse_scored: false }, // See the big picture and connections easily
  { id: 26, textKey: "q_sn11_text", dimension: "SN", trait: "S", reverse_scored: false }, // Trust what is certain and concrete
  { id: 27, textKey: "q_sn12_text", dimension: "SN", trait: "N", reverse_scored: false }, // Often inspired by new ideas and possibilities
  { id: 28, textKey: "q_sn13_text", dimension: "SN", trait: "S", reverse_scored: false }, // Prefer to live in the present moment
  { id: 29, textKey: "q_sn14_text", dimension: "SN", trait: "N", reverse_scored: false }, // Tend to focus on future outcomes
  { id: 30, textKey: "q_sn15_text", dimension: "SN", trait: "S", reverse_scored: true }, // (Reversed S) I often daydream and get lost in my thoughts.

  // TF Dimension (15 questions)
  { id: 31, textKey: "q_tf1_text", dimension: "TF", trait: "T", reverse_scored: false }, // Value fairness and logic over harmony
  { id: 32, textKey: "q_tf2_text", dimension: "TF", trait: "F", reverse_scored: false }, // Prioritize empathy and feelings
  { id: 33, textKey: "q_tf3_text", dimension: "TF", trait: "T", reverse_scored: false }, // Make decisions based on objective analysis
  { id: 34, textKey: "q_tf4_text", dimension: "TF", trait: "F", reverse_scored: false }, // Consider how decisions will affect others' emotions
  { id: 35, textKey: "q_tf5_text", dimension: "TF", trait: "T", reverse_scored: false }, // Can be seen as direct or critical
  { id: 36, textKey: "q_tf6_text", dimension: "TF", trait: "F", reverse_scored: false }, // Strive to create a supportive environment
  { id: 37, textKey: "q_tf7_text", dimension: "TF", trait: "T", reverse_scored: false }, // Value truth and principles, even if unpopular
  { id: 38, textKey: "q_tf8_text", dimension: "TF", trait: "F", reverse_scored: false }, // Seek harmony and avoid conflict when possible
  { id: 39, textKey: "q_tf9_text", dimension: "TF", trait: "T", reverse_scored: false }, // Believe it's important to be rational and impartial
  { id: 40, textKey: "q_tf10_text", dimension: "TF", trait: "F", reverse_scored: false }, // Easily sense how others are feeling
  { id: 41, textKey: "q_tf11_text", dimension: "TF", trait: "T", reverse_scored: false }, // Prefer to critique ideas to find flaws
  { id: 42, textKey: "q_tf12_text", dimension: "TF", trait: "F", reverse_scored: false }, // Value cooperation and consensus
  { id: 43, textKey: "q_tf13_text", dimension: "TF", trait: "T", reverse_scored: false }, // Find it easy to set aside emotions for decision-making
  { id: 44, textKey: "q_tf14_text", dimension: "TF", trait: "F", reverse_scored: false }, // Driven by a desire to help and support others
  { id: 45, textKey: "q_tf15_text", dimension: "TF", trait: "T", reverse_scored: true }, // (Reversed T) I often let my heart rule my head.

  // JP Dimension (15 questions)
  { id: 46, textKey: "q_jp1_text", dimension: "JP", trait: "J", reverse_scored: false }, // Like plans and structure
  { id: 47, textKey: "q_jp2_text", dimension: "JP", trait: "P", reverse_scored: false }, // Enjoy spontaneity and flexibility
  { id: 48, textKey: "q_jp3_text", dimension: "JP", trait: "J", reverse_scored: false }, // Prefer to make decisions quickly
  { id: 49, textKey: "q_jp4_text", dimension: "JP", trait: "P", reverse_scored: false }, // Like to keep options open
  { id: 50, textKey: "q_jp5_text", dimension: "JP", trait: "J", reverse_scored: false }, // Feel more comfortable when things are settled and organized
  { id: 51, textKey: "q_jp6_text", dimension: "JP", trait: "P", reverse_scored: false }, // Enjoy adapting to new situations as they come
  { id: 52, textKey: "q_jp7_text", dimension: "JP", trait: "J", reverse_scored: false }, // Work best with deadlines and clear schedules
  { id: 53, textKey: "q_jp8_text", dimension: "JP", trait: "P", reverse_scored: false }, // Often work in bursts of energy, close to deadlines
  { id: 54, textKey: "q_jp9_text", dimension: "JP", trait: "J", reverse_scored: false }, // Like to complete tasks before relaxing
  { id: 55, textKey: "q_jp10_text", dimension: "JP", trait: "P", reverse_scored: false }, // See rules and procedures as flexible guidelines
  { id: 56, textKey: "q_jp11_text", dimension: "JP", trait: "J", reverse_scored: false }, // Value order and predictability
  { id: 57, textKey: "q_jp12_text", dimension: "JP", trait: "P", reverse_scored: false }, // Enjoy starting new projects more than finishing them
  { id: 58, textKey: "q_jp13_text", dimension: "JP", trait: "J", reverse_scored: false }, // Dislike surprises and last-minute changes
  { id: 59, textKey: "q_jp14_text", dimension: "JP", trait: "P", reverse_scored: false }, // Find routine and structure confining
  { id: 60, textKey: "q_jp15_text", dimension: "JP", trait: "J", reverse_scored: true }  // (Reversed J) I often procrastinate and do things at the last minute.
];


export const mbtiTypesInfo: MbtiTypeInfo[] = [
  // Analysts
  { type: "INTJ", titleKey: "intjTitle", groupKey: "analystsGroup", descriptionKey: "intjDescription", characteristicsKey: "intjCharacteristics", careerSuggestionsKey: "intjCareers", iconName: "SquareTerminal" },
  { type: "INTP", titleKey: "intpTitle", groupKey: "analystsGroup", descriptionKey: "intpDescription", characteristicsKey: "intpCharacteristics", careerSuggestionsKey: "intpCareers", iconName: "FlaskConical" },
  { type: "ENTJ", titleKey: "entjTitle", groupKey: "analystsGroup", descriptionKey: "entjDescription", characteristicsKey: "entjCharacteristics", careerSuggestionsKey: "entjCareers", iconName: "Target" },
  { type: "ENTP", titleKey: "entpTitle", groupKey: "analystsGroup", descriptionKey: "entpDescription", characteristicsKey: "entpCharacteristics", careerSuggestionsKey: "entpCareers", iconName: "Lightbulb" },
  // Diplomats
  { type: "INFJ", titleKey: "infjTitle", groupKey: "diplomatsGroup", descriptionKey: "infjDescription", characteristicsKey: "infjCharacteristics", careerSuggestionsKey: "infjCareers", iconName: "Sparkles" },
  { type: "INFP", titleKey: "infpTitle", groupKey: "diplomatsGroup", descriptionKey: "infpDescription", characteristicsKey: "infpCharacteristics", careerSuggestionsKey: "infpCareers", iconName: "Feather" },
  { type: "ENFJ", titleKey: "enfjTitle", groupKey: "diplomatsGroup", descriptionKey: "enfjDescription", characteristicsKey: "enfjCharacteristics", careerSuggestionsKey: "enfjCareers", iconName: "Users" },
  { type: "ENFP", titleKey: "enfpTitle", groupKey: "diplomatsGroup", descriptionKey: "enfpDescription", characteristicsKey: "enfpCharacteristics", careerSuggestionsKey: "enfpCareers", iconName: "Sun" },
  // Sentinels
  { type: "ISTJ", titleKey: "istjTitle", groupKey: "sentinelsGroup", descriptionKey: "istjDescription", characteristicsKey: "istjCharacteristics", careerSuggestionsKey: "istjCareers", iconName: "ClipboardCheck" },
  { type: "ISFJ", titleKey: "isfjTitle", groupKey: "sentinelsGroup", descriptionKey: "isfjDescription", characteristicsKey: "isfjCharacteristics", careerSuggestionsKey: "isfjCareers", iconName: "ShieldCheck" },
  { type: "ESTJ", titleKey: "estjTitle", groupKey: "sentinelsGroup", descriptionKey: "estjDescription", characteristicsKey: "estjCharacteristics", careerSuggestionsKey: "estjCareers", iconName: "Building" },
  { type: "ESFJ", titleKey: "esfjTitle", groupKey: "sentinelsGroup", descriptionKey: "esfjDescription", characteristicsKey: "esfjCharacteristics", careerSuggestionsKey: "esfjCareers", iconName: "HeartHandshake" },
  // Explorers
  { type: "ISTP", titleKey: "istpTitle", groupKey: "explorersGroup", descriptionKey: "istpDescription", characteristicsKey: "istpCharacteristics", careerSuggestionsKey: "istpCareers", iconName: "Wrench" },
  { type: "ISFP", titleKey: "isfpTitle", groupKey: "explorersGroup", descriptionKey: "isfpDescription", characteristicsKey: "isfpCharacteristics", careerSuggestionsKey: "isfpCareers", iconName: "Palette" },
  { type: "ESTP", titleKey: "estpTitle", groupKey: "explorersGroup", descriptionKey: "estpDescription", characteristicsKey: "estpCharacteristics", careerSuggestionsKey: "estpCareers", iconName: "Zap" },
  { type: "ESFP", titleKey: "esfpTitle", groupKey: "explorersGroup", descriptionKey: "esfpDescription", characteristicsKey: "esfpCharacteristics", careerSuggestionsKey: "esfpCareers", iconName: "PartyPopper" },
];

export type MbtiQuizSubmission = {
  id: string; // cuid
  userId?: string;
  mbtiType: string;
  scoreBreakdown: {
    E: number; I: number;
    S: number; N: number;
    T: number; F: number;
    J: number; P: number;
  };
  submittedAt: string; // ISO date
};

// Translation object structure
export interface PersonalityTestsTranslations {
  en: {
    pageTitle: string;
    pageDescription: string;
    quizIntroTitle: string;
    quizIntroDescription: string;
    startQuizButton: string;
    nextButton: string;
    backButton: string;
    submitButton: string;
    seeResultsButton: string; // Kept for potential future use, submitButton used for final step
    retakeQuizButton: string;
    questionProgress: string; // e.g., "Question {current} of {total}"
    resultTitle: string; // e.g., "Your Personality Type:"
    shareResultButton: string; // Optional
    shareResultText: string; // e.g., "I discovered I'm an {type} - {title}! Find out your type: {url}"

    // Likert Scale Labels
    likertStronglyDisagree: string;
    likertDisagree: string;
    likertNeutral: string;
    likertAgree: string;
    likertStronglyAgree: string;

    // Group Titles
    analystsGroup: string;
    diplomatsGroup: string;
    sentinelsGroup: string;
    explorersGroup: string;

    // MBTI Type Titles (Keys for mbtiTypesInfo.titleKey)
    intjTitle: string; intpTitle: string; entjTitle: string; entpTitle: string;
    infjTitle: string; infpTitle: string; enfjTitle: string; enfpTitle: string;
    istjTitle: string; isfjTitle: string; estjTitle: string; esfjTitle: string;
    istpTitle: string; isfpTitle: string; estpTitle: string; esfpTitle: string;

    // MBTI Type Descriptions (Keys for mbtiTypesInfo.descriptionKey)
    intjDescription: string; intpDescription: string; entjDescription: string; entpDescription: string;
    infjDescription: string; infpDescription: string; enfjDescription: string; enfpDescription: string;
    istjDescription: string; isfjDescription: string; estjDescription: string; esfjDescription: string;
    istpDescription: string; isfpDescription: string; estpDescription: string; esfpDescription: string;

    // MBTI Characteristics section title
    characteristicsSectionTitle: string;
    // MBTI Characteristics (Keys for mbtiTypesInfo.characteristicsKey, stores semi-colon separated string)
    intjCharacteristics: string; intpCharacteristics: string; entjCharacteristics: string; entpCharacteristics: string;
    infjCharacteristics: string; infpCharacteristics: string; enfjCharacteristics: string; enfpCharacteristics: string;
    istjCharacteristics: string; isfjCharacteristics: string; estjCharacteristics: string; esfjCharacteristics: string;
    istpCharacteristics: string; isfpCharacteristics: string; estpCharacteristics: string; esfpCharacteristics: string;
    
    // MBTI Career Suggestions section title
    careerPathSectionTitle: string;
    // MBTI Career Suggestions (Keys for mbtiTypesInfo.careerSuggestionsKey, stores semi-colon separated string)
    intjCareers: string; intpCareers: string; entjCareers: string; entpCareers: string;
    infjCareers: string; infpCareers: string; enfjCareers: string; enfpCareers: string;
    istjCareers: string; isfjCareers: string; estjCareers: string; esfjCareers: string;
    istpCareers: string; isfpCareers: string; estpCareers: string; esfpCareers: string;

    // Question Keys (for mbtiQuizQuestionsLikert.textKey)
    q_ei1_text: string; q_ei2_text: string; q_ei3_text: string; q_ei4_text: string; q_ei5_text: string; q_ei6_text: string; q_ei7_text: string; q_ei8_text: string; q_ei9_text: string; q_ei10_text: string; q_ei11_text: string; q_ei12_text: string; q_ei13_text: string; q_ei14_text: string; q_ei15_text: string;
    q_sn1_text: string; q_sn2_text: string; q_sn3_text: string; q_sn4_text: string; q_sn5_text: string; q_sn6_text: string; q_sn7_text: string; q_sn8_text: string; q_sn9_text: string; q_sn10_text: string; q_sn11_text: string; q_sn12_text: string; q_sn13_text: string; q_sn14_text: string; q_sn15_text: string;
    q_tf1_text: string; q_tf2_text: string; q_tf3_text: string; q_tf4_text: string; q_tf5_text: string; q_tf6_text: string; q_tf7_text: string; q_tf8_text: string; q_tf9_text: string; q_tf10_text: string; q_tf11_text: string; q_tf12_text: string; q_tf13_text: string; q_tf14_text: string; q_tf15_text: string;
    q_jp1_text: string; q_jp2_text: string; q_jp3_text: string; q_jp4_text: string; q_jp5_text: string; q_jp6_text: string; q_jp7_text: string; q_jp8_text: string; q_jp9_text: string; q_jp10_text: string; q_jp11_text: string; q_jp12_text: string; q_jp13_text: string; q_jp14_text: string; q_jp15_text: string;

    // Submission messages
    submittingResults: string;
    submissionSuccess: string;
    submissionError: string;
    errorCalculatingType: string;

    // History (no history board in this iteration, but keys kept for consistency)
    recentCompletionsTitle: string;
    historyUser: string;
    historyStyle: string;
    historyDate: string;
    noHistory: string;
    possibleTypesTitle: string;
  };
  my: { // Myanmar translations - (Provide a few examples, user to complete)
    pageTitle: string;
    pageDescription: string;
    quizIntroTitle: string;
    quizIntroDescription: string;
    startQuizButton: string;
    nextButton: string;
    backButton: string;
    submitButton: string;
    seeResultsButton: string;
    retakeQuizButton: string;
    questionProgress: string;
    resultTitle: string;
    shareResultButton: string;
    shareResultText: string;

    likertStronglyDisagree: string;
    likertDisagree: string;
    likertNeutral: string;
    likertAgree: string;
    likertStronglyAgree: string;

    analystsGroup: string; diplomatsGroup: string; sentinelsGroup: string; explorersGroup: string;
    intjTitle: string; intpTitle: string; entjTitle: string; entpTitle: string;
    infjTitle: string; infpTitle: string; enfjTitle: string; enfpTitle: string;
    istjTitle: string; isfjTitle: string; estjTitle: string; esfjTitle: string;
    istpTitle: string; isfpTitle: string; estpTitle: string; esfpTitle: string;

    intjDescription: string; intpDescription: string; entjDescription: string; entpDescription: string;
    infjDescription: string; infpDescription: string; enfjDescription: string; enfpDescription: string;
    istjDescription: string; isfjDescription: string; estjDescription: string; esfjDescription: string;
    istpDescription: string; isfpDescription: string; estpDescription: string; esfpDescription: string;

    characteristicsSectionTitle: string;
    intjCharacteristics: string; intpCharacteristics: string; entjCharacteristics: string; entpCharacteristics: string;
    infjCharacteristics: string; infpCharacteristics: string; enfjCharacteristics: string; enfpCharacteristics: string;
    istjCharacteristics: string; isfjCharacteristics: string; estjCharacteristics: string; esfjCharacteristics: string;
    istpCharacteristics: string; isfpCharacteristics: string; estpCharacteristics: string; esfpCharacteristics: string;
    
    careerPathSectionTitle: string;
    intjCareers: string; intpCareers: string; entjCareers: string; entpCareers: string;
    infjCareers: string; infpCareers: string; enfjCareers: string; enfpCareers: string;
    istjCareers: string; isfjCareers: string; estjCareers: string; esfjCareers: string;
    istpCareers: string; isfpCareers: string; estpCareers: string; esfpCareers: string;

    q_ei1_text: string; q_ei2_text: string; q_ei3_text: string; q_ei4_text: string; q_ei5_text: string; q_ei6_text: string; q_ei7_text: string; q_ei8_text: string; q_ei9_text: string; q_ei10_text: string; q_ei11_text: string; q_ei12_text: string; q_ei13_text: string; q_ei14_text: string; q_ei15_text: string;
    q_sn1_text: string; q_sn2_text: string; q_sn3_text: string; q_sn4_text: string; q_sn5_text: string; q_sn6_text: string; q_sn7_text: string; q_sn8_text: string; q_sn9_text: string; q_sn10_text: string; q_sn11_text: string; q_sn12_text: string; q_sn13_text: string; q_sn14_text: string; q_sn15_text: string;
    q_tf1_text: string; q_tf2_text: string; q_tf3_text: string; q_tf4_text: string; q_tf5_text: string; q_tf6_text: string; q_tf7_text: string; q_tf8_text: string; q_tf9_text: string; q_tf10_text: string; q_tf11_text: string; q_tf12_text: string; q_tf13_text: string; q_tf14_text: string; q_tf15_text: string;
    q_jp1_text: string; q_jp2_text: string; q_jp3_text: string; q_jp4_text: string; q_jp5_text: string; q_jp6_text: string; q_jp7_text: string; q_jp8_text: string; q_jp9_text: string; q_jp10_text: string; q_jp11_text: string; q_jp12_text: string; q_jp13_text: string; q_jp14_text: string; q_jp15_text: string;

    submittingResults: string;
    submissionSuccess: string;
    submissionError: string;
    errorCalculatingType: string;

    recentCompletionsTitle: string;
    historyUser: string;
    historyStyle: string;
    historyDate: string;
    noHistory: string;
    possibleTypesTitle: string;
  };
}
