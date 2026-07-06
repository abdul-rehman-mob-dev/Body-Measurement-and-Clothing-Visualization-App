import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Scan History
  scanHistory: ScanEntry[];
  addScan: (scan: Omit<ScanEntry, 'id' | 'date'>) => void;

  // Clothing / Avatar
  selectedClothing: number;
  setSelectedClothing: (index: number) => void;
  selectedFit: 'Slim' | 'Regular' | 'Relaxed';
  setSelectedFit: (fit: 'Slim' | 'Regular' | 'Relaxed') => void;
  selectedViewAngle: 'L' | 'F' | 'R' | 'B';
  setSelectedViewAngle: (angle: 'L' | 'F' | 'R' | 'B') => void;
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

  // Clothing / Avatar
  selectedClothing: 0,
  setSelectedClothing: (index) => set({ selectedClothing: index }),
  selectedFit: 'Regular',
  setSelectedFit: (fit) => set({ selectedFit: fit }),
  selectedViewAngle: 'F',
  setSelectedViewAngle: (angle) => set({ selectedViewAngle: angle }),
}),
    {
      name: 'bodyfitai-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
