import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const viewLabels = ['Front View', 'Side View', 'Back View'];
const viewInstructions = [
  'Make sure your full body is visible, arms slightly away from sides',
  'Ensure profile is clear, standing straight with good posture',
  'Check that back is fully visible and posture is straight',
];

export default function PhotoConfirmScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { capturedPhotos, captureStep, setCaptureStep, resetCapture } = useAppStore();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const photoUri = capturedPhotos[capturedPhotos.length - 1];

  useEffect(() => {
    if (!photoUri) {
      router.replace('/capture');
    }
  }, [photoUri, router]);

  const handleConfirm = () => {
    if (captureStep < 2) {
      setCaptureStep(captureStep + 1);
      router.replace('/capture');
    } else {
      resetCapture();
      router.replace('/processing');
    }
  };

  const handleRetake = () => {
    const photos = useAppStore.getState().capturedPhotos;
    if (photos.length > 0) {
      useAppStore.setState({ capturedPhotos: photos.slice(0, -1) });
    }
    router.replace('/capture');
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Scan',
      'Are you sure? All captured photos will be discarded.',
      [
        { text: 'Continue Scanning', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            resetCapture();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  if (!photoUri) return null;

  return (
    <View style={styles.container}>
      {!imageLoaded && !imageError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading photo...</Text>
        </View>
      )}
      {imageError ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.loadingText}>Failed to load photo</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetake}>
            <Text style={styles.retryText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Image
          source={{ uri: photoUri }}
          style={styles.photo}
          resizeMode="cover"
          onLoadStart={() => { setImageLoaded(false); setImageError(false); }}
          onLoadEnd={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}

      <View style={styles.overlay} />

      <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
        <Ionicons name="close" size={24} color={Colors.white} />
      </TouchableOpacity>

      <View style={styles.viewBadge}>
        <Text style={styles.viewBadgeText}>{viewLabels[captureStep]}</Text>
        <Text style={styles.viewBadgeStep}>{captureStep + 1} of 2</Text>
      </View>

      <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
        <View style={[styles.handle, { backgroundColor: colors.textTertiary }]} />

        <Text style={[styles.title, { color: colors.text }]}>Photo Looks Good?</Text>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>{viewInstructions[captureStep]}</Text>

        <View style={styles.qualityHints}>
          <View style={styles.hintRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>Full body visible</Text>
          </View>
          <View style={styles.hintRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>Good lighting</Text>
          </View>
          <View style={styles.hintRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>Fitted clothing</Text>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Ionicons name="refresh" size={22} color={Colors.primary} />
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmText}>
              {captureStep < 2 ? 'Next View' : 'Start Processing'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.textGray,
    fontSize: FontSize.md,
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
  },
  retryText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  photo: {
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  viewBadge: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    zIndex: 10,
  },
  viewBadgeText: {
    color: Colors.textWhite,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  viewBadgeStep: {
    color: Colors.textGray,
    fontSize: FontSize.sm,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    paddingTop: Spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textGray,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  instruction: {
    fontSize: FontSize.md,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  qualityHints: {
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  hintText: {
    fontSize: FontSize.md,
    color: Colors.textGray,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  retakeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary,
  },
  confirmText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
});
