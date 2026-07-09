import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID';
const APPLE_SERVICE_ID = 'YOUR_APPLE_SERVICE_ID';

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

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'bodyfitai',
      path: 'redirect',
    });

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    if (result.type === 'success' && result.params.code) {
      const credential = GoogleAuthProvider.credential(null, result.params.code);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    }

    throw new Error('Google sign-in was cancelled');
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signInWithApple = async (): Promise<User> => {
  try {
    const nonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce
    );

    const request = new AuthSession.AuthRequest({
      clientId: APPLE_SERVICE_ID,
      scopes: ['name', 'email'],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'bodyfitai',
        path: 'redirect',
      }),
      responseType: AuthSession.ResponseType.Code,
      extraParams: {
        nonce: hashedNonce,
      },
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
    });

    if (result.type === 'success' && result.params.code) {
      const credential = new OAuthProvider('apple.com').credential({
        idToken: result.params.id_token,
        rawNonce: nonce,
      });

      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    }

    throw new Error('Apple sign-in was cancelled');
  } catch (error) {
    console.error('Apple sign-in error:', error);
    throw error;
  }
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
