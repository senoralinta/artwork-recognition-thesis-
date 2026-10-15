import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { en } from "./en";
import { tr, Translations } from "./tr";

export type Language = "tr" | "en";

const LANGUAGE_KEY = "language";
const translations: Record<Language, Translations> = { tr, en };

type I18nContextValue = {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("tr");

  useEffect(() => {
    SecureStore.getItemAsync(LANGUAGE_KEY)
      .then((stored) => {
        if (stored === "tr" || stored === "en") {
          setLangState(stored);
        }
      })
      .catch(() => {});
  }, []);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    SecureStore.setItemAsync(LANGUAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(() => ({ lang, t: translations[lang], setLang }), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
