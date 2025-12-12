import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { availableLocales, defaultLocale } from '@Admin/config/language';

i18n
    // i18next-http-backend
    // loads translations from your server
    // https://github.com/i18next/i18next-http-backend
    .use(Backend)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next<
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        detection: {
            convertDetectedLanguage: (lng) => {
                return lng.slice(0, 2);
            },
        },
        // See the public folder locales to find tranlatioon files
        load: 'languageOnly',
        debug: false,
        // lng: defaultLocale, Should be disable when use LanguageDetector
        fallbackLng: defaultLocale,
        supportedLngs: availableLocales,
        // allow keys to be phrases having `:`, `.`
        nsSeparator: false,
        keySeparator: false,
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    });

export default i18n;
