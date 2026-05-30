import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr/translation.json';

const savedLang = localStorage.getItem('eneni_lang') || 'fr';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
    },
    lng: savedLang,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem('eneni_lang', lng);
});

export default i18n;
