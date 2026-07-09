import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Line, Circle, G } from 'react-native-svg';
import { PoseLandmark, BODY_LANDMARKS } from '../services/poseDetection';
import { Colors } from '../constants/theme';

interface PoseGuidanceProps {
  landmarks: PoseLandmark[] | null;
  postureAnalysis: {
    isUpright: boolean;
    symmetryScore: number;
    bodyAlignment: string;
    recommendations: string[];
  } | null;
  isActive: boolean;
}

const SKELETON_CONNECTIONS = [
  [BODY_LANDMARKS.LEFT_SHOULDER, BODY_LANDMARKS.RIGHT_SHOULDER],
  [BODY_LANDMARKS.LEFT_SHOULDER, BODY_LANDMARKS.LEFT_ELBOW],
  [BODY_LANDMARKS.LEFT_ELBOW, BODY_LANDMARKS.LEFT_WRIST],
  [BODY_LANDMARKS.RIGHT_SHOULDER, BODY_LANDMARKS.RIGHT_ELBOW],
  [BODY_LANDMARKS.RIGHT_ELBOW, BODY_LANDMARKS.RIGHT_WRIST],
  [BODY_LANDMARKS.LEFT_SHOULDER, BODY_LANDMARKS.LEFT_HIP],
  [BODY_LANDMARKS.RIGHT_SHOULDER, BODY_LANDMARKS.RIGHT_HIP],
  [BODY_LANDMARKS.LEFT_HIP, BODY_LANDMARKS.RIGHT_HIP],
  [BODY_LANDMARKS.LEFT_HIP, BODY_LANDMARKS.LEFT_KNEE],
  [BODY_LANDMARKS.LEFT_KNEE, BODY_LANDMARKS.LEFT_ANKLE],
  [BODY_LANDMARKS.RIGHT_HIP, BODY_LANDMARKS.RIGHT_KNEE],
  [BODY_LANDMARKS.RIGHT_KNEE, BODY_LANDMARKS.RIGHT_ANKLE],
];

export default function PoseGuidance({
  landmarks,
  postureAnalysis,
  isActive,
}: PoseGuidanceProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (isActive && postureAnalysis?.isUpright) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    }
    return () => {
      anim?.stop();
    };
  }, [isActive, postureAnalysis?.isUpright, pulseAnim]);

  if (!isActive || !landmarks) {
    return null;
  }

  const getConfidenceColor = (visibility: number): string => {
    if (visibility >= 0.9) return Colors.success;
    if (visibility >= 0.7) return '#F59E0B';
    return Colors.error;
  };

  const getStatusColor = (): string => {
    if (!postureAnalysis) return Colors.textGray;
    if (postureAnalysis.isUpright && postureAnalysis.symmetryScore >= 80) {
      return Colors.success;
    }
    if (postureAnalysis.symmetryScore >= 60) {
      return '#F59E0B';
    }
    return Colors.error;
  };

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <G>
          {SKELETON_CONNECTIONS.map(([startIdx, endIdx], index) => {
            const start = landmarks[startIdx];
            const end = landmarks[endIdx];
            if (!start || !end) return null;

            const avgVisibility = (start.visibility + end.visibility) / 2;
            const color = getConfidenceColor(avgVisibility);

            return (
              <Line
                key={`line-${index}`}
                x1={`${(start.x / 1080) * 100}%`}
                y1={`${(start.y / 1920) * 100}%`}
                x2={`${(end.x / 1080) * 100}%`}
                y2={`${(end.y / 1920) * 100}%`}
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}

          {landmarks.map((landmark, index) => {
            const color = getConfidenceColor(landmark.visibility);
            return (
              <Circle
                key={`point-${index}`}
                cx={`${(landmark.x / 1080) * 100}%`}
                cy={`${(landmark.y / 1920) * 100}%`}
                r="6"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </G>
      </Svg>

      <View style={[styles.statusBar, { backgroundColor: getStatusColor() + 'CC' }]}>
        <Animated.View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(), transform: [{ scale: pulseAnim }] },
          ]}
        />
        <Text style={styles.statusText}>
          {postureAnalysis?.bodyAlignment || 'Analyzing...'}
        </Text>
      </View>

      {postureAnalysis?.recommendations && postureAnalysis.recommendations.length > 0 && (
        <View style={styles.recommendationsContainer}>
          {postureAnalysis.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>• {rec}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  statusBar: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 12,
  },
  recommendationItem: {
    marginBottom: 4,
  },
  recommendationText: {
    color: 'white',
    fontSize: 13,
  },
});
