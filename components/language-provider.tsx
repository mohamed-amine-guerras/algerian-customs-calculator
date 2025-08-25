"use client"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { DEFAULT_LANGUAGE, dictionaries, isRightToLeft, type SupportedLanguage } from "@/lib/i18n"

type LanguageContextValue = {
  language: SupportedLanguage
  t: typeof dictionaries["en"]
  tr: (key: string, fallback?: string) => string
  setLanguage: (lang: SupportedLanguage) => void
  locale: string
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (value: number, currency: string, options?: Intl.NumberFormatOptions) => string
  formatDate: (value: Date, options?: Intl.DateTimeFormatOptions) => string
  formatTime: (value: Date, options?: Intl.DateTimeFormatOptions) => string
  isRtl?: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)

  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("lang") as SupportedLanguage | null) : null
    if (stored && ["en", "fr", "ar"].includes(stored)) {
      setLanguageState(stored)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", language)
      const html = document.documentElement
      html.lang = language
      html.dir = isRightToLeft(language) ? "rtl" : "ltr"
    }
  }, [language])

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang)
  }, [])

  const locale = useMemo(() => {
    switch (language) {
      case "fr":
        return "fr-FR"
      case "ar":
        return "ar-DZ"
      default:
        return "en-US"
    }
  }, [language])

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options).format(value),
    [locale]
  )

  const formatCurrency = useCallback(
    (value: number, currency: string, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0, ...options }).format(value),
    [locale]
  )

  const formatDate = useCallback(
    (value: Date, options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, { dateStyle: "medium", ...options }).format(value),
    [locale]
  )

  const formatTime = useCallback(
    (value: Date, options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, { timeStyle: "short", ...options }).format(value),
    [locale]
  )

  const tr = useCallback(
    (key: string, fallback?: string) => {
      const parts = key.split(".")
      let current: any = dictionaries[language]
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = current[part]
        } else {
          return fallback ?? key
        }
      }
      return typeof current === "string" ? current : fallback ?? key
    },
    [language]
  )

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      t: dictionaries[language],
      tr,
      locale,
      formatNumber,
      formatCurrency,
      formatDate,
      formatTime,
      isRtl: isRightToLeft(language),
      setLanguage,
    }
  }, [language, tr, locale, formatNumber, formatCurrency, formatDate, formatTime, setLanguage])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}


