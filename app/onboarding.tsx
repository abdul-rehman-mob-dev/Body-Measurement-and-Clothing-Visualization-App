import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../components/Button";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={require("../images/onboarding.png")}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.imageOverlay} />
        <View style={styles.imageContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AI-Powered Sizing</Text>
          </View>
          <Text style={styles.title}>Your Perfect Fit{"\n"}Starts Here</Text>
          <Text style={styles.description}>
            Scan your body in seconds. Get precise measurements. Shop with
            confidence.
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.bottomSection}>
        <View style={styles.buttonContainer}>
          <Button
            title="Get Started →"
            onPress={() => router.push("/auth/create-account")}
            variant="primary"
          />
          <Button
            title="I already have an account"
            onPress={() => router.push("/auth/sign-in")}
            variant="secondary"
          />
        </View>

        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          By continuing you agree to our{" "}
          <Text style={[styles.link, { color: colors.text }]}>Terms</Text> &{" "}
          <Text style={[styles.link, { color: colors.text }]}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    width: width,
    height: height * 0.7,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  imageContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  badgeText: {
    color: Colors.textWhite,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.textWhite,
    lineHeight: 40,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.md,
    lineHeight: 24,
    color: Colors.textWhite,
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    justifyContent: "center",
  },
  buttonContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  terms: {
    fontSize: FontSize.xs,
    textAlign: "center",
  },
  link: {
    fontWeight: FontWeight.medium,
  },
});
