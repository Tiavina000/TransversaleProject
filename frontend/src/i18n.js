import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import fr from './locales/fr/translation.json';
import mg from './locales/mg/translation.json';

const savedLang = localStorage.getItem('eneni_lang') || 'fr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      mg: { translation: mg },
    },
    lng: savedLang,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  });

export default i18n;
