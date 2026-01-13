import React, { useRef } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsive } from "../lib/useResponsive";
import { useTheme } from "../lib/theme";
import { ThemeToggle } from "../components/ThemeToggle";

export default function LandingScreen() {
  const router = useRouter();
  const { isDesktop, isTablet, isMobile, containerWidth } = useResponsive();
  const { theme } = useTheme();

  const scrollRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<{ pricing: number; faq: number }>({ pricing: 0, faq: 0 });

  const scrollToSection = (section: "pricing" | "faq") => {
    const y = sectionPositions.current[section];
    scrollRef.current?.scrollTo({ y, animated: true });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Nav */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: isDesktop ? 48 : 20,
            paddingVertical: 16,
            maxWidth: 1200,
            width: "100%",
            alignSelf: "center",
          }}
        >
          {/* Logo - scrolls to top */}
          <Pressable
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
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
                marginRight: 10,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>L</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>ListingWriter</Text>
          </Pressable>

          {/* Nav Links - Desktop */}
          {isDesktop && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 32 }}>
              <Pressable onPress={() => router.push("/create")}>
                <Text style={{ fontSize: 14, fontWeight: "500", color: theme.textSecondary }}>Create</Text>
              </Pressable>
              <Pressable onPress={() => scrollToSection("pricing")}>
                <Text style={{ fontSize: 14, fontWeight: "500", color: theme.textSecondary }}>Pricing</Text>
              </Pressable>
              <Pressable onPress={() => scrollToSection("faq")}>
                <Text style={{ fontSize: 14, fontWeight: "500", color: theme.textSecondary }}>FAQ</Text>
              </Pressable>
              <Pressable onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}>
                <Text style={{ fontSize: 14, fontWeight: "500", color: theme.textSecondary }}>Contact</Text>
              </Pressable>
            </View>
          )}

          {/* Right side */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            <Pressable
              onPress={() => router.push("/create")}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <LinearGradient
                colors={theme.primaryGradient}
                style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Get Started</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Hero */}
        <View
          style={{
            paddingHorizontal: isDesktop ? 48 : 20,
            paddingTop: isDesktop ? 80 : 40,
            paddingBottom: isDesktop ? 100 : 60,
            maxWidth: 1200,
            width: "100%",
            alignSelf: "center",
            flexDirection: isDesktop ? "row" : "column",
            alignItems: isDesktop ? "center" : undefined,
          }}
        >
          <View style={{ flex: 1, maxWidth: isDesktop ? 600 : undefined }}>
            <View
              style={{
                backgroundColor: "rgba(139, 92, 246, 0.15)",
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                alignSelf: "flex-start",
                marginBottom: 20,
              }}
            >
              <Text style={{ color: "#a78bfa", fontSize: 13, fontWeight: "600" }}>AI-Powered</Text>
            </View>
            <Text
              style={{
                fontSize: isDesktop ? 56 : 36,
                fontWeight: "800",
                color: theme.text,
                marginBottom: 20,
                lineHeight: isDesktop ? 66 : 44,
                letterSpacing: -1,
              }}
            >
              Stop writing listings.{"\n"}
              <Text style={{ color: theme.primary }}>Start selling.</Text>
            </Text>
            <Text
              style={{
                fontSize: isDesktop ? 20 : 17,
                color: theme.textSecondary,
                lineHeight: isDesktop ? 32 : 26,
                marginBottom: 36,
                maxWidth: 500,
              }}
            >
              Upload photos of your item, add a few details, and get 3 optimized listing descriptions in seconds.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => router.push("/create")}
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
              >
                <LinearGradient
                  colors={theme.primaryGradient}
                  style={{
                    paddingHorizontal: 28,
                    paddingVertical: 16,
                    borderRadius: 14,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Try Free</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          {/* Desktop Hero Image Mock */}
          {isDesktop && (
            <View
              style={{
                flex: 1,
                marginLeft: 60,
                backgroundColor: theme.surface,
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      backgroundColor: theme.surfaceHover,
                      borderWidth: 2,
                      borderColor: i === 1 ? theme.primary : theme.border,
                      borderStyle: i === 1 ? "solid" : "dashed",
                    }}
                  />
                ))}
              </View>
              <View style={{ marginBottom: 12 }}>
                <View style={{ width: 120, height: 12, backgroundColor: theme.surfaceHover, borderRadius: 6, marginBottom: 8 }} />
                <View style={{ width: 200, height: 12, backgroundColor: theme.surfaceHover, borderRadius: 6 }} />
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["New", "Good", "Fair"].map((c) => (
                  <View
                    key={c}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      backgroundColor: c === "Good" ? theme.primary : theme.surfaceHover,
                    }}
                  >
                    <Text style={{ color: c === "Good" ? "#fff" : theme.textMuted, fontSize: 12, fontWeight: "600" }}>
                      {c}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* How It Works */}
        <View style={{ backgroundColor: theme.name === "dark" ? "#0f0f14" : "#f1f5f9", paddingVertical: isDesktop ? 80 : 50 }}>
          <View
            style={{
              paddingHorizontal: isDesktop ? 48 : 20,
              maxWidth: 1200,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                fontSize: isDesktop ? 36 : 28,
                fontWeight: "800",
                color: theme.text,
                textAlign: "center",
                marginBottom: 50,
              }}
            >
              How It Works
            </Text>
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                gap: isDesktop ? 32 : 24,
              }}
            >
              {[
                { step: "1", title: "Upload Photos", desc: "Add up to 3 photos of your item", color: "#22c55e" },
                { step: "2", title: "Add Details", desc: "Item name, price, condition, category", color: "#f59e0b" },
                { step: "3", title: "Get Listings", desc: "3 AI-generated descriptions ready to copy", color: theme.primary },
              ].map((item) => (
                <View
                  key={item.step}
                  style={{
                    flex: isDesktop ? 1 : undefined,
                    backgroundColor: theme.surface,
                    borderRadius: 20,
                    padding: 28,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: item.color,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#fff" }}>{item.step}</Text>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: theme.text, marginBottom: 8 }}>{item.title}</Text>
                  <Text style={{ fontSize: 15, color: theme.textSecondary, lineHeight: 22 }}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={{ paddingVertical: isDesktop ? 80 : 50, backgroundColor: theme.background }}>
          <View
            style={{
              paddingHorizontal: isDesktop ? 48 : 20,
              maxWidth: 1200,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                fontSize: isDesktop ? 36 : 28,
                fontWeight: "800",
                color: theme.text,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Why ListingWriter?
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.textSecondary,
                textAlign: "center",
                marginBottom: 50,
                maxWidth: 500,
                alignSelf: "center",
              }}
            >
              Our AI analyzes your photos and writes descriptions that sell
            </Text>
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              {[
                { title: "Photo Analysis", desc: "AI identifies brand, model, color and condition from your photos" },
                { title: "3 Tones", desc: "Casual, Professional, and Punchy variations to match any platform" },
                { title: "Market Research", desc: "AI considers pricing and buyer concerns for compelling copy" },
                { title: "Instant Results", desc: "Get ready-to-post listings in under 30 seconds" },
              ].map((feature, i) => (
                <View
                  key={i}
                  style={{
                    width: isDesktop || isTablet ? "48%" : "100%",
                    backgroundColor: theme.surface,
                    borderRadius: 16,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text, marginBottom: 8 }}>{feature.title}</Text>
                  <Text style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 22 }}>{feature.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View
          onLayout={(e) => { sectionPositions.current.pricing = e.nativeEvent.layout.y; }}
          style={{ paddingVertical: isDesktop ? 80 : 50, backgroundColor: theme.name === "dark" ? "#0f0f14" : "#f1f5f9" }}
        >
          <View
            style={{
              paddingHorizontal: isDesktop ? 48 : 20,
              maxWidth: 1200,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                fontSize: isDesktop ? 36 : 28,
                fontWeight: "800",
                color: theme.text,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Simple Pricing
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.textSecondary,
                textAlign: "center",
                marginBottom: 50,
              }}
            >
              Start free, upgrade when you need more
            </Text>
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                gap: 20,
                justifyContent: "center",
                alignItems: isDesktop ? "stretch" : "center",
              }}
            >
              {/* Free */}
              <View
                style={{
                  flex: isDesktop ? 1 : undefined,
                  width: isDesktop ? undefined : "100%",
                  maxWidth: 360,
                  backgroundColor: theme.surface,
                  borderRadius: 24,
                  padding: 28,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "700", color: theme.text, marginBottom: 6 }}>Free</Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 16 }}>Try it out</Text>
                <Text style={{ fontSize: 36, fontWeight: "800", color: theme.text, marginBottom: 20 }}>$0</Text>
                <View style={{ gap: 10, marginBottom: 24 }}>
                  {["5 listings/month", "All 3 writing tones", "Browser extension", "Copy to clipboard", "Basic photo analysis"].map((f) => (
                    <View key={f} style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ color: theme.success, marginRight: 8, fontSize: 14 }}>✓</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{f}</Text>
                    </View>
                  ))}
                </View>
                <Pressable
                  onPress={() => router.push("/create")}
                  style={({ pressed }) => ({
                    backgroundColor: theme.surfaceHover,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}>Get Started</Text>
                </Pressable>
              </View>

              {/* Pro */}
              <View
                style={{
                  flex: isDesktop ? 1 : undefined,
                  width: isDesktop ? undefined : "100%",
                  maxWidth: 360,
                  borderRadius: 24,
                  padding: 28,
                  borderWidth: 2,
                  borderColor: theme.primary,
                  backgroundColor: theme.surface,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: theme.text }}>Pro</Text>
                  <View
                    style={{
                      backgroundColor: theme.primary,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 8,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>POPULAR</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 16 }}>For serious sellers</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 20 }}>
                  <Text style={{ fontSize: 36, fontWeight: "800", color: theme.text }}>$9</Text>
                  <Text style={{ fontSize: 14, color: theme.textSecondary, marginLeft: 4 }}>/mo</Text>
                </View>
                <View style={{ gap: 10, marginBottom: 24 }}>
                  {["Unlimited listings", "Browser extension", "Priority AI processing", "Market price insights", "History & saved drafts"].map((f) => (
                    <View key={f} style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ color: theme.primary, marginRight: 8, fontSize: 14 }}>✓</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{f}</Text>
                    </View>
                  ))}
                </View>
                <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
                  <LinearGradient
                    colors={theme.primaryGradient}
                    style={{ paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>Coming Soon</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              {/* Pro+ */}
              <View
                style={{
                  flex: isDesktop ? 1 : undefined,
                  width: isDesktop ? undefined : "100%",
                  maxWidth: 360,
                  backgroundColor: theme.surface,
                  borderRadius: 24,
                  padding: 28,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: theme.text }}>Pro+</Text>
                  <View
                    style={{
                      backgroundColor: "#f59e0b",
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 8,
                      marginLeft: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>POWER</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 16 }}>For power resellers</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 20 }}>
                  <Text style={{ fontSize: 36, fontWeight: "800", color: theme.text }}>$19</Text>
                  <Text style={{ fontSize: 14, color: theme.textSecondary, marginLeft: 4 }}>/mo</Text>
                </View>
                <View style={{ gap: 10, marginBottom: 24 }}>
                  {["Everything in Pro", "Auto-fill on marketplaces", "Bulk listing generation", "SEO optimization", "Multi-platform posting", "API access"].map((f) => (
                    <View key={f} style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ color: "#f59e0b", marginRight: 8, fontSize: 14 }}>✓</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{f}</Text>
                    </View>
                  ))}
                </View>
                <Pressable
                  style={({ pressed }) => ({
                    backgroundColor: theme.surfaceHover,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}>Coming Soon</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={{ paddingVertical: isDesktop ? 80 : 50, backgroundColor: theme.background }}>
          <View
            style={{
              paddingHorizontal: isDesktop ? 48 : 20,
              maxWidth: 700,
              width: "100%",
              alignSelf: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: isDesktop ? 40 : 28,
                fontWeight: "800",
                color: theme.text,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Ready to sell faster?
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.textSecondary,
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              Join thousands of sellers using AI to write better listings
            </Text>
            <Pressable
              onPress={() => router.push("/create")}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <LinearGradient
                colors={theme.primaryGradient}
                style={{
                  paddingHorizontal: 40,
                  paddingVertical: 18,
                  borderRadius: 16,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 17 }}>Start Free</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* FAQ */}
        <View
          onLayout={(e) => { sectionPositions.current.faq = e.nativeEvent.layout.y; }}
          style={{ paddingVertical: isDesktop ? 80 : 50, backgroundColor: theme.name === "dark" ? "#0f0f14" : "#f1f5f9" }}
        >
          <View
            style={{
              paddingHorizontal: isDesktop ? 48 : 20,
              maxWidth: 900,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <Text
              style={{
                fontSize: isDesktop ? 36 : 28,
                fontWeight: "800",
                color: theme.text,
                textAlign: "center",
                marginBottom: 50,
              }}
            >
              Frequently Asked Questions
            </Text>
            <View style={{ gap: 16 }}>
              {[
                {
                  q: "How does ListingWriter work?",
                  a: "Upload photos of your item, add basic details like name, price, and condition, and our AI analyzes the images to generate three optimized listing descriptions in different tones - casual, professional, and punchy.",
                },
                {
                  q: "What marketplaces can I use the listings for?",
                  a: "The generated descriptions work great on Craigslist, Facebook Marketplace, OfferUp, Poshmark, Mercari, eBay, and any other platform where you sell items.",
                },
                {
                  q: "Is my data safe?",
                  a: "Yes! We don't store your images after processing. Your listing history is saved locally on your device. We take privacy seriously and never share your data with third parties.",
                },
                {
                  q: "Can I edit the generated listings?",
                  a: "Absolutely! The generated text is just a starting point. Copy it to your clipboard and edit it however you like before posting.",
                },
                {
                  q: "What's the difference between the tones?",
                  a: "Casual is friendly and conversational - great for Facebook Marketplace. Professional is detailed and polished - ideal for higher-value items. Punchy is short and direct - perfect for quick-scroll platforms.",
                },
                {
                  q: "Do you offer refunds?",
                  a: "Since we offer a generous free tier, you can try before you buy. Paid plans come with a 7-day money-back guarantee if you're not satisfied.",
                },
              ].map((faq, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: 16,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text, marginBottom: 8 }}>{faq.q}</Text>
                  <Text style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 22 }}>{faq.a}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={{ paddingVertical: 32, paddingHorizontal: isDesktop ? 48 : 20, backgroundColor: theme.name === "dark" ? "#0f0f14" : "#f1f5f9" }}>
          <View
            style={{
              maxWidth: 1200,
              width: "100%",
              alignSelf: "center",
              flexDirection: isDesktop ? "row" : "column",
              justifyContent: "space-between",
              alignItems: isDesktop ? "center" : undefined,
              gap: 20,
            }}
          >
            {/* Left - Logo & Copyright */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: theme.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>L</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: "600", color: theme.text }}>ListingWriter</Text>
              </View>
              <Text style={{ fontSize: 13, color: theme.textMuted }}>© 2025</Text>
            </View>

            {/* Right - Legal Links */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>Privacy</Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>Terms</Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>Contact</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
