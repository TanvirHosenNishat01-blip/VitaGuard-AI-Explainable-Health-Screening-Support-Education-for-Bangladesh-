import React, { createContext, useContext, useState } from 'react';
import STRINGS from '../i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('vitaguard_lang') || 'en');

  const setLang = (value) => {
    const next = value === 'bn' ? 'bn' : 'en';
    setLangState(next);
    localStorage.setItem('vitaguard_lang', next);
  };

  const t = (key) => STRINGS[lang]?.[key] || STRINGS.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
