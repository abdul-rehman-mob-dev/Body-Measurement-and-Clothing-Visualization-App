import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Svg, { Polygon, Circle, Line, Text as SvgText, Rect } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { useAppStore } from "../../store/useAppStore";

const { width } = Dimensions.get("window");

const measurements = [
  { label: "Chest", key: "chest" as const, unit: "cm", change: "+2cm since last scan", changeType: "up" as const, icon: "🫁", color: "#FEE2E2" },
  { label: "Waist", key: "waist" as const, unit: "cm", change: "-1cm since last scan", changeType: "down" as const, icon: "⚡", color: "#FEF3C7" },
  { label: "Hips", key: "hips" as const, unit: "cm", change: "No change", changeType: "neutral" as const, icon: "🔴", color: "#F3F4F6" },
  { label: "Shoulder", key: "shoulder" as const, unit: "cm", change: "+0.5cm since last scan", changeType: "up" as const, icon: "📐", color: "#DBEAFE" },
  { label: "Inseam", key: "inseam" as const, unit: "cm", change: "No change", changeType: "neutral" as const, icon: "📏", color: "#F3F4F6" },
  { label: "Neck", key: "neck" as const, unit: "cm", change: "-0.5cm since last scan", changeType: "down" as const, icon: "🎯", color: "#ECFDF5" },
];

const radarLabels = ["Chest", "Waist", "Hips", "Shoulder", "Inseam", "Arms"];

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"measurements" | "history">(
    "measurements",
  );
  const { isDark, colors } = useTheme();
  const { measurements: storeMeasurements, selectedSize, scanHistory } = useAppStore();

  const getChange = (key: string) => {
    if (scanHistory.length < 2) return { text: "First scan", type: "neutral" as const };
    const latest = scanHistory[0];
    const prev = scanHistory[1];
    const diff = (latest as any)[key] - (prev as any)[key];
    if (diff === 0) return { text: "No change", type: "neutral" as const };
    const sign = diff > 0 ? "+" : "";
    return { text: `${sign}${diff}cm since last scan`, type: diff > 0 ? "up" as const : "down" as const };
  };

  const measurementsList = [
    { label: "Chest", key: "chest" as const, unit: "cm", icon: "🫁", color: "#FEE2E2" },
    { label: "Waist", key: "waist" as const, unit: "cm", icon: "⚡", color: "#FEF3C7" },
    { label: "Hips", key: "hips" as const, unit: "cm", icon: "🔴", color: "#F3F4F6" },
    { label: "Shoulder", key: "shoulder" as const, unit: "cm", icon: "📐", color: "#DBEAFE" },
    { label: "Inseam", key: "inseam" as const, unit: "cm", icon: "📏", color: "#F3F4F6" },
    { label: "Neck", key: "neck" as const, unit: "cm", icon: "🎯", color: "#ECFDF5" },
  ];

  const currentChest = storeMeasurements.chest;
  const lastFourScans = scanHistory.slice(0, 4).reverse();
  const historyData = lastFourScans.length >= 2
    ? lastFourScans.map((scan, i) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const date = new Date(scan.date);
        return { month: months[date.getMonth()], value: scan.chest };
      })
    : [
        { month: "Jan", value: currentChest - 4 },
        { month: "Mar", value: currentChest - 2 },
        { month: "May", value: currentChest + 1 },
        { month: "Jul", value: currentChest },
      ];

  const radarData = radarLabels.map((label, i) => {
    const keys = ["chest", "waist", "hips", "shoulder", "inseam", "arms"] as const;
    const key = keys[i];
    const maxValues: Record<string, number> = {
      chest: 120, waist: 110, hips: 120, shoulder: 60, inseam: 100, arms: 40,
    };
    const rawValue = (storeMeasurements as any)[key] || 0;
    const maxValue = maxValues[key] || 100;
    const value = Math.round((rawValue / maxValue) * 100);
    return { label, value };
  });

  const centerX = 130;
  const centerY = 130;
  const maxRadius = 100;
  const sides = radarData.length;

  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
    const maxValue = 100;
    const radius = (value / maxValue) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const radarPoints = radarData
    .map((d, i) => {
      const point = getPoint(i, d.value);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              My Measurements
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Scanned today · 6 metrics
            </Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Ionicons name="download-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Ionicons
                name="share-social-outline"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.recommendedCard,
            { backgroundColor: isDark ? Colors.darkSurface : Colors.blueBg },
          ]}
        >
          <View style={styles.recommendedIcon}>
            <Text style={styles.recommendedIconText}>M</Text>
          </View>
          <View style={styles.recommendedText}>
            <Text style={[styles.recommendedTitle, { color: colors.text }]}>
              Recommended Size: {selectedSize}
            </Text>
            <Text
              style={[
                styles.recommendedSubtitle,
                { color: colors.textSecondary },
              ]}
            >
              Based on your 6 measurements
            </Text>
          </View>
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={16} color={Colors.success} />
          </View>
        </View>

        <View
          style={[styles.tabContainer, { backgroundColor: colors.surface }]}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "measurements" && { backgroundColor: colors.card },
            ]}
            onPress={() => setActiveTab("measurements")}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                activeTab === "measurements" && {
                  color: colors.text,
                  fontWeight: FontWeight.semibold,
                },
              ]}
            >
              Measurements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "history" && { backgroundColor: colors.card },
            ]}
            onPress={() => setActiveTab("history")}
          >
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                activeTab === "history" && {
                  color: colors.text,
                  fontWeight: FontWeight.semibold,
                },
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "measurements" ? (
          <>
            <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>
                Body Proportions
              </Text>
              <Svg height="260" width="260">
                {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                  <Polygon
                    key={i}
                    points={radarData
                      .map((_, j) => {
                        const angle = (Math.PI * 2 * j) / sides - Math.PI / 2;
                        const r = maxRadius * scale;
                        return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                      })
                      .join(" ")}
                    fill="none"
                    stroke={colors.border}
                    strokeWidth="0.5"
                  />
                ))}
                {radarData.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                  return (
                    <Line
                      key={i}
                      x1={centerX}
                      y1={centerY}
                      x2={centerX + maxRadius * Math.cos(angle)}
                      y2={centerY + maxRadius * Math.sin(angle)}
                      stroke={colors.border}
                      strokeWidth="0.5"
                    />
                  );
                })}
                <Polygon
                  points={radarPoints}
                  fill="rgba(59, 110, 246, 0.15)"
                  stroke={Colors.primary}
                  strokeWidth="2"
                />
                {radarData.map((d, i) => {
                  const point = getPoint(i, d.value);
                  return (
                    <Circle
                      key={i}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={Colors.primary}
                    />
                  );
                })}
                {radarData.map((d, i) => {
                  const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
                  const labelRadius = maxRadius + 20;
                  return (
                    <SvgText
                      key={i}
                      x={centerX + labelRadius * Math.cos(angle)}
                      y={centerY + labelRadius * Math.sin(angle)}
                      fontSize="11"
                      fill={colors.textSecondary}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {d.label}
                    </SvgText>
                  );
                })}
              </Svg>
            </View>

            <View style={styles.measurementsGrid}>
              {measurementsList.map((item, index) => {
                const change = getChange(item.key);
                return (
                <View
                  key={index}
                  style={[styles.measurementCard, { backgroundColor: colors.card }]}
                >
                  <View style={styles.measurementHeader}>
                    <Text style={styles.measurementIcon}>{item.icon}</Text>
                    <View
                      style={[
                        styles.changeIndicator,
                        {
                          backgroundColor:
                            change.type === "up"
                              ? "#DCFCE7"
                              : change.type === "down"
                                ? "#FEF3C7"
                                : colors.surface,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          change.type === "up"
                            ? "arrow-up"
                            : change.type === "down"
                              ? "arrow-down"
                              : "remove"
                        }
                        size={12}
                        color={
                          change.type === "up"
                            ? Colors.success
                            : change.type === "down"
                              ? Colors.warning
                              : colors.textSecondary
                        }
                      />
                    </View>
                  </View>
              <Text style={[styles.measurementValue, { color: colors.text }]}>
                {storeMeasurements[item.key]} {item.unit}
              </Text>
                  <Text
                    style={[
                      styles.measurementLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={[
                      styles.measurementChange,
                      { color: colors.textTertiary },
                    ]}
                  >
                    {change.text}
                  </Text>
                </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.avatarButton, { backgroundColor: Colors.dark }]}
              onPress={() => router.push("/(tabs)/avatar")}
            >
              <View style={styles.avatarButtonLeft}>
                <View style={styles.avatarButtonIcon}>
                  <Ionicons name="body-outline" size={20} color={Colors.white} />
                </View>
                <View>
                  <Text style={styles.avatarButtonTitle}>View 3D Avatar</Text>
                  <Text style={styles.avatarButtonSubtitle}>
                    Try clothes on your model
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textGray} />
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Chest Measurement History
            </Text>
            <View style={styles.barChartContainer}>
              <View style={styles.barChartYAxis}>
                {[98, 94, 91, 88].map((val, i) => (
                  <Text key={i} style={[styles.barYLabel, { color: colors.textSecondary }]}>{val}</Text>
                ))}
              </View>
              <View style={styles.barChart}>
                {historyData.map((item, index) => {
                  const minVal = 88;
                  const maxVal = 98;
                  const barHeight = ((item.value - minVal) / (maxVal - minVal)) * 140;
                  return (
                    <View key={index} style={styles.barColumn}>
                      <View style={styles.barWrapper}>
                        <View style={[styles.bar, { height: barHeight, backgroundColor: Colors.primary }]} />
                      </View>
                      <Text style={[styles.barXLabel, { color: colors.textSecondary }]}>{item.month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}
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
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
  headerIcons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendedCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  recommendedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendedIconText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  recommendedText: {
    flex: 1,
  },
  recommendedTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  recommendedSubtitle: {
    fontSize: FontSize.sm,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.greenBg,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderRadius: BorderRadius.md,
  },
  tabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  chartCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.lg,
    alignSelf: "flex-start",
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  measurementCard: {
    width: (width - Spacing.xxl * 2 - Spacing.md) / 2,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  measurementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  measurementIcon: {
    fontSize: 24,
  },
  changeIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  measurementValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  measurementLabel: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  measurementChange: {
    fontSize: FontSize.xs,
  },
  avatarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },
  avatarButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatarButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButtonTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textWhite,
  },
  avatarButtonSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textGray,
    marginTop: 2,
  },
  barChartContainer: {
    flexDirection: "row",
    width: "100%",
    height: 180,
  },
  barChartYAxis: {
    justifyContent: "space-between",
    paddingRight: Spacing.sm,
    paddingBottom: 24,
  },
  barYLabel: {
    fontSize: FontSize.xs,
    textAlign: "right",
    width: 24,
  },
  barChart: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 4,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    height: 140,
    justifyContent: "flex-end",
  },
  bar: {
    width: 40,
    borderRadius: 6,
  },
  barXLabel: {
    fontSize: FontSize.xs,
    marginTop: Spacing.sm,
  },
});
