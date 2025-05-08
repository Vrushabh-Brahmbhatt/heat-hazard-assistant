// src/components/LanguageSelector.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = ({ className }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  
  // Update state when language changes
  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  // Handle language change
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
    
    // Store language preference
    localStorage.setItem('i18nextLng', newLanguage);
  };

  // Get language name display
  const getLanguageName = (code) => {
    switch (code) {
      case 'en':
        return 'English';
      case 'kn':
        return 'ಕನ್ನಡ';
      case 'hi':
        return 'हिंदी';
      default:
        return 'English';
    }
  };

  return (
    <div className={`flex items-center ${className || ''}`}>
      <select
        value={language}
        onChange={handleLanguageChange}
        className="bg-transparent border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Select Language"
      >
        <option value="en">English</option>
        <option value="kn">ಕನ್ನಡ</option>
        <option value="hi">हिंदी</option>
      </select>
    </div>
  );
};

export default LanguageSelector;