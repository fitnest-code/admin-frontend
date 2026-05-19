import { create } from "zustand";
import az, { type TranslationKeys } from "./locales/az";
import en from "./locales/en";
import ru from "./locales/ru";

export type Locale = "AZ" | "EN" | "RU";

const locales: Record<Locale, TranslationKeys> = { AZ: az, EN: en, RU: ru };

interface I18nState {
  locale: Locale;
  t: TranslationKeys;
  setLocale: (locale: Locale) => void;
}

function getInitialLocale(): Locale {
  return "AZ";
}

export const useI18nStore = create<I18nState>((set) => {
  const initial = getInitialLocale();
  return {
    locale: initial,
    t: locales[initial],
    setLocale: (locale) => {
      localStorage.setItem("fitnest-language", locale);
      set({ locale, t: locales[locale] });
    },
  };
});

/** Shorthand hook — returns the translation object directly */
export function useT(): TranslationKeys {
  return useI18nStore((s) => s.t);
}

/** Get translations outside React (e.g. in callbacks) */
export function getT(): TranslationKeys {
  return useI18nStore.getState().t;
}
