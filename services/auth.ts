import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  age: number;
  profileImage?: string;
  createdAt: Date;
}

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential.user;
};

export const signIn = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

export const saveUserProfile = async (
  uid: string,
  profile: Omit<UserProfile, 'uid' | 'createdAt'>
): Promise<void> => {
  await setDoc(doc(db, 'users', uid), {
    ...profile,
    createdAt: new Date(),
  });
};

export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid, ...docSnap.data() } as UserProfile;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
