import React, { useRef, useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Animated } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsive } from "../lib/useResponsive";
import { useTheme } from "../lib/theme";
import { ThemeToggle } from "../components/ThemeToggle";
import { Sparkles, Zap, TrendingUp, Star, Users, Clock, Shield, Check } from "lucide-react-native";

export default function LandingScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]).start();

    // Count up animation
    let count = 0;
    const interval = setInterval(() => {
      count += 123;
      if (count >= 15000) {
        count = 15000;
        clearInterval(interval);
      }
      setUserCount(count);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <Sparkles size={24} color={theme.primary} />, title: "AI-Powered", desc: "Generate listings in seconds" },
    { icon: <Zap size={24} color={theme.primary} />, title: "Lightning Fast", desc: "10x faster than writing manually" },
    { icon: <TrendingUp size={24} color={theme.primary} />, title: "Higher Conversions", desc: "Optimized for sales" },
    { icon: <Shield size={24} color={theme.primary} />, title: "SEO Optimized", desc: "Rank higher in search" }
  ];

  const testimonials = [
    { stars: 5, text: "Increased my eBay sales by 40%", author: "Mike R., Seller" },
    { stars: 5, text: "Saves me hours every week", author: "Sarah K., Shop Owner" },
    { stars: 5, text: "Best investment for my business", author: "Tom B., Reseller" }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        
        {/* Navigation */}
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: isDesktop ? 48 : 20,
          paddingVertical: 16,
          maxWidth: 1200,
          width: "100%",
          alignSelf: "center",
        }}>
          <Pressable
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <LinearGradient
              colors={[theme.primary, theme.primary + "DD"]}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>L</Text>
            </LinearGradient>
            <Text style={{ fontSize: 20, fontWeight: "700", color: theme.text }}>ListingWriter</Text>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <ThemeToggle />
            <Pressable
              onPress={() => router.push("/create")}
              style={{
                backgroundColor: theme.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600" }}>Try Free</Text>
            </Pressable>
          </View>
        </View>

        {/* Hero Section */}
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          paddingHorizontal: isDesktop ? 48 : 20,
          paddingVertical: 60,
          maxWidth: 1200,
          alignSelf: "center",
          width: "100%",
        }}>
          {/* Trust Badge */}
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            backgroundColor: theme.card,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            marginBottom: 24,
            gap: 8,
          }}>
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
            <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
              Trusted by {userCount.toLocaleString()}+ sellers
            </Text>
          </View>

          {/* Headline */}
          <Text style={{
            fontSize: isDesktop ? 56 : 40,
            fontWeight: "800",
            color: theme.text,
            lineHeight: isDesktop ? 64 : 48,
            marginBottom: 20,
          }}>
            Write Listings That{"\n"}
            <Text style={{ color: theme.primary }}>Sell Like Crazy</Text>
          </Text>

          {/* Subheadline */}
          <Text style={{
            fontSize: isDesktop ? 20 : 18,
            color: theme.textSecondary,
            lineHeight: 28,
            marginBottom: 32,
            maxWidth: 600,
          }}>
            AI-powered listing writer for eBay, Etsy, Poshmark & more. 
            Turn boring descriptions into sales magnets in seconds.
          </Text>

          {/* CTA Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 40 }}>
            <Pressable
              onPress={() => router.push("/create")}
              style={{
                backgroundColor: theme.primary,
                paddingHorizontal: 28,
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Zap size={20} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                Create Free Listing
              </Text>
            </Pressable>

            <Pressable
              style={{
                borderWidth: 2,
                borderColor: theme.border,
                paddingHorizontal: 28,
                paddingVertical: 16,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: theme.text, fontSize: 16, fontWeight: "600" }}>
                See Examples
              </Text>
            </Pressable>
          </View>

          {/* Stats */}
          <View style={{
            flexDirection: "row",
            gap: 32,
            paddingTop: 24,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}>
            <View>
              <Text style={{ fontSize: 32, fontWeight: "800", color: theme.text }}>40%</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 14 }}>More Sales</Text>
            </View>
            <View>
              <Text style={{ fontSize: 32, fontWeight: "800", color: theme.text }}>10x</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Faster</Text>
            </View>
            <View>
              <Text style={{ fontSize: 32, fontWeight: "800", color: theme.text }}>15K+</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 14 }}>Active Users</Text>
            </View>
          </View>
        </Animated.View>

        {/* Features Grid */}
        <View style={{
          paddingHorizontal: isDesktop ? 48 : 20,
          paddingVertical: 60,
          backgroundColor: theme.card,
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: "700",
            color: theme.text,
            textAlign: "center",
            marginBottom: 40,
          }}>
            Why Sellers Love Us
          </Text>

          <View style={{
            flexDirection: isDesktop ? "row" : "column",
            gap: 16,
            maxWidth: 1200,
            alignSelf: "center",
          }}>
            {features.map((f, i) => (
              <View key={i} style={{
                flex: 1,
                backgroundColor: theme.background,
                padding: 24,
                borderRadius: 16,
                gap: 12,
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: theme.primary + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {f.icon}
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>{f.title}</Text>
                <Text style={{ color: theme.textSecondary }}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Testimonials */}
        <View style={{
          paddingHorizontal: isDesktop ? 48 : 20,
          paddingVertical: 60,
          maxWidth: 1200,
          alignSelf: "center",
          width: "100%",
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: "700",
            color: theme.text,
            textAlign: "center",
            marginBottom: 40,
          }}>
            Real Results
          </Text>

          <View style={{
            flexDirection: isDesktop ? "row" : "column",
            gap: 16,
          }}>
            {testimonials.map((t, i) => (
              <View key={i} style={{
                flex: 1,
                backgroundColor: theme.card,
                padding: 24,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.border,
              }}>
                <View style={{ flexDirection: "row", gap: 4, marginBottom: 12 }}>
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} size={16} color="#F59E0B" fill="#F59E0B" />
                  ))}
                </View>
                <Text style={{
                  fontSize: 16,
                  color: theme.text,
                  marginBottom: 12,
                  fontWeight: "500",
                }}>
                  "{t.text}"
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{t.author}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom CTA */}
        <LinearGradient
          colors={[theme.primary, theme.primary + "CC"]}
          style={{
            paddingHorizontal: isDesktop ? 48 : 20,
            paddingVertical: 60,
            alignItems: "center",
          }}
        >
          <Text style={{
            fontSize: isDesktop ? 36 : 28,
            fontWeight: "800",
            color: "#fff",
            textAlign: "center",
            marginBottom: 16,
          }}>
            Ready to 10x Your Sales?
          </Text>
          <Text style={{
            fontSize: 16,
            color: "#fff",
            opacity: 0.9,
            textAlign: "center",
            marginBottom: 32,
          }}>
            Join 15,000+ sellers already using ListingWriter
          </Text>
          <Pressable
            onPress={() => router.push("/create")}
            style={{
              backgroundColor: "#fff",
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Sparkles size={20} color={theme.primary} />
            <Text style={{ color: theme.primary, fontSize: 16, fontWeight: "700" }}>
              Start Free - No Credit Card
            </Text>
          </Pressable>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}