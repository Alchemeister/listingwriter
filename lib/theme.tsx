import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Color palettes
export const themes = {
  dark: {
    name: "dark" as const,
    background: "#0a0a0f",
    surface: "#18181b",
    surfaceHover: "#27272a",
    border: "rgba(255,255,255,0.1)",
    borderHover: "rgba(139, 92, 246, 0.3)",
    text: "#ffffff",
    textSecondary: "rgba(255,255,255,0.6)",
    textMuted: "rgba(255,255,255,0.4)",
    primary: "#8b5cf6",
    primaryGradient: ["#8b5cf6", "#6366f1"] as const,
    success: "#22c55e",
    successBg: "rgba(34, 197, 94, 0.1)",
    error: "#ef4444",
    errorBg: "rgba(239, 68, 68, 0.1)",
  },
  light: {
    name: "light" as const,
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceHover: "#f1f5f9",
    border: "rgba(0,0,0,0.1)",
    borderHover: "rgba(139, 92, 246, 0.4)",
    text: "#0f172a",
    textSecondary: "rgba(15, 23, 42, 0.7)",
    textMuted: "rgba(15, 23, 42, 0.5)",
    primary: "#7c3aed",
    primaryGradient: ["#7c3aed", "#4f46e5"] as const,
    success: "#16a34a",
    successBg: "rgba(22, 163, 74, 0.1)",
    error: "#dc2626",
    errorBg: "rgba(220, 38, 38, 0.1)",
  },
};

export type ThemeName = keyof typeof themes;
export type Theme = typeof themes.dark | typeof themes.light;

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  toggleTheme: () => void;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = "listingwriter_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>("dark");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark") {
        setThemeName(saved);
      }
      setIsLoaded(true);
    });
  }, []);

  // Save theme when it changes
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);
    }
  }, [themeName, isLoaded]);

  const toggleTheme = () => {
    setThemeName((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: themes[themeName],
        themeName,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
