import { createContext, useContext, useState, useCallback, useEffect } from "react";

const LangCtx = createContext({ lang: "en", setLang: () => {} });

export function LangProvider({ children }) {
  // Default to English on first visit; remember the user's choice afterward.
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    let initial = "en";
    try {
      const saved = localStorage.getItem("tsc-lang");
      if (saved === "ja" || saved === "en") initial = saved;
    } catch {
      /* ignore */
    }
    setLangState(initial);
    document.documentElement.setAttribute("lang", initial);
  }, []);

  const setLang = useCallback((l) => {
    setLangState(l);
    try {
      localStorage.setItem("tsc-lang", l);
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute("lang", l);
  }, []);

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);
