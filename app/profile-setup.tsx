import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  Alert,
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
import { useAppStore } from "../store/useAppStore";
import { useAuth } from "../context/AuthContext";
import { saveUserProfile } from "../services/auth";

type Gender = "male" | "female" | "other";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, setUser, measurements, setMeasurements } = useAppStore();
  const { user: authUser, refreshProfile } = useAuth();
  const [gender, setGender] = useState<Gender>(user.gender);
  const [height, setHeight] = useState(String(measurements.height));
  const [weight, setWeight] = useState(String(measurements.weight));
  const [age, setAge] = useState(String(measurements.age));
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const genderOptions: { value: Gender; label: string; icon: string }[] = [
    { value: "male", label: "Male", icon: "♂" },
    { value: "female", label: "Female", icon: "♀" },
    { value: "other", label: "Other", icon: "⚲" },
  ];

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

        <View style={styles.stepIndicator}>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Tell us about you
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          This helps us calibrate your measurements accurately
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          GENDER
        </Text>
        <View style={styles.genderContainer}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.genderOption,
                { borderColor: colors.border, backgroundColor: colors.card },
                gender === option.value && {
                  borderColor: Colors.primary,
                  backgroundColor: Colors.blueBg,
                },
              ]}
              onPress={() => setGender(option.value)}
            >
              <Text style={styles.genderIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.genderLabel,
                  { color: colors.textSecondary },
                  gender === option.value && { color: Colors.primary },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            HEIGHT
          </Text>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="resize-outline"
              size={20}
              color={colors.textSecondary}
            />
            <RNTextInput
              style={[styles.inputField, { color: colors.text }]}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="175"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={[styles.unit, { color: colors.textSecondary }]}>
              cm
            </Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            WEIGHT
          </Text>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="fitness-outline"
              size={20}
              color={colors.textSecondary}
            />
            <RNTextInput
              style={[styles.inputField, { color: colors.text }]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="70"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={[styles.unit, { color: colors.textSecondary }]}>
              kg
            </Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            AGE
          </Text>
          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="pulse-outline"
              size={20}
              color={colors.textSecondary}
            />
            <RNTextInput
              style={[styles.inputField, { color: colors.text }]}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="28"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={[styles.unit, { color: colors.textSecondary }]}>
              years
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[styles.bottomContainer, { backgroundColor: colors.background }]}
      >
        <Button
          title="Continue"
          loading={loading}
          onPress={async () => {
            setUser({ gender });
            setMeasurements({
              height: Number(height) || 175,
              weight: Number(weight) || 70,
              age: Number(age) || 28,
            });
            if (authUser) {
              setLoading(true);
              try {
                await saveUserProfile(authUser.uid, {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  gender,
                  height: Number(height) || 175,
                  weight: Number(weight) || 70,
                  age: Number(age) || 28,
                });
                await refreshProfile();
              } catch {
                Alert.alert("Error", "Failed to save profile");
              } finally {
                setLoading(false);
              }
            }
            router.push("/instructions");
          }}
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
  },
  stepIndicator: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xxxl,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    flex: 1,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    marginBottom: Spacing.xxxl,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  genderContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  genderOption: {
    flex: 1,
    paddingVertical: Spacing.xl,
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  genderIcon: {
    fontSize: 24,
    marginBottom: Spacing.sm,
    color: Colors.textGray,
  },
  genderLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  inputField: {
    flex: 1,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    padding: 0,
  },
  unit: {
    fontSize: FontSize.md,
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
