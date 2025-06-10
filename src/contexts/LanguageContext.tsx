
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

export type Language = 'en' | 'my'; // English, Myanmar

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage?: () => void; // Optional: if you want a simple toggle
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'yellowInstituteLanguage';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en'); // Default to English

  useEffect(() => {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'my')) {
      setLanguageState(storedLanguage);
    }
    // No explicit else, defaults to 'en' which is fine.
    // Could add system preference detection here if desired for initial load without stored pref.
  }, []);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prevLang) => {
      const newLang = prevLang === 'en' ? 'my' : 'en';
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      return newLang;
    });
  }, []);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
