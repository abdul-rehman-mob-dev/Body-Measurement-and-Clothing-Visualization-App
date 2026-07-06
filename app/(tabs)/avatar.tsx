import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAppStore } from '../../store/useAppStore';

const clothingItems = [
  { name: 'Classic Tee', brand: 'Uniqlo', size: 'M', icon: '👕' },
  { name: 'Oxford Shirt', brand: 'Ralph Lauren', size: 'M', icon: '👔' },
  { name: 'Slim Jacket', brand: 'Zara', size: 'M', icon: '🧥' },
];

type ViewAngle = 'L' | 'F' | 'R' | 'B';
type FitType = 'Slim' | 'Regular' | 'Relaxed';

export default function AvatarScreen() {
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
            {selectedView === 'F' && (
              <View style={styles.avatarBody}>
                <View style={styles.head} />
                <View style={styles.torso} />
                <View style={styles.armsContainer}>
                  <View style={styles.arm} />
                  <View style={styles.arm} />
                </View>
                <View style={styles.legsContainer}>
                  <View style={styles.leg} />
                  <View style={styles.leg} />
                </View>
              </View>
            )}

            {selectedView === 'B' && (
              <View style={styles.avatarBody}>
                <View style={styles.head} />
                <View style={[styles.torso, { backgroundColor: '#2B5AD4' }]} />
                <View style={styles.armsContainer}>
                  <View style={[styles.arm, { backgroundColor: '#D97706' }]} />
                  <View style={[styles.arm, { backgroundColor: '#D97706' }]} />
                </View>
                <View style={styles.legsContainer}>
                  <View style={styles.leg} />
                  <View style={styles.leg} />
                </View>
              </View>
            )}

            {selectedView === 'L' && (
              <View style={styles.avatarBody}>
                <View style={styles.head} />
                <View style={[styles.torso, { width: 50, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]} />
                <View style={[styles.armsContainer, { gap: 0, marginTop: -50, marginLeft: -20 }]}>
                  <View style={[styles.arm, { width: 18 }]} />
                </View>
                <View style={styles.legsContainer}>
                  <View style={[styles.leg, { width: 28 }]} />
                </View>
              </View>
            )}

            {selectedView === 'R' && (
              <View style={styles.avatarBody}>
                <View style={styles.head} />
                <View style={[styles.torso, { width: 50, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]} />
                <View style={[styles.armsContainer, { gap: 0, marginTop: -50, marginRight: -20 }]}>
                  <View style={[styles.arm, { width: 18 }]} />
                </View>
                <View style={styles.legsContainer}>
                  <View style={[styles.leg, { width: 28 }]} />
                </View>
              </View>
            )}

            <View style={styles.measurementsOverlay}>
              <View style={styles.measurementTag}>
                <Text style={styles.measurementTagText}>Ch</Text>
                <Text style={styles.measurementTagValue}>{measurements.chest}cm</Text>
              </View>
              <View style={styles.measurementTag}>
                <Text style={styles.measurementTagText}>Wa</Text>
                <Text style={styles.measurementTagValue}>{measurements.waist}cm</Text>
              </View>
              <View style={styles.measurementTag}>
                <Text style={styles.measurementTagText}>Hi</Text>
                <Text style={styles.measurementTagValue}>{measurements.hips}cm</Text>
              </View>
            </View>
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
          {clothingItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.clothingCard,
                { backgroundColor: colors.card },
                selectedClothing === index && styles.clothingCardActive,
              ]}
              onPress={() => setSelectedClothing(index)}
            >
              <Text style={styles.clothingIcon}>{item.icon}</Text>
              <View style={styles.clothingInfo}>
                <Text style={[styles.clothingName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.clothingBrand, { color: colors.textSecondary }]}>{item.brand} · Size {item.size}</Text>
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
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  avatarBody: {
    alignItems: 'center',
  },
  head: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    marginBottom: 4,
  },
  torso: {
    width: 80,
    height: 70,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  armsContainer: {
    flexDirection: 'row',
    gap: 60,
    marginTop: -50,
  },
  arm: {
    width: 16,
    height: 50,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  legsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -2,
  },
  leg: {
    width: 24,
    height: 60,
    backgroundColor: Colors.dark,
    borderRadius: 4,
  },
  measurementsOverlay: {
    position: 'absolute',
    top: 20,
    right: 10,
    gap: 4,
  },
  measurementTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blueBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  measurementTagText: {
    fontSize: 10,
    color: Colors.textGray,
  },
  measurementTagValue: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
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
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
