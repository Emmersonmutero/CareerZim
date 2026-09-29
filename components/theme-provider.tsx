"use client";
import * as React from "react";
type Theme = "light" | "dark" | "system";
const KEY = "cz_theme";
function apply(t: Theme) {
  const root = document.documentElement;
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = t === "dark" || (t === "system" && sysDark);
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("system");
  React.useEffect(() => {
    try {
      const s = (localStorage.getItem(KEY) as Theme) || "system";
      setThemeState(s); apply(s);
    } catch { apply("system"); }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = () => { try { apply((localStorage.getItem(KEY) as Theme) || "system"); } catch {} };
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  const setTheme = (t: string) => {
    const v = (t === "dark" || t === "light" ? t : "system") as Theme;
    try { localStorage.setItem(KEY, v); } catch {}
    setThemeState(v); apply(v);
  };
  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}
const ThemeCtx = React.createContext<{ theme: string; setTheme: (t: string) => void }>({ theme: "system", setTheme: () => {} });
export function useTheme() { return React.useContext(ThemeCtx); }

