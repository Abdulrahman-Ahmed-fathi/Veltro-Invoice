import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { translations } from '../i18n/translations'
import type { Language } from '../types/models'

type Translation = (typeof translations)[Language]

interface LanguageContextValue {
  language: Language
  t: Translation
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const persisted = localStorage.getItem('veltro-language')
    return persisted === 'ar' ? 'ar' : 'en'
  })

  useEffect(() => {
    localStorage.setItem('veltro-language', language)
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
    document.body.classList.toggle('rtl', language === 'ar')
  }, [language])

  const value = useMemo(
    () => ({
      language,
      t: translations[language],
      setLanguage: setLanguageState,
      toggleLanguage: () => setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en')),
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
