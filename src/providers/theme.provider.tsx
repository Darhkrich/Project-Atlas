"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeContext, type ThemeMode } from "./theme.context";
import { lightTheme, darkTheme } from "@/styles/themes";
import { themeToCSSVariables } from "@/styles/css-variables";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Atlas Theme Provider
 *
 * Handles theme state and keeps the current
 * theme stored in localStorage.
 */
export function ThemeProvider({
  children,
}: Readonly<ThemeProviderProps>) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = localStorage.getItem("atlas-theme");

    if (saved === "light" || saved === "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(saved);
    }
  }, []);

useEffect(() => {
  localStorage.setItem("atlas-theme", mode);

  document.documentElement.dataset.theme = mode;

  const theme =
    mode === "dark"
      ? darkTheme
      : lightTheme;

  const variables =
    themeToCSSVariables(theme);

  Object.entries(variables).forEach(
    ([name, value]) => {
      document.documentElement.style.setProperty(
        name,
        value,
      );
    },
  );
}, [mode]);

  const toggleTheme = useCallback(() => {
    setMode((previous) =>
      previous === "light" ? "dark" : "light",
    );
  }, []);

  const value = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}