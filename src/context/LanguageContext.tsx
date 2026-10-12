import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/constants';

export type AppLanguage = 'hi' | 'en';

interface LanguageContextValue {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  toggleLang: () => void;
  t: <T = string>(hi: T, en: T) => T;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (saved === 'en' || saved === 'hi') return saved;
    } catch {}
    return 'hi';
  });

  const setLang = useCallback((next: AppLanguage) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, next);
    } catch {}
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'hi' ? 'en' : 'hi';
      try {
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, next);
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    <T = string,>(hi: T, en: T): T => {
      return lang === 'hi' ? hi : en;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
