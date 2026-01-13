import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { getHistory, deleteFromHistory, SavedListing } from "../lib/storage";
import { useResponsive } from "../lib/useResponsive";
import { useTheme } from "../lib/theme";
import { ThemeToggle } from "../components/ThemeToggle";

function HistoryCard({
  listing,
  onDelete,
  onView,
}: {
  listing: SavedListing;
  onDelete: () => void;
  onView: () => void;
}) {
  const date = new Date(listing.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Pressable
      onPress={onView}
      style={({ pressed }) => ({
        backgroundColor: "#18181b",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: pressed ? "rgba(139, 92, 246, 0.3)" : "rgba(255,255,255,0.1)",
        opacity: pressed ? 0.95 : 1,
      })}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: "500" }}>{formattedDate}</Text>
        <View
          style={{
            backgroundColor: "rgba(139, 92, 246, 0.15)",
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 10, color: "#a78bfa", fontWeight: "600" }}>{listing.category}</Text>
        </View>
      </View>

      <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff", marginBottom: 6 }} numberOfLines={1}>
        {listing.itemName}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#22c55e" }}>${listing.price}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 12, color: "#ef4444", fontWeight: "600" }}>Delete</Text>
          </Pressable>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: "rgba(139, 92, 246, 0.15)",
            }}
          >
            <Text style={{ fontSize: 12, color: "#a78bfa", fontWeight: "600" }}>View →</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { isWeb, isDesktop, isTablet, containerWidth } = useResponsive();
  const { theme } = useTheme();
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const history = await getHistory();
      setListings(history);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadHistory(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDelete = (id: string, itemName: string) => {
    Alert.alert("Delete Listing", `Delete "${itemName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteFromHistory(id);
          setListings((prev) => prev.filter((l) => l.id !== id));
        },
      },
    ]);
  };

  const handleView = (listing: SavedListing) => {
    router.push({ pathname: "/results", params: { results: JSON.stringify(listing.results) } });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40, alignItems: isDesktop ? "center" : "stretch" }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />}
      >
        <SafeAreaView style={{ flex: 1, width: containerWidth, alignSelf: "center" }} edges={["top"]}>
          {/* Header */}
          <View style={{ paddingHorizontal: isDesktop ? 32 : 20, paddingTop: isDesktop ? 32 : 16, paddingBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
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
                <Pressable onPress={() => router.push("/create")} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
                  <LinearGradient
                    colors={theme.primaryGradient}
                    style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>+ New</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>

            <Text
              style={{
                fontSize: isDesktop ? 36 : 28,
                fontWeight: "800",
                color: theme.text,
                marginBottom: 6,
                letterSpacing: -0.5,
              }}
            >
              History
            </Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>
              {listings.length} saved listing{listings.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {listings.length === 0 ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32, paddingTop: 60 }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  backgroundColor: theme.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 40,
                    borderWidth: 3,
                    borderColor: theme.primary,
                    borderRadius: 6,
                    backgroundColor: theme.surfaceHover,
                  }}
                />
              </View>

              <Text style={{ fontSize: 22, fontWeight: "800", color: theme.text, marginBottom: 10, textAlign: "center" }}>
                No History Yet
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: theme.textSecondary,
                  textAlign: "center",
                  lineHeight: 22,
                  marginBottom: 28,
                  maxWidth: 280,
                }}
              >
                Your generated listings will appear here
              </Text>

              <Pressable onPress={() => router.replace("/create")} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
                <LinearGradient
                  colors={theme.primaryGradient}
                  style={{
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    borderRadius: 14,
                    shadowColor: theme.primary,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>Create Your First Listing</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            <View style={{ paddingHorizontal: isDesktop ? 32 : 20 }}>
              <View
                style={{
                  flexDirection: isDesktop ? "row" : "column",
                  flexWrap: isDesktop ? "wrap" : undefined,
                  gap: 12,
                }}
              >
                {listings.map((listing) => (
                  <View key={listing.id} style={{ width: isDesktop || isTablet ? "48%" : "100%" }}>
                    <HistoryCard
                      listing={listing}
                      onDelete={() => handleDelete(listing.id, listing.itemName)}
                      onView={() => handleView(listing)}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}
