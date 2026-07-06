import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { useAppStore } from "../../store/useAppStore";

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const { user } = useAppStore();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          APPEARANCE
        </Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.settingRow}>
            <View
              style={[styles.settingIcon, { backgroundColor: colors.surface }]}
            >
              <Ionicons
                name={isDark ? "moon-outline" : "sunny-outline"}
                size={20}
                color={colors.text}
              />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Dark Mode
              </Text>
              <Text
                style={[
                  styles.settingSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {isDark ? "Dark theme active" : "Light theme active"}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
          <View
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[styles.settingIcon, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="resize-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Measurement Units
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          NOTIFICATIONS
        </Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[styles.settingIcon, { backgroundColor: colors.surface }]}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.text}
              />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Push Notifications
              </Text>
              <Text
                style={[
                  styles.settingSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Scan reminders & updates
              </Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
          <View
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[styles.settingIcon, { backgroundColor: colors.surface }]}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color={colors.text}
              />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Haptic Feedback
              </Text>
              <Text
                style={[
                  styles.settingSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Vibration during capture
              </Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          ACCOUNT
        </Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: colors.border }]}
            onPress={() => router.push('/edit-profile')}
          >
            <View
              style={[styles.settingIcon, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="person-outline" size={20} color={colors.text} />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Edit Profile
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
          <View style={styles.settingRow}>
            <View
              style={[styles.settingIcon, { backgroundColor: colors.surface }]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.text}
              />
            </View>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Privacy & Security
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          </View>
        </View>

        <View style={styles.appInfo}>
          <View style={styles.appInfoIcon}>
            <Ionicons name="flash" size={20} color={Colors.white} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            BodyFit AI
          </Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Version 2.4.1 · Build 1847
          </Text>
          <Text
            style={[styles.appDescription, { color: colors.textSecondary }]}
          >
            Precision body measurement technology powered by computer vision and
            machine learning.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: 60,
    paddingBottom: Spacing.xxxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  section: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    borderBottomWidth: 0.5,
    borderBottomColor: "transparent",
    gap: Spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  settingSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  appInfo: {
    alignItems: "center",
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.xl,
  },
  appInfoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  appVersion: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.md,
  },
  appDescription: {
    fontSize: FontSize.sm,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: Spacing.xxl,
  },
});
