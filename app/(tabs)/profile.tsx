import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { logOut } from '../../services/auth';
import { SecureStorage } from '../../services/secureStorage';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, measurements, selectedSize, scanHistory, clearUserData } = useAppStore();
  const clearScanHistory = useAppStore((s) => s.clearScanHistory);

  const menuItems = [
    { icon: 'camera-outline', title: 'Rescan Body', subtitle: 'Update your measurements', screen: '/instructions' },
    { icon: 'stats-chart-outline', title: 'Measurement History', subtitle: `${scanHistory.length} scans completed`, screen: null },
    { icon: 'notifications-outline', title: 'Scan Reminders', subtitle: 'Monthly reminders enabled', screen: null },
    { icon: 'shield-outline', title: 'Privacy & Data', subtitle: 'Manage your data & security', screen: '/privacy' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.settingsButton, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name.charAt(0) || '?'}</Text>
              </View>
            )}
            <View style={styles.onlineIndicator} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user.name || 'No Name'}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email || 'No Email'}</Text>
          {user.phone ? (
            <Text style={[styles.email, { color: colors.textSecondary }]}>{user.phone}</Text>
          ) : null}
        </View>

        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{scanHistory.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Scans</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{selectedSize}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Size</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{scanHistory.length > 0 ? scanHistory.length * 2 : 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Photos</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Body Profile</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bodyStats}>
            <View style={[styles.bodyStatItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.bodyStatLabel, { color: colors.textSecondary }]}>Height</Text>
              <Text style={[styles.bodyStatValue, { color: colors.text }]}>{measurements.height} <Text style={[styles.bodyStatUnit, { color: colors.textSecondary }]}>cm</Text></Text>
            </View>
            <View style={[styles.bodyStatItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.bodyStatLabel, { color: colors.textSecondary }]}>Weight</Text>
              <Text style={[styles.bodyStatValue, { color: colors.text }]}>{measurements.weight} <Text style={[styles.bodyStatUnit, { color: colors.textSecondary }]}>kg</Text></Text>
            </View>
            <View style={[styles.bodyStatItem, { backgroundColor: colors.surface }]}>
              <Text style={[styles.bodyStatLabel, { color: colors.textSecondary }]}>Age</Text>
              <Text style={[styles.bodyStatValue, { color: colors.text }]}>{measurements.age} <Text style={[styles.bodyStatUnit, { color: colors.textSecondary }]}>yr</Text></Text>
            </View>
          </View>
        </View>

        <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => item.screen && router.push(item.screen as any)}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name={item.icon as any} size={22} color={colors.text} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {scanHistory.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Scan History</Text>
              <TouchableOpacity onPress={() => {
                Alert.alert(
                  "Clear Scan History",
                  "Are you sure? This will delete all scan records.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear All",
                      style: "destructive",
                      onPress: () => clearScanHistory(),
                    },
                  ]
                );
              }}>
                <Text style={[styles.clearAllText]}>Clear All</Text>
              </TouchableOpacity>
            </View>
            {scanHistory.map((scan, index) => (
              <View key={scan.id} style={[styles.scanItem, { borderBottomColor: colors.border }]}>
                <View style={styles.scanLeft}>
                  <View style={[styles.scanIcon, { backgroundColor: colors.surface }]}>
                    <Ionicons name="body-outline" size={20} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.scanDate, { color: colors.text }]}>
                      {new Date(scan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <Text style={[styles.scanTime, { color: colors.textSecondary }]}>
                      {new Date(scan.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <View style={styles.scanRight}>
                  <View style={[styles.scanSizeBadge, { backgroundColor: Colors.primary + '15' }]}>
                    <Text style={[styles.scanSizeText, { color: Colors.primary }]}>{scan.size}</Text>
                  </View>
                  <View style={styles.scanMeasurements}>
                    <Text style={[styles.scanMeasurement, { color: colors.textSecondary }]}>
                      {scan.chest}cm chest
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={[styles.signOutButton]} onPress={async () => {
          Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign Out",
                style: "destructive",
                onPress: async () => {
                  await logOut();
                  clearUserData();
                  await SecureStorage.clearAllData();
                  router.replace("/onboarding");
                },
              },
            ]
          );
        }}>
          <View style={[styles.signOutIcon]}>
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          </View>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.light,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSize.md,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  viewAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  bodyStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  bodyStatItem: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  bodyStatLabel: {
    fontSize: FontSize.xs,
    marginBottom: Spacing.xs,
  },
  bodyStatValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  bodyStatUnit: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
  },
  menuContainer: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 0.5,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  menuSubtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  signOutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.error,
  },
  scanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
  },
  scanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  scanIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanDate: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  scanTime: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  scanRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  scanSizeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  scanSizeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  scanMeasurements: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  scanMeasurement: {
    fontSize: FontSize.xs,
  },
  clearAllText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    fontWeight: FontWeight.medium,
  },
});
