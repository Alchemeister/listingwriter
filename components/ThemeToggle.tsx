import React from "react";
import { View, Pressable, Text } from "react-native";
import { useTheme } from "../lib/theme";

export function ThemeToggle() {
  const { theme, themeName, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 18 }}>{themeName === "dark" ? "☀️" : "🌙"}</Text>
    </Pressable>
  );
}
