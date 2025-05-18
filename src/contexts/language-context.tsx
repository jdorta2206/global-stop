
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (textObject: Record<Language, string> | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const defaultLanguage: Language = 'es'; // Default to Spanish

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    // Get language from localStorage on initial client-side load
    const storedLang = localStorage.getItem('globalStopLanguage') as Language | null;
    if (storedLang) {
      setLanguageState(storedLang);
      document.documentElement.lang = storedLang;
    } else {
      document.documentElement.lang = defaultLanguage;
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('globalStopLanguage', lang);
    document.documentElement.lang = lang; // Also update the html lang attribute
  }, []);

  const translate = useCallback(
    (textObject: Record<Language, string> | undefined): string => {
      if (!textObject) return '';
      return textObject[language] || textObject[defaultLanguage] || Object.values(textObject)[0] || '';
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
