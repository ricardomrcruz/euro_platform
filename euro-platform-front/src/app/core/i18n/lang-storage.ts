export type AppLang = 'fr' | 'en';

export const SUPPORTED_LANGS: AppLang[] = ['fr', 'en'];
export const DEFAULT_LANG: AppLang = 'fr';

const STORAGE_KEY = 'euro-cars-lang';

function isAppLang(value: string | null): value is AppLang {
  return SUPPORTED_LANGS.includes(value as AppLang);
}

export function getStoredLang(): AppLang {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isAppLang(stored) ? stored : DEFAULT_LANG;
}

export function setStoredLang(lang: AppLang): void {
  localStorage.setItem(STORAGE_KEY, lang);
}
