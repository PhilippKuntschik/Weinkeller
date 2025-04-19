# Internationalization (i18n)

This directory contains the translation files for the Weinkeller application. The application supports multiple languages through the i18next internationalization framework.

## Supported Languages

The application currently supports the following languages:

- English (en.json)
- German (de.json)

## Translation Files

Each language has its own JSON file containing translations for all text used in the application. The files follow a nested structure organized by feature or component.

### Structure

```
{
  "common": {
    "appName": "Weinkeller",
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "actions": "Actions"
  },
  "navigation": {
    "wines": "Wines",
    "producers": "Producers",
    "inventory": "Inventory",
    "assessments": "Assessments",
    "analytics": "Analytics",
    "importExport": "Import/Export"
  },
  "wines": {
    "title": "Wines",
    "addWine": "Add Wine",
    "wineDetails": "Wine Details",
    "name": "Name",
    "year": "Year",
    "producer": "Producer",
    "type": "Type",
    "country": "Country",
    "region": "Region",
    "grapes": "Grape Varieties",
    "notes": "Notes"
  },
  // Other sections...
}
```

## Implementation

The application uses i18next for internationalization. The setup is defined in `frontend/i18n.js`:

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import enTranslation from '../locales/en.json';
import deTranslation from '../locales/de.json';

const resources = {
  en: {
    translation: enTranslation
  },
  de: {
    translation: deTranslation
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: true
    }
  });

export default i18n;
```

## Usage in Components

Translations are used in components with the `useTranslation` hook:

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function WineList() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('wines.title')}</h1>
      <button>{t('wines.addWine')}</button>
      
      <table>
        <thead>
          <tr>
            <th>{t('wines.name')}</th>
            <th>{t('wines.year')}</th>
            <th>{t('wines.producer')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        {/* Table body */}
      </table>
    </div>
  );
}
```

## Language Switching

The application includes a language switcher component that allows users to change the language:

```jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <div className="language-switcher">
      <button 
        className={i18n.language === 'en' ? 'active' : ''} 
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button 
        className={i18n.language === 'de' ? 'active' : ''} 
        onClick={() => changeLanguage('de')}
      >
        DE
      </button>
    </div>
  );
}

export default LanguageSwitcher;
```

## Adding a New Language

To add a new language:

1. Create a new JSON file in the `locales` directory (e.g., `fr.json` for French)
2. Copy the structure from an existing language file
3. Translate all strings to the new language
4. Update the `i18n.js` file to include the new language:

```javascript
import frTranslation from '../locales/fr.json';

const resources = {
  en: {
    translation: enTranslation
  },
  de: {
    translation: deTranslation
  },
  fr: {
    translation: frTranslation
  }
};
```

5. Update the language switcher component to include the new language

## Translation Guidelines

1. **Consistency**: Use consistent terminology throughout the application
2. **Context**: Consider the context in which the text will be used
3. **Placeholders**: Use placeholders for dynamic content (e.g., `{{name}}`)
4. **Pluralization**: Use i18next's pluralization features for countable items
5. **Formatting**: Maintain the same formatting (capitalization, punctuation) across languages
6. **Length**: Be aware that text length can vary significantly between languages
7. **Cultural Considerations**: Be sensitive to cultural differences

## Best Practices

1. **Separation**: Keep translations separate from code
2. **Namespacing**: Use namespaces to organize translations
3. **Completeness**: Ensure all strings are translated in all supported languages
4. **Default Language**: Always provide a fallback language (English)
5. **Testing**: Test the application in all supported languages
6. **Maintenance**: Keep translations up to date as the application evolves
