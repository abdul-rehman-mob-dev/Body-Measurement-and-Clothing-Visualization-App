import React, { useRef, useCallback, useEffect, useState, memo } from 'react';
import { StyleSheet, PanResponder, View, ActivityIndicator, Text } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

interface BodyMeasurements {
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  inseam: number;
  neck: number;
}

interface BodyAvatar3DProps {
  measurements: BodyMeasurements;
  clothingColor?: string;
  clothingType?: 'shirt' | 'pants' | 'jacket';
  viewAngle?: number;
}

class GLErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.log('GL Error caught:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function BodyAvatar3DInner({
  measurements,
  clothingColor = '#3B6EF6',
  clothingType = 'shirt',
  viewAngle = 0,
}: BodyAvatar3DProps) {
  const bodyGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameIdRef = useRef<number>(0);
  const angleRef = useRef(viewAngle);
  const [isReady, setIsReady] = useState(false);

  const measurementsRef = useRef(measurements);
  const clothingColorRef = useRef(clothingColor);
  const viewAngleRef = useRef(viewAngle);

  useEffect(() => {
    measurementsRef.current = measurements;
    clothingColorRef.current = clothingColor;
    viewAngleRef.current = viewAngle;
  }, [measurements, clothingColor, viewAngle]);

  useEffect(() => {
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = 0;
      }

      bodyGroupRef.current?.traverse((child) => {
        if ((child as THREE.Mesh).geometry) {
          (child as THREE.Mesh).geometry.dispose();
        }
        if ((child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.Material;
          mat.dispose();
        }
      });

      sceneRef.current?.traverse((child) => {
        if ((child as THREE.Light)) {
          // lights don't need dispose
        }
      });

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }

      bodyGroupRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      setIsReady(false);
    };
  }, []);

  const onContextCreate = useCallback((gl: ExpoWebGLRenderingContext) => {
    const renderer = new Renderer({ gl });
    rendererRef.current = renderer;
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 1.2, 3.5);
    camera.lookAt(0, 1, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(3, 5, 3);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const bodyGroup = new THREE.Group();
    bodyGroupRef.current = bodyGroup;

    const m = measurementsRef.current;
    const cc = clothingColorRef.current;
    const va = viewAngleRef.current;

    const skinMat = new THREE.MeshToonMaterial({ color: 0xF5CBA7 });
    const clothColorHex = parseInt(cc.replace('#', ''), 16);
    const clothMat = new THREE.MeshToonMaterial({ color: clothColorHex });
    const pantsMat = new THREE.MeshToonMaterial({ color: 0x2C3E50 });
    const shoeMat = new THREE.MeshToonMaterial({ color: 0x1a1a1a });

    const chestR = m.chest / (2 * Math.PI * 10);
    const waistR = m.waist / (2 * Math.PI * 10);
    const hipR = m.hips / (2 * Math.PI * 10);

    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.63;
    bodyGroup.add(head);

    const neckGeo = new THREE.CylinderGeometry(0.06, 0.065, 0.1, 8);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.52;
    bodyGroup.add(neck);

    const torsoGeo = new THREE.CylinderGeometry(waistR, chestR, 0.5, 16);
    const torso = new THREE.Mesh(torsoGeo, clothMat);
    torso.position.y = 1.22;
    bodyGroup.add(torso);

    const hipGeo = new THREE.CylinderGeometry(hipR * 0.9, hipR, 0.2, 16);
    const hipsMesh = new THREE.Mesh(hipGeo, pantsMat);
    hipsMesh.position.y = 0.92;
    bodyGroup.add(hipsMesh);

    const upperArmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.28, 8);

    const leftUpperArm = new THREE.Mesh(upperArmGeo, clothMat);
    leftUpperArm.position.set(-(chestR + 0.05), 1.28, 0);
    leftUpperArm.rotation.z = 0.3;
    bodyGroup.add(leftUpperArm);

    const rightUpperArm = new THREE.Mesh(upperArmGeo, clothMat);
    rightUpperArm.position.set(chestR + 0.05, 1.28, 0);
    rightUpperArm.rotation.z = -0.3;
    bodyGroup.add(rightUpperArm);

    const forearmGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.25, 8);

    const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
    leftForearm.position.set(-(chestR + 0.12), 0.98, 0);
    leftForearm.rotation.z = 0.2;
    bodyGroup.add(leftForearm);

    const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
    rightForearm.position.set(chestR + 0.12, 0.98, 0);
    rightForearm.rotation.z = -0.2;
    bodyGroup.add(rightForearm);

    const thighGeo = new THREE.CylinderGeometry(hipR * 0.55, hipR * 0.45, 0.35, 8);

    const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
    leftThigh.position.set(-0.1, 0.62, 0);
    bodyGroup.add(leftThigh);

    const rightThigh = new THREE.Mesh(thighGeo, pantsMat);
    rightThigh.position.set(0.1, 0.62, 0);
    bodyGroup.add(rightThigh);

    const shinGeo = new THREE.CylinderGeometry(hipR * 0.38, hipR * 0.3, 0.33, 8);

    const leftShin = new THREE.Mesh(shinGeo, pantsMat);
    leftShin.position.set(-0.1, 0.25, 0);
    bodyGroup.add(leftShin);

    const rightShin = new THREE.Mesh(shinGeo, pantsMat);
    rightShin.position.set(0.1, 0.25, 0);
    bodyGroup.add(rightShin);

    const footGeo = new THREE.BoxGeometry(0.08, 0.05, 0.18);

    const leftFoot = new THREE.Mesh(footGeo, shoeMat);
    leftFoot.position.set(-0.1, 0.06, 0.04);
    bodyGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, shoeMat);
    rightFoot.position.set(0.1, 0.06, 0.04);
    bodyGroup.add(rightFoot);

    bodyGroup.rotation.y = (va * Math.PI) / 180;
    scene.add(bodyGroup);

    let time = 0;
    let frameCount = 0;
    const animate = () => {
      const id = requestAnimationFrame(animate);
      frameIdRef.current = id;
      time += 0.02;
      torso.scale.y = 1 + Math.sin(time) * 0.008;
      torso.scale.x = 1 + Math.sin(time) * 0.004;
      renderer.render(scene, camera);
      (gl as unknown as { endFrameEXP: () => void }).endFrameEXP();
      if (frameCount === 0) setIsReady(true);
      frameCount++;
    };
    animate();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (bodyGroupRef.current) {
          bodyGroupRef.current.rotation.y += gestureState.dx * 0.01;
          angleRef.current = (bodyGroupRef.current.rotation.y * 180) / Math.PI;
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <GLErrorBoundary
        fallback={
          <View style={styles.container}>
            <ActivityIndicator size="large" color="#3B6EF6" />
            <Text style={{ color: '#999', marginTop: 10 }}>3D Avatar loading...</Text>
          </View>
        }
      >
        <GLView style={styles.glView} onContextCreate={onContextCreate} />
      </GLErrorBoundary>
      {!isReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B6EF6" />
        </View>
      )}
    </View>
  );
}

export const BodyAvatar3D = memo(BodyAvatar3DInner);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
  },
  glView: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
});
