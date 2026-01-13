import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsive } from "../lib/useResponsive";
import { useTheme } from "../lib/theme";
import { ThemeToggle } from "../components/ThemeToggle";

interface Listing {
  title: string;
  description: string;
}

const TONE_CONFIG = {
  casual: {
    label: "Casual",
    subtitle: "Friendly & approachable",
    icon: "💬",
    darkGradient: ["rgba(251, 191, 36, 0.15)", "rgba(245, 158, 11, 0.1)"] as const,
    darkAccent: "#fbbf24",
  },
  professional: {
    label: "Professional",
    subtitle: "Polished & detailed",
    icon: "💼",
    darkGradient: ["rgba(59, 130, 246, 0.15)", "rgba(37, 99, 235, 0.1)"] as const,
    darkAccent: "#60a5fa",
  },
  punchy: {
    label: "Punchy",
    subtitle: "Short & direct",
    icon: "⚡",
    darkGradient: ["rgba(16, 185, 129, 0.15)", "rgba(5, 150, 105, 0.1)"] as const,
    darkAccent: "#34d399",
  },
} as const;

function ListingCard({
  listing,
  tone,
  index,
  isDesktop,
}: {
  listing: Listing;
  tone: keyof typeof TONE_CONFIG;
  index: number;
  isDesktop: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const config = TONE_CONFIG[tone];
  const text = `${listing.title}\n\n${listing.description}`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: text });
    } catch {
      handleCopy();
    }
  };

  return (
    <View
      style={{
        flex: isDesktop ? 1 : undefined,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#18181b",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      <LinearGradient
        colors={config.darkGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.05)",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 22, marginRight: 10 }}>{config.icon}</Text>
          <View>
            <Text style={{ fontSize: 15, fontWeight: "700", color: config.darkAccent }}>
              {config.label}
            </Text>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
              {config.subtitle}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.6)" }}>
            Option {index + 1}
          </Text>
        </View>
      </LinearGradient>

      <View style={{ padding: 16, flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#fff",
            marginBottom: 10,
            lineHeight: 22,
          }}
        >
          {listing.title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 22,
            marginBottom: 16,
            flex: 1,
          }}
        >
          {listing.description}
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={handleCopy}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: "center",
              backgroundColor: copied ? config.darkAccent : "#27272a",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: copied ? "#0a0a0f" : "rgba(255,255,255,0.7)",
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.9 : 1 })}
          >
            <LinearGradient
              colors={["#8b5cf6", "#6366f1"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 12, borderRadius: 10, alignItems: "center" }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>Share</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function ResultsScreen() {
  const router = useRouter();
  const { results } = useLocalSearchParams<{ results: string }>();
  const { isWeb, isDesktop, isTablet, containerWidth } = useResponsive();
  const { theme } = useTheme();

  let data: { casual: Listing; professional: Listing; punchy: Listing } | null = null;
  try {
    if (results) data = JSON.parse(results);
  } catch {}

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: theme.errorBg,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 28, color: theme.error }}>!</Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text, marginBottom: 8 }}>
          Something went wrong
        </Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: "center", marginBottom: 20 }}>
          We couldn't load your listings.
        </Text>
        <Pressable onPress={() => router.replace("/create")} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
          <LinearGradient
            colors={theme.primaryGradient}
            style={{ paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Try Again</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, alignItems: isDesktop ? "center" : "stretch" }}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView style={{ flex: 1, width: containerWidth, alignSelf: "center" }} edges={["top"]}>
          {/* Header */}
          <View style={{ paddingHorizontal: isDesktop ? 32 : 20, paddingTop: isDesktop ? 32 : 16, paddingBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Pressable
                onPress={() => router.replace("/create")}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={{ color: theme.textSecondary, fontSize: 15, marginRight: 6 }}>←</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: "500" }}>Back</Text>
              </Pressable>

              <Pressable
                onPress={() => isWeb && router.push("/landing")}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: theme.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>L</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text }}>ListingWriter</Text>
              </Pressable>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <ThemeToggle />
                <Pressable
                  onPress={() => router.push("/history")}
                  style={({ pressed }) => ({
                    backgroundColor: theme.surface,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: theme.border,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: theme.text, fontSize: 13, fontWeight: "600" }}>History</Text>
                </Pressable>
              </View>
            </View>

            {/* Success Banner */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.successBg,
                borderWidth: 1,
                borderColor: "rgba(34, 197, 94, 0.2)",
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 14,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Text style={{ fontSize: 18, color: theme.success }}>✓</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: theme.success, marginBottom: 2 }}>
                  Listings Ready!
                </Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                  Pick a style, copy, and paste wherever you're selling
                </Text>
              </View>
            </View>
          </View>

          {/* Cards */}
          <View
            style={{
              flexDirection: isDesktop ? "row" : "column",
              paddingHorizontal: isDesktop ? 32 : 20,
              gap: 16,
            }}
          >
            <ListingCard listing={data.casual} tone="casual" index={0} isDesktop={isDesktop} />
            <ListingCard listing={data.professional} tone="professional" index={1} isDesktop={isDesktop} />
            <ListingCard listing={data.punchy} tone="punchy" index={2} isDesktop={isDesktop} />
          </View>

          {/* New Listing Button */}
          <View style={{ paddingHorizontal: isDesktop ? 32 : 20, marginTop: 20 }}>
            <Pressable
              onPress={() => router.replace("/create")}
              style={({ pressed }) => ({
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: "center",
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: theme.textSecondary }}>
                Create Another Listing
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}
