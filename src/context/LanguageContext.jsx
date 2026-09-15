import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const LanguageContext = createContext(null)

const translations = {
  appName: { en: 'Shri Shahu Prabodhini', mr: 'श्री शाहू प्रबोधनिनी' },
  adminPanel: { en: 'Admin Panel', mr: 'प्रशासन पटल' },
  signIn: { en: 'Sign in to the admin panel', mr: 'प्रशासन पटलमध्ये साइन इन करा' },
  adminEmail: { en: 'Admin Email', mr: 'प्रशासन ईमेल' },
  password: { en: 'Password', mr: 'पासवर्ड' },
  login: { en: 'Login', mr: 'लॉगिन' },
  english: { en: 'English', mr: 'इंग्रजी' },
  marathi: { en: 'मराठी', mr: 'मराठी' },
  language: { en: 'Language', mr: 'भाषा' }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem('ssp-language')
    return stored === 'mr' ? 'mr' : 'en'
  })

  useEffect(() => {
    localStorage.setItem('ssp-language', language)
    document.documentElement.lang = language === 'mr' ? 'mr' : 'en'
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key) => translations[key]?.[language] || translations[key]?.en || key
  }), [language])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
