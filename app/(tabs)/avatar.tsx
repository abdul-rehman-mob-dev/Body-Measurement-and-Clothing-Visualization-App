import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../store/useAppStore';
import { BodyAvatar3D } from '../../components/Avatar3D/BodyAvatar3D';
import { CLOTHING_CATALOG, getSizeRecommendation } from '../../data/clothingData';

type ViewAngle = 'L' | 'F' | 'R' | 'B';
type FitType = 'Slim' | 'Regular' | 'Relaxed';

const defaultMeasurements = {
  chest: 94,
  waist: 78,
  hips: 97,
  shoulders: 46,
  inseam: 81,
  neck: 38,
};

export default function AvatarScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    selectedViewAngle: selectedView,
    setSelectedViewAngle: setSelectedView,
    selectedFit,
    setSelectedFit,
    selectedClothing,
    setSelectedClothing,
    measurements,
  } = useAppStore();

  const viewAngles: ViewAngle[] = ['L', 'F', 'R', 'B'];
  const fitTypes: FitType[] = ['Slim', 'Regular', 'Relaxed'];

  const hasMeasurements = measurements.chest > 0 && measurements.shoulder > 0;

  const bodyMeasurements = hasMeasurements
    ? {
        chest: measurements.chest,
        waist: measurements.waist,
        hips: measurements.hips,
        shoulders: measurements.shoulder,
        inseam: measurements.inseam || 81,
        neck: measurements.neck || 38,
      }
    : defaultMeasurements;

  const selectedClothingItem = CLOTHING_CATALOG[selectedClothing] || CLOTHING_CATALOG[0];
  const sizeRecommendation = getSizeRecommendation(bodyMeasurements.chest);

  if (!hasMeasurements) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyContainer}>
          <Ionicons name="body-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Body Scan Yet</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Complete a body scan to see your 3D avatar
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/capture')}
          >
            <Text style={styles.emptyButtonText}>Start Body Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>3D Avatar</Text>
          <TouchableOpacity style={[styles.editButton, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Ionicons name="pencil" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.avatarCard, { backgroundColor: colors.card }]}>
          <View style={styles.avatarContainer}>
            <BodyAvatar3D
              measurements={bodyMeasurements}
              clothingColor={selectedClothingItem.color}
              clothingType={selectedClothingItem.type as 'shirt' | 'pants' | 'jacket'}
              viewAngle={selectedView === 'F' ? 0 : selectedView === 'L' ? 90 : selectedView === 'B' ? 180 : 270}
            />
          </View>

          <View style={styles.gridLines}>
            {[...Array(8)].map((_, i) => (
              <View key={i} style={[styles.gridLine, { backgroundColor: colors.border }]} />
            ))}
          </View>

          <View style={styles.viewControls}>
            {viewAngles.map((angle) => (
              <TouchableOpacity
                key={angle}
                style={[styles.viewButton, { borderColor: colors.border }, selectedView === angle && styles.viewButtonActive]}
                onPress={() => setSelectedView(angle)}
              >
                <Text style={[styles.viewButtonText, { color: colors.textSecondary }, selectedView === angle && styles.viewButtonTextActive]}>
                  {angle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.measurementsRow}>
          <View style={[styles.measurementCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.measurementLabel, { color: colors.textSecondary }]}>Ch</Text>
            <Text style={[styles.measurementValue, { color: colors.text }]}>{bodyMeasurements.chest.toFixed(1)}cm</Text>
          </View>
          <View style={[styles.measurementCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.measurementLabel, { color: colors.textSecondary }]}>Wa</Text>
            <Text style={[styles.measurementValue, { color: colors.text }]}>{bodyMeasurements.waist.toFixed(1)}cm</Text>
          </View>
          <View style={[styles.measurementCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.measurementLabel, { color: colors.textSecondary }]}>Hi</Text>
            <Text style={[styles.measurementValue, { color: colors.text }]}>{bodyMeasurements.hips.toFixed(1)}cm</Text>
          </View>
          <View style={[styles.sizeCard, { backgroundColor: Colors.primary }]}>
            <Text style={styles.sizeLabel}>Size</Text>
            <Text style={styles.sizeValue}>{sizeRecommendation}</Text>
          </View>
        </View>

        <View style={styles.fitContainer}>
          {fitTypes.map((fit) => (
            <TouchableOpacity
              key={fit}
              style={[styles.fitButton, { borderColor: colors.border, backgroundColor: colors.card }, selectedFit === fit && { borderColor: colors.text, borderWidth: 1.5 }]}
              onPress={() => setSelectedFit(fit)}
            >
              <Text style={[styles.fitText, { color: colors.textSecondary }, selectedFit === fit && { color: colors.text, fontWeight: FontWeight.semibold }]}>
                {fit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.tryOnLabel, { color: colors.textSecondary }]}>TRY ON</Text>

        <View style={styles.clothingList}>
          {CLOTHING_CATALOG.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.clothingCard,
                { backgroundColor: colors.card },
                selectedClothing === index && styles.clothingCardActive,
              ]}
              onPress={() => setSelectedClothing(index)}
            >
              <View style={[styles.clothingColorDot, { backgroundColor: item.color }]} />
              <Text style={styles.clothingIcon}>{item.icon}</Text>
              <View style={styles.clothingInfo}>
                <Text style={[styles.clothingName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.clothingBrand, { color: colors.textSecondary }]}>{item.brand}</Text>
              </View>
              <View style={[styles.sizeBadge, { backgroundColor: Colors.primary + '20' }]}>
                <Text style={[styles.sizeBadgeText, { color: Colors.primary }]}>{sizeRecommendation}</Text>
              </View>
              {selectedClothing === index && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                </View>
              )}
            </TouchableOpacity>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarContainer: {
    width: '100%',
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  gridLines: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  gridLine: {
    width: 1,
    height: 20,
  },
  viewControls: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  viewButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  viewButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  viewButtonTextActive: {
    color: Colors.white,
  },
  measurementsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  measurementCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  measurementLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginBottom: 2,
  },
  measurementValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  sizeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  sizeLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.white,
    marginBottom: 2,
  },
  sizeValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  fitContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  fitButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  fitText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  tryOnLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  clothingList: {
    gap: Spacing.md,
  },
  clothingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  clothingCardActive: {
    borderColor: Colors.primary,
  },
  clothingColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  clothingIcon: {
    fontSize: 32,
  },
  clothingInfo: {
    flex: 1,
  },
  clothingName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  clothingBrand: {
    fontSize: FontSize.sm,
  },
  sizeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  sizeBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
});
