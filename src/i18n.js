// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Use backend to load translations from /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default language
    fallbackLng: 'en',
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',
    // Namespace to use
    defaultNS: 'translation',
    // Support Kannada, Hindi
    supportedLngs: ['en', 'kn', 'hi'],
    
    // Detection options
    detection: {
      // Order of language detection
      order: ['localStorage', 'cookie', 'navigator'],
      // Cache language on
      caches: ['localStorage', 'cookie'],
      // Cookie settings
      cookieExpirationDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
      // Check for HTML attribute
      htmlTag: document.documentElement
    },
    
    interpolation: {
      // Not needed for React as it escapes by default
      escapeValue: false,
    },
    
    // Special options for Bangalore
    // Detect location to default to Kannada for Bangalore area users
    // This is a simplistic approach - in a real app you'd use geolocation
    // to more accurately determine location
    initImmediate: false,
    returnEmptyString: false,
    nsSeparator: false
  });

export default i18n;