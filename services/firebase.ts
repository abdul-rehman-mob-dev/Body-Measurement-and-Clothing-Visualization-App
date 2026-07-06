import { initializeApp } from 'firebase/app';
// @ts-ignore - getReactNativePersistence is available at runtime via React Native entry point
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCESxP4H97_yO5bXWBvXWyfW_sLIhIRmlQ",
  authDomain: "reactnative-firebase-training.firebaseapp.com",
  databaseURL: "https://reactnative-firebase-training-default-rtdb.firebaseio.com",
  projectId: "reactnative-firebase-training",
  storageBucket: "reactnative-firebase-training.firebasestorage.app",
  messagingSenderId: "372020902449",
  appId: "1:372020902449:web:584e67c09e14ff02a63310",
  measurementId: "G-X2M4D64XFC"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
