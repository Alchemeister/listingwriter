import { useState, useEffect } from "react";
import { Dimensions, Platform } from "react-native";

interface ResponsiveValues {
  width: number;
  height: number;
  isWeb: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  containerWidth: "100%" | number;
}

export function useResponsive(): ResponsiveValues {
  const [dimensions, setDimensions] = useState(() => Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const isWeb = Platform.OS === "web";
  const width = dimensions.width;

  // Breakpoints: mobile < 640, tablet 640-1024, desktop > 1024
  const isMobile = width < 640;
  const isTablet = width >= 640 && width <= 1024;
  const isDesktop = width > 1024;

  // Container width based on screen size - fills more of the screen
  let containerWidth: "100%" | number = "100%";
  if (isDesktop) {
    containerWidth = Math.min(width - 64, 1200); // Max 1200px with 32px padding each side
  } else if (isTablet) {
    containerWidth = width - 40; // 20px padding each side
  }

  return {
    width,
    height: dimensions.height,
    isWeb,
    isMobile,
    isTablet,
    isDesktop,
    containerWidth,
  };
}
