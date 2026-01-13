import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import {
  getUsage,
  incrementUsage,
  canGenerate,
  getRemainingGenerations,
  saveToHistory,
  UsageData,
} from "../lib/storage";
import { useResponsive } from "../lib/useResponsive";
import { useTheme } from "../lib/theme";
import { ThemeToggle } from "../components/ThemeToggle";

type Condition = "New" | "Like New" | "Good" | "Fair" | "Parts";
type Category =
  | "Furniture"
  | "Electronics"
  | "Clothing"
  | "Auto"
  | "Home"
  | "Sports"
  | "Other";

const CONDITIONS: Condition[] = ["New", "Like New", "Good", "Fair", "Parts"];
const CATEGORIES: Category[] = [
  "Furniture",
  "Electronics",
  "Clothing",
  "Auto",
  "Home",
  "Sports",
  "Other",
];

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

export default function HomeScreen() {
  const router = useRouter();
  const { width, isWeb, isDesktop, isTablet, isMobile, containerWidth } = useResponsive();
  const { theme } = useTheme();

  const PHOTO_SIZE = isDesktop ? 160 : isTablet ? 140 : Math.min((width - 48 - 24) / 3, 120);

  const [images, setImages] = useState<string[]>([]);
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<Condition | "">("");
  const [category, setCategory] = useState<Category | "">("");
  const [details, setDetails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);

  useFocusEffect(
    useCallback(() => {
      getUsage().then(setUsage);
    }, [])
  );

  const remaining = usage ? getRemainingGenerations(usage) : 5;
  const canCreate = usage ? canGenerate(usage) : true;

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3 - images.length,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages([...images, ...result.assets.map((a) => a.uri)].slice(0, 3));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!images.length || !itemName || !price || !condition || !category) {
      Alert.alert("Missing info", "Please fill out all required fields");
      return;
    }

    if (!canCreate) {
      Alert.alert("Limit Reached", "You've used all your free listings this month. Pro tier coming soon!");
      return;
    }

    setIsLoading(true);

    try {
      const base64Images = await Promise.all(
        images.map(async (uri) => {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return base64;
        })
      );

      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: base64Images,
          itemName,
          price: parseInt(price, 10),
          condition,
          category,
          additionalDetails: details,
        }),
      });

      const data = await response.json();

      if (data.success && data.listings) {
        const newUsage = await incrementUsage();
        setUsage(newUsage);

        await saveToHistory({
          itemName,
          price: parseInt(price, 10),
          condition,
          category,
          results: data.listings,
          thumbnailUri: images[0],
        });

        router.push({
          pathname: "/results",
          params: { results: JSON.stringify(data.listings) },
        });
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = images.length > 0 && itemName && price && condition && category;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          alignItems: isDesktop ? "center" : "stretch",
        }}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView
          style={{
            flex: 1,
            width: containerWidth,
            alignSelf: "center",
          }}
          edges={["top"]}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: isDesktop ? 32 : 20,
              paddingTop: isDesktop ? 32 : 16,
              paddingBottom: isDesktop ? 32 : 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isDesktop ? 40 : 20,
              }}
            >
              <Pressable
                onPress={() => isWeb && router.push("/landing")}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: theme.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>L</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>
                  ListingWriter
                </Text>
              </Pressable>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                {usage && (
                  <View
                    style={{
                      backgroundColor: "rgba(139, 92, 246, 0.15)",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(139, 92, 246, 0.3)",
                    }}
                  >
                    <Text style={{ color: "#a78bfa", fontSize: 13, fontWeight: "600" }}>
                      {remaining === Infinity ? "Unlimited (Pro)" : `${remaining} free left`}
                    </Text>
                  </View>
                )}
                <ThemeToggle />
                <Pressable
                  onPress={() => router.push("/history")}
                  style={({ pressed }) => ({
                    backgroundColor: theme.surface,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: theme.border,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: theme.text, fontSize: 14, fontWeight: "600" }}>History</Text>
                </Pressable>
              </View>
            </View>

            <Text
              style={{
                fontSize: isDesktop ? 40 : 28,
                fontWeight: "800",
                color: theme.text,
                marginBottom: 8,
                letterSpacing: -0.5,
              }}
            >
              Sell faster with <Text style={{ color: theme.primary }}>AI</Text>
            </Text>
            <Text
              style={{
                fontSize: isDesktop ? 17 : 15,
                color: theme.textSecondary,
                lineHeight: isDesktop ? 26 : 22,
              }}
            >
              Upload photos, add details, get 3 ready-to-post descriptions
            </Text>
          </View>

          {/* Main Content */}
          <View
            style={{
              paddingHorizontal: isDesktop ? 32 : 20,
            }}
          >
            {/* Photos Section */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: "#22c55e",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>1</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text }}>Add Photos</Text>
              </View>

              <View
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View style={{ flexDirection: "row", gap: 10, justifyContent: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <Pressable
                      key={i}
                      onPress={() => (images[i] ? removeImage(i) : pickImages())}
                      style={({ pressed }) => ({
                        width: PHOTO_SIZE,
                        height: PHOTO_SIZE,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      {images[i] ? (
                        <View style={{ flex: 1 }}>
                          <Image
                            source={{ uri: images[i] }}
                            style={{ width: "100%", height: "100%", borderRadius: 12 }}
                            resizeMode="cover"
                          />
                          <Pressable
                            onPress={() => removeImage(i)}
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              width: 24,
                              height: 24,
                              backgroundColor: "rgba(0,0,0,0.7)",
                              borderRadius: 12,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>x</Text>
                          </Pressable>
                        </View>
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: theme.surfaceHover,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: theme.border,
                            borderStyle: "dashed",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <View
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 18,
                              backgroundColor: "rgba(139, 92, 246, 0.2)",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: 4,
                            }}
                          >
                            <Text style={{ fontSize: 20, color: theme.primary }}>+</Text>
                          </View>
                          <Text style={{ fontSize: 11, color: theme.textMuted, fontWeight: "600" }}>
                            {i === 0 ? "Required" : "Optional"}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    color: theme.textMuted,
                    textAlign: "center",
                    marginTop: 12,
                  }}
                >
                  AI analyzes photos for brand, model, and condition
                </Text>
              </View>
            </View>

            {/* Details Section */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: "#f59e0b",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 10,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>2</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text }}>Add Details</Text>
              </View>

              <View
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                {/* Title */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: theme.textMuted, marginBottom: 6 }}>
                    What are you selling?
                  </Text>
                  <TextInput
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="e.g. iPhone 14 Pro, IKEA Kallax"
                    placeholderTextColor={theme.textMuted}
                    style={{
                      fontSize: 15,
                      color: theme.text,
                      backgroundColor: theme.surfaceHover,
                      borderRadius: 10,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  />
                </View>

                {/* Price */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: theme.textMuted, marginBottom: 6 }}>
                    Price
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: theme.surfaceHover,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.border,
                      paddingHorizontal: 14,
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: "700", color: theme.success }}>$</Text>
                    <TextInput
                      value={price}
                      onChangeText={(t) => setPrice(t.replace(/\D/g, ""))}
                      placeholder="0"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="numeric"
                      style={{
                        flex: 1,
                        fontSize: 18,
                        fontWeight: "700",
                        color: theme.text,
                        paddingVertical: 12,
                        marginLeft: 4,
                      }}
                    />
                  </View>
                </View>

                {/* Condition */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: theme.textMuted, marginBottom: 8 }}>
                    Condition
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {CONDITIONS.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => setCondition(c)}
                        style={({ pressed }) => ({
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 16,
                          backgroundColor: condition === c ? theme.primary : theme.surfaceHover,
                          borderWidth: 1,
                          borderColor: condition === c ? theme.primary : theme.border,
                          opacity: pressed ? 0.8 : 1,
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: condition === c ? "#fff" : theme.textSecondary,
                          }}
                        >
                          {c}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Category */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: theme.textMuted, marginBottom: 8 }}>
                    Category
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {CATEGORIES.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => setCategory(c)}
                        style={({ pressed }) => ({
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 16,
                          backgroundColor: category === c ? theme.primary : theme.surfaceHover,
                          borderWidth: 1,
                          borderColor: category === c ? theme.primary : theme.border,
                          opacity: pressed ? 0.8 : 1,
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: category === c ? "#fff" : theme.textSecondary,
                          }}
                        >
                          {c}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Notes */}
                <View>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: theme.textMuted, marginBottom: 6 }}>
                    Extra details <Text style={{ color: theme.textMuted }}>(optional)</Text>
                  </Text>
                  <TextInput
                    value={details}
                    onChangeText={setDetails}
                    placeholder="Scratches, accessories, why selling..."
                    placeholderTextColor={theme.textMuted}
                    multiline
                    numberOfLines={3}
                    style={{
                      fontSize: 14,
                      color: theme.text,
                      backgroundColor: theme.surfaceHover,
                      borderRadius: 10,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderWidth: 1,
                      borderColor: theme.border,
                      minHeight: 70,
                      textAlignVertical: "top",
                    }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Generate Button */}
          <View style={{ paddingHorizontal: isDesktop ? 32 : 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: theme.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>3</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text }}>Generate Listings</Text>
            </View>

            <Pressable
              onPress={handleGenerate}
              disabled={isLoading || !isValid}
              style={({ pressed }) => ({ opacity: pressed && isValid ? 0.9 : 1 })}
            >
              <LinearGradient
                colors={isValid ? theme.primaryGradient : [theme.surfaceHover, theme.surfaceHover]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 16,
                  borderRadius: 14,
                  alignItems: "center",
                  shadowColor: isValid ? theme.primary : "transparent",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isValid ? 0.4 : 0,
                  shadowRadius: 12,
                }}
              >
                {isLoading ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>Analyzing...</Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: isValid ? "#fff" : theme.textMuted,
                    }}
                  >
                    Generate 3 Listings
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
            {!isValid && (
              <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: "center", marginTop: 10 }}>
                Add a photo and fill in the required fields
              </Text>
            )}
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}
