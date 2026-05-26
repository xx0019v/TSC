import { createContext, useContext, useState, useCallback, useEffect } from "react";

const LangCtx = createContext({ lang: "ja", setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("ja");

  useEffect(() => {
    let initial = "ja";
    try {
      const saved = localStorage.getItem("tsc-lang");
      if (saved === "ja" || saved === "en") initial = saved;
      else if ((navigator.language || "ja").toLowerCase().startsWith("en")) initial = "en";
    } catch {
      /* ignore */
    }
    setLangState(initial);
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
