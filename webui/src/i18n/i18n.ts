import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .use(HttpApi)
  .use(LanguageDetector)
  .init({
    fallbackLng: "en-US",
    debug: false,
    interpolation: { escapeValue: false },
    ns: ["common"],
    defaultNS: "common",
    backend: {
      loadPath: `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.json`,
    },
    react: {
      nsMode: "default",
      useSuspense: false,
    },
  })
  .then(() => {});

export default i18n;
