import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, {
  Ellipse, Path, Rect, Circle, G, Line, Defs, LinearGradient, Stop, Text as SvgText,
} from 'react-native-svg';
import { Colors } from '../constants/theme';

interface Avatar3DProps {
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  height: number;
  viewAngle: 'L' | 'F' | 'R' | 'B';
  clothingColor?: string;
}

export default function Avatar3D({
  chest,
  waist,
  hips,
  shoulder,
  height,
  viewAngle,
  clothingColor = '#3B6EF6',
}: Avatar3DProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let angle = 0;
    switch (viewAngle) {
      case 'F': angle = 0; break;
      case 'R': angle = 1; break;
      case 'B': angle = 2; break;
      case 'L': angle = -1; break;
    }
    Animated.spring(rotateAnim, {
      toValue: angle,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [viewAngle, rotateAnim]);

  const s = shoulder / 46;
  const c = chest / 94;
  const w = waist / 78;
  const h = hips / 97;
  const tH = height / 175;

  const W = 240;
  const H = 420;
  const cx = W / 2;

  const headTop = 25;
  const headH = 28;
  const headW = 20;
  const neckTop = headTop + headH + 4;
  const neckH = 16;
  const neckW = 7;
  const shoulderY = neckTop + neckH;
  const torsoH = 90 * tH;
  const chestY = shoulderY + torsoH * 0.35;
  const waistLineY = shoulderY + torsoH * 0.7;
  const hipLineY = shoulderY + torsoH;
  const legTop = hipLineY;
  const legH = 105 * tH;
  const kneeY = legTop + legH * 0.5;
  const ankleY = legTop + legH;
  const footY = ankleY + 10;

  const shoulderHW = 42 * s;
  const chestHW = 38 * c;
  const waistHW = 28 * w;
  const hipHW = 36 * h;
  const armW = 11;

  const skinBase = '#E8B89D';
  const skinShadow = '#D4A088';
  const skinHighlight = '#F5CDB8';
  const hairColor = '#1C1008';
  const clothingDark = adjustColor(clothingColor, -25);
  const clothingLight = adjustColor(clothingColor, 20);

  const isSide = viewAngle === 'L' || viewAngle === 'R';
  const isBack = viewAngle === 'B';
  const isLeft = viewAngle === 'L';

  const getBodyPath = () => {
    if (isSide) {
      const depth = 16;
      const armOffX = isLeft ? -armW : armW;
      const bodyOffX = isLeft ? -4 : 4;

      return {
        body: `
          M ${cx + bodyOffX} ${neckTop}
          Q ${cx + bodyOffX - neckW} ${neckTop + 4} ${cx + bodyOffX - neckW} ${neckTop + neckH}
          L ${cx + bodyOffX - depth} ${shoulderY}
          Q ${cx + bodyOffX - depth - 3} ${chestY} ${cx + bodyOffX - depth + 2} ${waistLineY}
          Q ${cx + bodyOffX - depth + 6} ${hipLineY} ${cx + bodyOffX - depth + 2} ${hipLineY + 8}
          L ${cx + bodyOffX - depth + 2} ${kneeY}
          Q ${cx + bodyOffX - depth} ${ankleY} ${cx + bodyOffX - depth - 2} ${ankleY}
          L ${cx + bodyOffX - depth - 6} ${ankleY}
          Q ${cx + bodyOffX - depth - 4} ${kneeY} ${cx + bodyOffX - depth - 4} ${hipLineY + 8}
          L ${cx + bodyOffX - depth - 6} ${hipLineY}
          Q ${cx + bodyOffX - depth - 8} ${waistLineY} ${cx + bodyOffX - depth - 6} ${chestY}
          Q ${cx + bodyOffX - depth - 4} ${shoulderY + 5} ${cx + bodyOffX - depth - 2} ${shoulderY}
          L ${cx + bodyOffX + neckW} ${shoulderY}
          Q ${cx + bodyOffX + neckW} ${neckTop + 4} ${cx + bodyOffX} ${neckTop}
          Z
        `,
        arm: `
          M ${cx + bodyOffX - depth - 2} ${shoulderY + 2}
          Q ${cx + armOffX - 14} ${shoulderY + 8} ${cx + armOffX - 12} ${shoulderY + 40 * tH}
          L ${cx + armOffX - 10} ${waistLineY + 15 * tH}
          L ${cx + armOffX - 18} ${waistLineY + 15 * tH}
          L ${cx + armOffX - 16} ${shoulderY + 40 * tH}
          Q ${cx + armOffX - 18} ${shoulderY + 8} ${cx + bodyOffX - depth - 8} ${shoulderY + 2}
          Z
        `,
      };
    }

    return {
      body: `
        M ${cx} ${neckTop}
        Q ${cx - neckW} ${neckTop + 2} ${cx - neckW} ${neckTop + neckH}
        L ${cx - shoulderHW} ${shoulderY}
        Q ${cx - shoulderHW - 2} ${shoulderY + 10} ${cx - chestHW} ${chestY}
        L ${cx - waistHW} ${waistLineY}
        Q ${cx - waistHW - 4} ${(waistLineY + hipLineY) / 2} ${cx - hipHW} ${hipLineY}
        L ${cx - hipHW + 2} ${hipLineY + 10}
        L ${cx - 14} ${ankleY}
        L ${cx - 5} ${ankleY}
        L ${cx - 10} ${hipLineY + 10}
        L ${cx - 12} ${hipLineY}
        L ${cx + 12} ${hipLineY}
        L ${cx + 10} ${hipLineY + 10}
        L ${cx + 5} ${ankleY}
        L ${cx + 14} ${ankleY}
        L ${cx + hipHW - 2} ${hipLineY + 10}
        L ${cx + hipHW} ${hipLineY}
        Q ${cx + waistHW + 4} ${(waistLineY + hipLineY) / 2} ${cx + waistHW} ${waistLineY}
        L ${cx + chestHW} ${chestY}
        Q ${cx + shoulderHW + 2} ${shoulderY + 10} ${cx + shoulderHW} ${shoulderY}
        L ${cx + neckW} ${neckTop + neckH}
        Q ${cx + neckW} ${neckTop + 2} ${cx} ${neckTop}
        Z
      `,
      leftArm: `
        M ${cx - shoulderHW + 2} ${shoulderY + 2}
        Q ${cx - shoulderHW - 15} ${shoulderY + 15} ${cx - shoulderHW - 12} ${shoulderY + 50 * tH}
        L ${cx - shoulderHW - 8} ${waistLineY + 10 * tH}
        L ${cx - shoulderHW - 22} ${waistLineY + 10 * tH}
        L ${cx - shoulderHW - 20} ${shoulderY + 50 * tH}
        Q ${cx - shoulderHW - 22} ${shoulderY + 15} ${cx - shoulderHW - 8} ${shoulderY + 2}
        Z
      `,
      rightArm: `
        M ${cx + shoulderHW - 2} ${shoulderY + 2}
        Q ${cx + shoulderHW + 15} ${shoulderY + 15} ${cx + shoulderHW + 12} ${shoulderY + 50 * tH}
        L ${cx + shoulderHW + 8} ${waistLineY + 10 * tH}
        L ${cx + shoulderHW + 22} ${waistLineY + 10 * tH}
        L ${cx + shoulderHW + 20} ${shoulderY + 50 * tH}
        Q ${cx + shoulderHW + 22} ${shoulderY + 15} ${cx + shoulderHW + 8} ${shoulderY + 2}
        Z
      `,
    };
  };

  const getHeadPath = () => {
    if (isSide) {
      const off = isLeft ? -3 : 3;
      return {
        head: `
          M ${cx + off} ${headTop + headH}
          Q ${cx + off - headW + 2} ${headTop + headH} ${cx + off - headW + 4} ${headTop + headH * 0.5}
          Q ${cx + off - headW + 6} ${headTop - 2} ${cx + off} ${headTop - 4}
          Q ${cx + off + headW - 6} ${headTop - 2} ${cx + off + headW - 4} ${headTop + headH * 0.3}
          Q ${cx + off + headW - 2} ${headTop + headH * 0.7} ${cx + off} ${headTop + headH}
          Z
        `,
        hair: `
          M ${cx + off} ${headTop - 2}
          Q ${cx + off - headW} ${headTop - 6} ${cx + off - headW + 3} ${headTop + headH * 0.2}
          Q ${cx + off - headW + 4} ${headTop - 4} ${cx + off} ${headTop - 6}
          Q ${cx + off + headW - 4} ${headTop - 6} ${cx + off + headW - 3} ${headTop + headH * 0.1}
          Q ${cx + off + headW} ${headTop - 6} ${cx + off} ${headTop - 2}
          Z
        `,
      };
    }
    return {
      head: `
        M ${cx} ${headTop + headH}
        Q ${cx - headW} ${headTop + headH} ${cx - headW} ${headTop + headH * 0.5}
        Q ${cx - headW} ${headTop - 2} ${cx} ${headTop - 4}
        Q ${cx + headW} ${headTop - 2} ${cx + headW} ${headTop + headH * 0.5}
        Q ${cx + headW} ${headTop + headH} ${cx} ${headTop + headH}
        Z
      `,
      hair: `
        M ${cx} ${headTop - 3}
        Q ${cx - headW - 2} ${headTop - 4} ${cx - headW + 1} ${headTop + headH * 0.25}
        Q ${cx - headW + 2} ${headTop - 3} ${cx} ${headTop - 5}
        Q ${cx + headW - 2} ${headTop - 3} ${cx + headW - 1} ${headTop + headH * 0.25}
        Q ${cx + headW + 2} ${headTop - 4} ${cx} ${headTop - 3}
        Z
      `,
    };
  };

  const getTorsoClothingPath = () => {
    if (isSide) {
      const body = getBodyPath();
      return body.body;
    }
    return `
      M ${cx - neckW + 1} ${shoulderY - 4}
      L ${cx + neckW - 1} ${shoulderY - 4}
      L ${cx + shoulderHW - 1} ${shoulderY + 2}
      L ${cx + chestHW + 1} ${chestY}
      L ${cx + waistHW + 2} ${waistLineY}
      Q ${cx + waistHW + 5} ${(waistLineY + hipLineY) / 2} ${cx + hipHW + 1} ${hipLineY}
      L ${cx + hipHW - 1} ${hipLineY + 8}
      L ${cx - hipHW + 1} ${hipLineY + 8}
      L ${cx - hipHW - 1} ${hipLineY}
      Q ${cx - waistHW - 5} ${(waistLineY + hipLineY) / 2} ${cx - waistHW - 2} ${waistLineY}
      L ${cx - chestHW - 1} ${chestY}
      L ${cx - shoulderHW + 1} ${shoulderY + 2}
      L ${cx - neckW - 1} ${shoulderY - 4}
      Z
    `;
  };

  const headPaths = getHeadPath();
  const bodyPaths = getBodyPath();

  return (
    <View style={styles.container}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={skinHighlight} />
            <Stop offset="0.5" stopColor={skinBase} />
            <Stop offset="1" stopColor={skinShadow} />
          </LinearGradient>
          <LinearGradient id="clothGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={clothingLight} />
            <Stop offset="1" stopColor={clothingDark} />
          </LinearGradient>
          <LinearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2C1810" />
            <Stop offset="1" stopColor={hairColor} />
          </LinearGradient>
        </Defs>

        {/* Shadow on floor */}
        <Ellipse cx={cx} cy={footY + 5} rx={40} ry={7} fill="rgba(0,0,0,0.12)" />

        {/* Legs */}
        {!isSide && (
          <>
            <Path
              d={`
                M ${cx - 13} ${hipLineY + 8}
                Q ${cx - 14} ${kneeY} ${cx - 12} ${ankleY}
                L ${cx - 4} ${ankleY}
                Q ${cx - 6} ${kneeY} ${cx - 5} ${hipLineY + 8}
                Z
              `}
              fill="url(#skinGrad)"
            />
            <Path
              d={`
                M ${cx + 5} ${hipLineY + 8}
                Q ${cx + 6} ${kneeY} ${cx + 4} ${ankleY}
                L ${cx + 12} ${ankleY}
                Q ${cx + 14} ${kneeY} ${cx + 13} ${hipLineY + 8}
                Z
              `}
              fill="url(#skinGrad)"
            />
            {/* Shorts / lower clothing */}
            <Path
              d={`
                M ${cx - hipHW + 2} ${hipLineY - 5}
                L ${cx + hipHW - 2} ${hipLineY - 5}
                L ${cx + hipHW - 1} ${hipLineY + 20}
                L ${cx + 2} ${hipLineY + 18}
                L ${cx - 2} ${hipLineY + 18}
                L ${cx - hipHW + 1} ${hipLineY + 20}
                Z
              `}
              fill="url(#clothGrad)"
              opacity={0.85}
            />
          </>
        )}

        {/* Arms */}
        {!isSide && bodyPaths.leftArm && (
          <Path d={bodyPaths.leftArm} fill="url(#skinGrad)" />
        )}
        {!isSide && bodyPaths.rightArm && (
          <Path d={bodyPaths.rightArm} fill="url(#skinGrad)" />
        )}
        {isSide && bodyPaths.arm && (
          <Path d={bodyPaths.arm} fill="url(#skinGrad)" />
        )}

        {/* Torso / Clothing */}
        <Path d={getTorsoClothingPath()} fill="url(#clothGrad)" />

        {/* Body outline */}
        <Path
          d={bodyPaths.body}
          fill="url(#skinGrad)"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={0.8}
        />

        {/* Collar / neckline */}
        {!isSide && (
          <Path
            d={`
              M ${cx - neckW - 4} ${shoulderY - 6}
              Q ${cx} ${shoulderY + 18} ${cx + neckW + 4} ${shoulderY - 6}
            `}
            fill="none"
            stroke={clothingDark}
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}

        {/* Neck */}
        <Rect
          x={cx - neckW}
          y={neckTop + 2}
          width={neckW * 2}
          height={neckH - 2}
          rx={4}
          fill="url(#skinGrad)"
        />

        {/* Head */}
        <Path d={headPaths.head} fill="url(#skinGrad)" />

        {/* Hair */}
        <Path d={headPaths.hair} fill="url(#hairGrad)" />

        {/* Ears (front only) */}
        {!isSide && !isBack && (
          <>
            <Ellipse cx={cx - headW + 1} cy={headTop + headH * 0.45} rx={3.5} ry={5} fill={skinShadow} />
            <Ellipse cx={cx + headW - 1} cy={headTop + headH * 0.45} rx={3.5} ry={5} fill={skinShadow} />
          </>
        )}

        {/* Face - Front */}
        {!isSide && !isBack && (
          <>
            {/* Eyes */}
            <Ellipse cx={cx - 7} cy={headTop + headH * 0.38} rx={4} ry={3.5} fill="white" />
            <Ellipse cx={cx + 7} cy={headTop + headH * 0.38} rx={4} ry={3.5} fill="white" />
            <Circle cx={cx - 6.5} cy={headTop + headH * 0.38} r={2} fill="#2C1810" />
            <Circle cx={cx + 6.5} cy={headTop + headH * 0.38} r={2} fill="#2C1810" />
            <Circle cx={cx - 6} cy={headTop + headH * 0.36} r={0.8} fill="white" />
            <Circle cx={cx + 7} cy={headTop + headH * 0.36} r={0.8} fill="white" />

            {/* Eyebrows */}
            <Path
              d={`M ${cx - 11} ${headTop + headH * 0.28} Q ${cx - 7} ${headTop + headH * 0.24} ${cx - 3} ${headTop + headH * 0.28}`}
              fill="none" stroke={hairColor} strokeWidth={1.5} strokeLinecap="round"
            />
            <Path
              d={`M ${cx + 3} ${headTop + headH * 0.28} Q ${cx + 7} ${headTop + headH * 0.24} ${cx + 11} ${headTop + headH * 0.28}`}
              fill="none" stroke={hairColor} strokeWidth={1.5} strokeLinecap="round"
            />

            {/* Nose */}
            <Path
              d={`M ${cx} ${headTop + headH * 0.4} L ${cx - 2} ${headTop + headH * 0.52} Q ${cx} ${headTop + headH * 0.55} ${cx + 2} ${headTop + headH * 0.52} Z`}
              fill={skinShadow} opacity={0.5}
            />

            {/* Mouth */}
            <Path
              d={`M ${cx - 5} ${headTop + headH * 0.63} Q ${cx} ${headTop + headH * 0.68} ${cx + 5} ${headTop + headH * 0.63}`}
              fill="none" stroke="#C4877A" strokeWidth={1.5} strokeLinecap="round"
            />
          </>
        )}

        {/* Face - Side */}
        {isSide && (
          <>
          <Ellipse
            cx={cx + (isLeft ? -8 : 8)}
            cy={headTop + headH * 0.38}
            rx={3.5} ry={3}
            fill="white"
          />
          <Circle
            cx={cx + (isLeft ? -7.5 : 7.5)}
            cy={headTop + headH * 0.38}
            r={1.8}
            fill="#2C1810"
          />
          <Path
            d={`M ${cx + (isLeft ? -5 : 5)} ${headTop + headH * 0.62} Q ${cx + (isLeft ? -3 : 3)} ${headTop + headH * 0.66} ${cx + (isLeft ? -1 : 1)} ${headTop + headH * 0.62}`}
            fill="none" stroke="#C4877A" strokeWidth={1.2} strokeLinecap="round"
          />
          </>
        )}

        {/* Measurement indicators */}
        <Line
          x1={8} y1={shoulderY}
          x2={cx - shoulderHW - 20} y2={shoulderY}
          stroke={Colors.success} strokeWidth={1.5} strokeDasharray="6,4" opacity={0.7}
        />
        <Rect x={2} y={shoulderY - 9} width={52} height={18} rx={4} fill="rgba(0,0,0,0.65)" />
        <Line x1={28} y1={9} x2={28} y2={9} stroke="none" />
        <G>
          <SvgText x={28} y={shoulderY + 4} fill="white" fontSize={9} textAnchor="middle" fontWeight="bold">
            {`${Math.round(shoulder)}cm`}
          </SvgText>
        </G>

        <Line
          x1={8} y1={waistLineY}
          x2={cx - waistHW - 20} y2={waistLineY}
          stroke={Colors.success} strokeWidth={1.5} strokeDasharray="6,4" opacity={0.7}
        />
        <Rect x={4} y={waistLineY - 9} width={46} height={18} rx={4} fill="rgba(0,0,0,0.65)" />
        <G>
          <SvgText x={27} y={waistLineY + 4} fill="white" fontSize={9} textAnchor="middle" fontWeight="bold">
            {`${Math.round(waist)}cm`}
          </SvgText>
        </G>

        <Line
          x1={8} y1={hipLineY}
          x2={cx - hipHW - 20} y2={hipLineY}
          stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="6,4" opacity={0.7}
        />
        <Rect x={6} y={hipLineY - 9} width={42} height={18} rx={4} fill="rgba(0,0,0,0.65)" />
        <G>
          <SvgText x={27} y={hipLineY + 4} fill="white" fontSize={9} textAnchor="middle" fontWeight="bold">
            {`${Math.round(hips)}cm`}
          </SvgText>
        </G>

        <Line
          x1={cx + chestHW + 20} y1={chestY}
          x2={W - 8} y2={chestY}
          stroke={Colors.primary} strokeWidth={1.5} strokeDasharray="6,4" opacity={0.7}
        />
        <Rect x={W - 56} y={chestY - 9} width={48} height={18} rx={4} fill="rgba(59,110,246,0.85)" />
        <G>
          <SvgText x={W - 32} y={chestY + 4} fill="white" fontSize={9} textAnchor="middle" fontWeight="bold">
            {`${Math.round(chest)}cm`}
          </SvgText>
        </G>

        {/* Height indicator */}
        <Line
          x1={W - 14} y1={headTop - 5}
          x2={W - 14} y2={ankleY}
          stroke="rgba(255,255,255,0.3)" strokeWidth={1}
        />
        <Line x1={W - 18} y1={headTop - 5} x2={W - 10} y2={headTop - 5} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
        <Line x1={W - 18} y1={ankleY} x2={W - 10} y2={ankleY} stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
      </Svg>
    </View>
  );
}

function adjustColor(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(c.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(c.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(c.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
