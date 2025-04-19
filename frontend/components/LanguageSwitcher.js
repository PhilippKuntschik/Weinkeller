import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentLanguage = i18n.language;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Language options with flags
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' }
  ];

  // Get current language display name
  const getCurrentLanguageName = () => {
    const lang = languages.find(lang => lang.code === currentLanguage);
    return lang ? lang.name : 'Language';
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="dropdown-button"
      >
        <span className={`language-flag ${currentLanguage}`}></span>
        {getCurrentLanguageName()}
      </button>
      <ul className={`dropdown-menu ${isOpen ? 'visible' : ''}`}>
        {languages.map(lang => (
          <li 
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={currentLanguage === lang.code ? 'active' : ''}
          >
            <span className={`language-flag ${lang.code}`}></span>
            {lang.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LanguageSwitcher;
