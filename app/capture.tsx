import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';

const { width, height } = Dimensions.get('window');

const steps = [
  { label: 'Front View', instruction: 'Stand facing the camera with arms slightly out', tapLabel: 'Front profile — tap to capture' },
  { label: 'Side View', instruction: 'Turn 90° to your right and stand straight', tapLabel: 'Side profile — tap to capture' },
];

export default function CaptureScreen() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const { captureStep: step, setCaptureStep: setStep, resetCapture, addCapturedPhoto } = useAppStore();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const currentStep = steps[step];

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (photo && photo.uri) {
        addCapturedPhoto(photo.uri);

        if (step < steps.length - 1) {
          setStep(step + 1);
        } else {
          resetCapture();
          router.push('/processing');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleCamera = () => {
    setFacing(facing === 'front' ? 'back' : 'front');
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Ionicons name="camera-outline" size={64} color={Colors.textGray} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>We need camera access to scan your body measurements.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permissionCancelButton} onPress={() => router.back()}>
          <Text style={styles.permissionCancelText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={Colors.white} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.flipButton} onPress={toggleCamera}>
        <Ionicons name="camera-reverse-outline" size={24} color={Colors.white} />
      </TouchableOpacity>

      <View style={styles.viewLabel}>
        <Text style={styles.viewLabelText}>{currentStep.label}</Text>
      </View>

      <View style={styles.stepIndicator}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.stepDot, i <= step && styles.stepDotActive]} />
        ))}
      </View>

      <View style={styles.bodyOverlay}>
        <View style={styles.bodyOutline}>
          <View style={styles.shoulderMarker}>
            <View style={styles.markerLine} />
            <Text style={styles.markerLabel}>Shoulder</Text>
          </View>

          <View style={styles.waistMarker}>
            <View style={styles.markerLine} />
            <Text style={styles.markerLabel}>Waist</Text>
          </View>

          <View style={styles.hipMarker}>
            <View style={styles.markerLine} />
            <Text style={styles.markerLabel}>Hip</Text>
          </View>

          <View style={[styles.dashedOutline, styles.dashedTop]} />
          <View style={[styles.dashedOutline, styles.dashedMiddle]} />
          <View style={[styles.dashedOutline, styles.dashedBottom]} />
        </View>
      </View>

      <View style={styles.alignmentBadge}>
        <View style={styles.alignmentDot} />
        <Text style={styles.alignmentText}>Perfect alignment</Text>
      </View>

      <View style={styles.cornerMarkers}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      <Text style={styles.instruction}>{currentStep.instruction}</Text>

      <View style={styles.bottomArea}>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => step > 0 && setStep(step - 1)}
          >
            <Ionicons
              name="refresh"
              size={24}
              color={step > 0 ? Colors.textWhite : Colors.textGray}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.textGray} />
          </TouchableOpacity>
        </View>

        <Text style={styles.tapText}>
          {isCapturing ? 'Capturing...' : currentStep.tapLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxxl,
    gap: Spacing.lg,
  },
  permissionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textWhite,
  },
  permissionText: {
    fontSize: FontSize.md,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.md,
  },
  permissionButtonText: {
    color: Colors.textWhite,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  permissionCancelButton: {
    marginTop: Spacing.sm,
  },
  permissionCancelText: {
    color: Colors.textGray,
    fontSize: FontSize.md,
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
  flipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  viewLabel: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    zIndex: 10,
  },
  viewLabelText: {
    color: Colors.textWhite,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  stepIndicator: {
    position: 'absolute',
    top: 108,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  stepDotActive: {
    backgroundColor: Colors.success,
  },
  bodyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyOutline: {
    width: 180,
    height: 360,
    position: 'relative',
  },
  shoulderMarker: {
    position: 'absolute',
    top: 40,
    left: -60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  waistMarker: {
    position: 'absolute',
    top: 170,
    left: -60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  hipMarker: {
    position: 'absolute',
    top: 250,
    left: -60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  markerLine: {
    width: 30,
    height: 1.5,
    backgroundColor: Colors.success,
  },
  markerLabel: {
    color: Colors.textWhite,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dashedOutline: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: Colors.success,
    opacity: 0.6,
    borderStyle: 'dashed',
  },
  dashedTop: {
    top: 60,
  },
  dashedMiddle: {
    top: 180,
  },
  dashedBottom: {
    top: 260,
  },
  alignmentBadge: {
    position: 'absolute',
    top: '43%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  alignmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  alignmentText: {
    color: Colors.textWhite,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  cornerMarkers: {
    ...StyleSheet.absoluteFillObject,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.success,
  },
  topLeft: {
    top: '28%',
    left: '22%',
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: '28%',
    right: '22%',
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: '28%',
    left: '22%',
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: '28%',
    right: '22%',
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  instruction: {
    position: 'absolute',
    bottom: 180,
    alignSelf: 'center',
    color: Colors.textWhite,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Spacing.xxxl,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.xxxl,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
  },
  tapText: {
    textAlign: 'center',
    color: Colors.textWhite,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
  },
});
