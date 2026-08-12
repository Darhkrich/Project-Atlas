"use client";

import { createContext } from "react";
import { lightTheme } from "@/styles/themes";

export type ThemeMode = "light" | "dark";

export interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  mode: "light",
  toggleTheme: () => {},
});

export const defaultTheme = lightTheme;