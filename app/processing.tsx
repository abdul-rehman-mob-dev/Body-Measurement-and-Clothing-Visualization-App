import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as KeepAwake from 'expo-keep-awake';
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { processPhotos } from '../services/mockApi';

export default function ProcessingScreen() {
  const router = useRouter();
  const { capturedPhotos, measurements, setMeasurements, setSelectedSize, setCaptureStep, clearCapturedPhotos, addScan, saveScanPhotos } = useAppStore();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Starting...');
  const [isDone, setIsDone] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const processingRef = useRef(false);

  const startProcessing = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const state = useAppStore.getState();
      const userHeight = state.measurements.height || 175;
      const userWeight = state.measurements.weight || 70;
      const photos = state.capturedPhotos;
      const frontPhotoUri = photos[0];

      if (!frontPhotoUri) {
        setCurrentStep('No photo captured');
        setTimeout(() => router.replace('/capture'), 2000);
        return;
      }

      const result = await processPhotos(photos, (step, prog) => {
        setCurrentStep(step);
        setProgress(prog);
      }, userHeight, userWeight);

      if (!result.success) {
        setCurrentStep('Could not detect body pose. Please try again.');
        setTimeout(() => router.replace('/capture'), 2000);
        return;
      }

      setMeasurements({
        chest: result.measurements.chest,
        waist: result.measurements.waist,
        hips: result.measurements.hips,
        shoulder: result.measurements.shoulder,
        inseam: result.measurements.inseam,
        neck: result.measurements.neck,
      });

      const size = result.size;
      setSelectedSize(size);

      addScan({
        chest: result.measurements.chest,
        waist: result.measurements.waist,
        hips: result.measurements.hips,
        shoulder: result.measurements.shoulder,
        inseam: result.measurements.inseam,
        neck: result.measurements.neck,
        arms: result.measurements.arms,
        size,
        confidence: result.confidence,
        qualityScore: result.qualityScore,
      });

      setCurrentStep('Building your profile...');
      setProgress(100);

      setIsDone(true);

      setTimeout(() => {
        const front = photos[0] || '';
        const side = photos[1] || photos[0] || '';
        saveScanPhotos(front, side);
        clearCapturedPhotos();
        setCaptureStep(0);
        router.replace('/(tabs)/avatar');
      }, 1500);
    } catch (error) {
      console.error('Processing error:', error);
      setCurrentStep('Error occurred. Please try again.');
      setTimeout(() => router.replace('/capture'), 2000);
    }
  }, [setMeasurements, setSelectedSize, setCaptureStep, clearCapturedPhotos, addScan, saveScanPhotos, router]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    KeepAwake.activateKeepAwakeAsync().catch(() => {});

    pulse.start();
    rotate.start();
    startProcessing();

    return () => {
      pulse.stop();
      rotate.stop();
      KeepAwake.deactivateKeepAwake().catch(() => {});
    };
  }, [startProcessing, pulseAnim, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.avatarContainer,
            { transform: [{ scale: pulseAnim }, { rotate: rotation }] },
          ]}
        >
          <View style={styles.avatarCircle}>
            <View style={styles.avatarBody}>
              <View style={styles.head} />
              <View style={styles.body} />
              <View style={styles.legs}>
                <View style={styles.leg} />
                <View style={styles.leg} />
              </View>
            </View>
            <View style={styles.scanLine} />
          </View>
        </Animated.View>

        <Text style={styles.title}>
          {isDone ? ' Measurements Ready!' : 'Processing photos...'}
        </Text>

        <Text style={styles.photoCount}>
          {capturedPhotos.length} photo{capturedPhotos.length !== 1 ? 's' : ''} captured
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>{currentStep}</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
        </View>

        {isDone && (
          <View style={styles.doneContainer}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <Text style={styles.doneText}>Measurements calculated successfully!</Text>
            <View style={styles.qualityBadge}>
              <View style={[
                styles.qualityDot,
                { backgroundColor: progress >= 90 ? Colors.success : progress >= 75 ? '#F59E0B' : '#EF4444' }
              ]} />
              <Text style={styles.qualityText}>
                {progress >= 90 ? 'Excellent' : progress >= 75 ? 'Good' : 'Fair'} quality scan
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  avatarContainer: {
    marginBottom: Spacing.xxxxl,
  },
  avatarCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(59, 110, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  avatarBody: {
    alignItems: 'center',
  },
  head: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    marginBottom: 4,
  },
  body: {
    width: 60,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginBottom: 4,
  },
  legs: {
    flexDirection: 'row',
    gap: 8,
  },
  leg: {
    width: 20,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: Colors.primary,
    top: '50%',
    opacity: 0.5,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textWhite,
    marginBottom: Spacing.md,
  },
  photoCount: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xxl,
  },
  progressContainer: {
    width: '100%',
    marginBottom: Spacing.xxxl,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
  progressPercent: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
  doneContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkmark: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 30,
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  doneText: {
    fontSize: FontSize.md,
    color: Colors.success,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  qualityText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
});
