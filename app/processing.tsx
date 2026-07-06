import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { processPhotos } from '../services/mockApi';

const { width } = Dimensions.get('window');

export default function ProcessingScreen() {
  const router = useRouter();
  const { capturedPhotos, setMeasurements, setSelectedSize, clearCapturedPhotos, addScan } = useAppStore();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Starting...');
  const [isDone, setIsDone] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];
  const rotateAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.loop(
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
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    startProcessing();

    return () => {};
  }, []);

  const startProcessing = async () => {
    try {
      const result = await processPhotos(capturedPhotos, (step, prog) => {
        setCurrentStep(step);
        setProgress(prog);
      });

      if (result.success) {
        setMeasurements(result.measurements);
        setSelectedSize(result.size);
        addScan({
          chest: result.measurements.chest,
          waist: result.measurements.waist,
          hips: result.measurements.hips,
          shoulder: result.measurements.shoulder,
          inseam: result.measurements.inseam,
          neck: result.measurements.neck,
          arms: result.measurements.arms,
          size: result.size,
        });
        setIsDone(true);

        setTimeout(() => {
          clearCapturedPhotos();
          router.replace('/(tabs)');
        }, 1500);
      }
    } catch (error) {
      setCurrentStep('Error occurred');
      setTimeout(() => router.back(), 2000);
    }
  };

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
});
