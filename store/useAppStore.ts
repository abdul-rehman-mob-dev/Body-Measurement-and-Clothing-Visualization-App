import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorage } from '../services/secureStorage';

export interface Measurements {
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  inseam: number;
  neck: number;
  arms: number;
  height: number;
  weight: number;
  age: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  profileImage?: string;
}

export interface ScanEntry {
  id: string;
  date: string;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  inseam: number;
  neck: number;
  arms: number;
  size: string;
  confidence: number;
  qualityScore: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ClothingItem {
  name: string;
  brand: string;
  size: string;
  icon: string;
  selected: boolean;
}

interface AppState {
  // User Profile
  user: UserProfile;
  setUser: (user: Partial<UserProfile>) => void;

  // Measurements
  measurements: Measurements;
  setMeasurements: (m: Partial<Measurements>) => void;

  // Size
  selectedSize: string;
  setSelectedSize: (size: string) => void;

  // Capture Flow
  captureStep: number;
  setCaptureStep: (step: number) => void;
  resetCapture: () => void;
  capturedPhotos: string[];
  addCapturedPhoto: (uri: string) => void;
  clearCapturedPhotos: () => void;

  // Last Scan Photos (NOT persisted - in memory only)
  lastScanFrontPhoto: string | null;
  lastScanSidePhoto: string | null;
  saveScanPhotos: (front: string, side: string) => void;

  // Scan History
  scanHistory: ScanEntry[];
  addScan: (scan: Omit<ScanEntry, 'id' | 'date'>) => void;
  clearScanHistory: () => void;

  // Clothing / Avatar
  selectedClothing: number;
  setSelectedClothing: (index: number) => void;
  selectedFit: 'Slim' | 'Regular' | 'Relaxed';
  setSelectedFit: (fit: 'Slim' | 'Regular' | 'Relaxed') => void;
  selectedViewAngle: 'L' | 'F' | 'R' | 'B';
  setSelectedViewAngle: (angle: 'L' | 'F' | 'R' | 'B') => void;

  // Secure Storage
  saveSecureMeasurements: (measurements: Measurements) => Promise<void>;
  loadSecureMeasurements: () => Promise<Measurements | null>;
  deleteSecureMeasurements: () => Promise<void>;

  // Reset
  clearUserData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
  // User Profile
  user: {
    name: '',
    email: '',
    phone: '',
    gender: 'male',
  },
  setUser: (user) =>
    set((state) => ({ user: { ...state.user, ...user } })),

  // Measurements
  measurements: {
    chest: 94,
    waist: 78,
    hips: 97,
    shoulder: 46,
    inseam: 81,
    neck: 38,
    arms: 35,
    height: 175,
    weight: 70,
    age: 28,
  },
  setMeasurements: (measurements) =>
    set((state) => ({ measurements: { ...state.measurements, ...measurements } })),

  // Size
  selectedSize: 'M',
  setSelectedSize: (size) => set({ selectedSize: size }),

  // Capture Flow
  captureStep: 0,
  setCaptureStep: (step) => set({ captureStep: step }),
  resetCapture: () => set({ captureStep: 0 }),
  capturedPhotos: [],
  addCapturedPhoto: (uri) =>
    set((state) => ({ capturedPhotos: [...state.capturedPhotos, uri] })),
  clearCapturedPhotos: () => set({ capturedPhotos: [] }),

  // Last Scan Photos
  lastScanFrontPhoto: null,
  lastScanSidePhoto: null,
  saveScanPhotos: (front, side) =>
    set({ lastScanFrontPhoto: front, lastScanSidePhoto: side }),

  // Scan History
  scanHistory: [],
  addScan: (scan) =>
    set((state) => ({
      scanHistory: [
        {
          ...scan,
          id: String(Date.now()),
          date: new Date().toISOString(),
        },
        ...state.scanHistory,
      ].slice(0, 10),
    })),
  clearScanHistory: () => set({ scanHistory: [] }),

  // Clothing / Avatar
  selectedClothing: 0,
  setSelectedClothing: (index) => set({ selectedClothing: index }),
  selectedFit: 'Regular',
  setSelectedFit: (fit) => set({ selectedFit: fit }),
  selectedViewAngle: 'F',
  setSelectedViewAngle: (angle) => set({ selectedViewAngle: angle }),

  // Secure Storage Methods
  saveSecureMeasurements: async (measurements: Measurements) => {
    try {
      await SecureStorage.saveMeasurement('measurements', measurements);
    } catch (error) {
      console.error('Failed to save secure measurements:', error);
    }
  },

  loadSecureMeasurements: async () => {
    try {
      return await SecureStorage.getMeasurement('measurements');
    } catch (error) {
      console.error('Failed to load secure measurements:', error);
      return null;
    }
  },

  deleteSecureMeasurements: async () => {
    try {
      await SecureStorage.deleteItem('measurements');
    } catch (error) {
      console.error('Failed to delete secure measurements:', error);
    }
  },

  clearUserData: () => set({
    user: { name: '', email: '', phone: '', gender: 'male' },
    measurements: {
      chest: 94, waist: 78, hips: 97, shoulder: 46,
      inseam: 81, neck: 38, arms: 35, height: 175, weight: 70, age: 28,
    },
    selectedSize: 'M',
    captureStep: 0,
    capturedPhotos: [],
    lastScanFrontPhoto: null,
    lastScanSidePhoto: null,
    scanHistory: [],
    selectedClothing: 0,
    selectedFit: 'Regular',
    selectedViewAngle: 'F',
  }),
}),
    {
      name: 'bodyfitai-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        measurements: state.measurements,
        selectedSize: state.selectedSize,
        scanHistory: state.scanHistory,
        selectedClothing: state.selectedClothing,
        selectedFit: state.selectedFit,
        selectedViewAngle: state.selectedViewAngle,
      }),
    }
  )
);
