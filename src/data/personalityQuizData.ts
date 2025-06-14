
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

// SAMPLE LIKERT QUESTIONS (User should expand to 60)
// For simplicity, providing 2 questions per dichotomy (8 total for sample)
export const mbtiQuizQuestionsLikert: MbtiQuestionLikert[] = [
  // EI Dimension
  { id: 1, textKey: "q_ei1_text", dimension: "EI", trait: "E", reverse_scored: false },
  { id: 2, textKey: "q_ei2_text", dimension: "EI", trait: "I", reverse_scored: false }, // This scores towards 'I' if positive
  // SN Dimension
  { id: 3, textKey: "q_sn1_text", dimension: "SN", trait: "S", reverse_scored: false },
  { id: 4, textKey: "q_sn2_text", dimension: "SN", trait: "N", reverse_scored: false },
  // TF Dimension
  { id: 5, textKey: "q_tf1_text", dimension: "TF", trait: "T", reverse_scored: false },
  { id: 6, textKey: "q_tf2_text", dimension: "TF", trait: "F", reverse_scored: false },
  // JP Dimension
  { id: 7, textKey: "q_jp1_text", dimension: "JP", trait: "J", reverse_scored: false },
  { id: 8, textKey: "q_jp2_text", dimension: "JP", trait: "P", reverse_scored: false },
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

    // Sample Question Keys (for mbtiQuizQuestionsLikert.textKey)
    q_ei1_text: string; q_ei2_text: string;
    q_sn1_text: string; q_sn2_text: string;
    q_tf1_text: string; q_tf2_text: string;
    q_jp1_text: string; q_jp2_text: string;

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

    q_ei1_text: string; q_ei2_text: string;
    q_sn1_text: string; q_sn2_text: string;
    q_tf1_text: string; q_tf2_text: string;
    q_jp1_text: string; q_jp2_text: string;

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

    