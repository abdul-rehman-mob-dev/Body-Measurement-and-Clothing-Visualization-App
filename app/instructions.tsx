import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

const instructions = [
  {
    icon: "📐",
    title: "Stand 2 meters away",
    description:
      "Use the camera grid to ensure you're at the right distance from the wall.",
  },
  {
    icon: "👕",
    title: "Wear fitted clothing",
    description:
      "Tight-fitting clothes help our AI detect body contours more accurately.",
  },
  {
    icon: "💡",
    title: "Good lighting",
    description:
      "Stand in a well-lit area facing a light source for best results.",
  },
  {
    icon: "🧍",
    title: "Natural posture",
    description: "Stand straight with arms slightly away from your sides.",
  },
];

export default function InstructionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Instructions</Text>

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.bodyGuide}>
              <View style={styles.guideRectangle} />
            </View>
            <Text style={styles.imageLabel}>Body alignment guide</Text>
          </View>
        </View>

        <View style={styles.instructionsList}>
          {instructions.map((item, index) => (
            <View
              key={index}
              style={[
                styles.instructionCard,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={styles.instructionIcon}>{item.icon}</Text>
              <View style={styles.instructionText}>
                <Text style={[styles.instructionTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.instructionDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[styles.bottomContainer, { backgroundColor: colors.background }]}
      >
        <Button
          title="Start Capture — Front View →"
          onPress={() => router.push("/capture")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    paddingBottom: 120,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xxl,
    marginTop: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xl,
  },
  imageContainer: {
    width: "100%",
    height: 220,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  bodyGuide: {
    width: 120,
    height: 160,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    borderStyle: "dashed",
    marginBottom: Spacing.md,
  },
  guideRectangle: {
    flex: 1,
  },
  imageLabel: {
    color: Colors.textWhite,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  instructionsList: {
    gap: Spacing.md,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  instructionIcon: {
    fontSize: 28,
  },
  instructionText: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  instructionDescription: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    paddingTop: Spacing.lg,
  },
});
